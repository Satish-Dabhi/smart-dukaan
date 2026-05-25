import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import InventoryLog from "@/models/InventoryLog";
import Notification from "@/models/Notification";
import Business from "@/models/Business";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { escapeRegex } from "@/lib/utils";
import mongoose from "mongoose";
import { z } from "zod";
import { redis } from "@/lib/redis";

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  discount: z.number().min(0).max(100).default(0),
  gst: z.number().min(0).max(28).default(0),
});

const OnlineOrderSchema = z.object({
  businessId: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  paymentMethod: z.enum(["cod", "upi", "card", "online"]).default("cod"),
  notes: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "15")));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { businessId };

    const status = searchParams.get("status");
    if (status) query.status = status;

    const q = searchParams.get("q");
    if (q) {
      const safe = escapeRegex(q.trim().slice(0, 100));
      query.$or = [
        { orderNumber: { $regex: safe, $options: "i" } },
        { customerName: { $regex: safe, $options: "i" } },
        { customerPhone: { $regex: safe, $options: "i" } },
      ];
    }

    await connectDB();
    const [orders, total] = await Promise.all([
      Order.find(query).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Online storefront orders are public — no session required.
    // BUT businessId comes from the body and we validate the business exists and is active.
    const session = await auth();
    const creatorId = session?.user?.id;

    const body = await req.json();
    const parsed = OnlineOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }
    const { businessId, items, customerName, customerPhone, customerEmail, paymentMethod, notes } =
      parsed.data;

    await connectDB();

    // Verify the business is active — don't trust a suspended/inactive business
    const business = await Business.findById(businessId).select("status settings name").lean();
    if (!business || business.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Business not found or inactive" },
        { status: 404 }
      );
    }

    // Server-side: load all products in ONE query (prevents N+1 and prevents client price manipulation)
    const productIds = items.map((i) => new mongoose.Types.ObjectId(i.productId));
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      businessId,
      status: "active",
    })
      .select("_id name price discount gstPercentage stock status")
      .lean();

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "One or more products are unavailable" },
        { status: 400 }
      );
    }

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    // Validate stock and build order items from DB prices (never trust client prices)
    let computedSubtotal = 0;
    let computedTaxAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const discountRate = (product.discount ?? 0) / 100;
      const unitPrice = product.price * (1 - discountRate);
      const itemSubtotal = unitPrice * item.quantity;
      const gstRate = (product.gstPercentage ?? 0) / 100;
      const itemTax = itemSubtotal * gstRate;

      computedSubtotal += itemSubtotal;
      computedTaxAmount += itemTax;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        discount: product.discount ?? 0,
        gst: product.gstPercentage ?? 0,
        total: itemSubtotal,
      });
    }

    const computedTotal = computedSubtotal + computedTaxAmount;

    // Upsert customer if phone provided
    let customerId: string | undefined;
    if (customerPhone) {
      const customer = await Customer.findOneAndUpdate(
        { businessId, phone: customerPhone },
        {
          $set: { name: customerName || "Online Customer", lastOrderAt: new Date() },
          $inc: { totalOrders: 1, totalSpent: computedTotal },
          $setOnInsert: { loyaltyPoints: 0 },
        },
        { upsert: true, new: true }
      );
      customerId = customer._id.toString();
    }

    // Generate order number atomically via the business counter
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $inc: { "settings.invoiceCounter": 1 } },
      { new: true }
    );
    const orderNumber = `ORD-${String(updatedBusiness?.settings?.invoiceCounter ?? 1).padStart(5, "0")}`;

    const order = await Order.create({
      businessId,
      orderNumber,
      customerId,
      customerName: customerName || "Online Customer",
      customerPhone,
      customerEmail,
      items: orderItems,
      subtotal: computedSubtotal,
      discount: 0,
      taxAmount: computedTaxAmount,
      total: computedTotal,
      status: "placed",
      paymentMethod,
      paymentStatus: "pending",
      notes,
      source: "online",
      whatsappOrder: false,
    });

    // Atomic stock decrement — use bulkWrite with $inc to avoid race conditions
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(item.productId),
          businessId,
          stock: { $gte: item.quantity },
        },
        update: {
          $inc: { stock: -item.quantity, totalSold: item.quantity },
        },
      },
    }));
    const bulkResult = await Product.bulkWrite(bulkOps, { ordered: false });

    if (bulkResult.modifiedCount !== items.length) {
      // Rollback order if stock update partially failed
      await Order.findByIdAndDelete(order._id);
      return NextResponse.json(
        { success: false, error: "Stock update failed. Some items may be out of stock." },
        { status: 409 }
      );
    }

    // Mark any zero-stock products as out_of_stock
    const zeroStockIds = dbProducts
      .filter((p) => {
        const item = items.find((i) => i.productId === p._id.toString());
        return item && p.stock - item.quantity === 0;
      })
      .map((p) => p._id);
    if (zeroStockIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: zeroStockIds }, stock: 0 },
        { $set: { status: "out_of_stock" } }
      );
    }

    // Batch inventory logs
    await InventoryLog.insertMany(
      items.map((item) => {
        const dbProduct = productMap.get(item.productId)!;
        return {
          businessId,
          productId: item.productId,
          type: "sale",
          quantity: -item.quantity,
          previousStock: dbProduct.stock,
          newStock: dbProduct.stock - item.quantity,
          reference: orderNumber,
          createdBy: creatorId,
        };
      })
    );

    await Notification.create({
      businessId,
      title: "New Online Order Placed",
      message: `Order ${orderNumber} for ₹${computedTotal.toFixed(2)} placed by ${customerName || "Online Customer"}`,
      type: "order",
      link: "/dashboard/orders",
    });

    if (redis) {
      try {
        await Promise.all([
          redis.del(`notifications:${businessId}`),
          redis.del(`notifications:${businessId}:unread`),
        ]);
      } catch (cacheError) {
        console.error("Redis cache eviction error on new order:", cacheError);
      }
    }

    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail, {
        orderNumber,
        customerName: customerName || "Valued Customer",
        items: orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          discount: i.discount,
          total: i.total,
        })),
        subtotal: computedSubtotal,
        discount: 0,
        taxAmount: computedTaxAmount,
        total: computedTotal,
        paymentMethod,
        notes,
      }).catch((err) => console.error("[EMAIL] Order confirmation failed:", err));
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ success: false, error: "Order placement failed" }, { status: 500 });
  }
}
