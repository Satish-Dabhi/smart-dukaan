import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import InventoryLog from "@/models/InventoryLog";
import Notification from "@/models/Notification";
import type { CartItem } from "@/types";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "15");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { businessId };

    const status = searchParams.get("status");
    if (status) query.status = status;

    const q = searchParams.get("q");
    if (q) {
      query.$or = [
        { orderNumber: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { customerPhone: { $regex: q, $options: "i" } },
      ];
    }

    await connectDB();
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page, limit, total,
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
    const session = await auth();
    const creatorId = session?.user?.id;

    const body = await req.json();
    const {
      businessId,
      items,
      customerName,
      customerPhone,
      customerEmail,
      subtotal,
      discount = 0,
      taxAmount = 0,
      total,
      notes,
      paymentMethod = "cod",
    } = body as {
      businessId: string;
      items: CartItem[];
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      subtotal: number;
      discount?: number;
      taxAmount?: number;
      total: number;
      notes?: string;
      paymentMethod?: string;
    };

    if (!businessId || !items?.length || !total) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, businessId });
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.name} not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${item.name}` },
          { status: 400 }
        );
      }
    }

    let customerId: string | undefined;
    if (customerPhone) {
      const customer = await Customer.findOneAndUpdate(
        { businessId, phone: customerPhone },
        {
          $set: { name: customerName || "Online Customer" },
          $inc: { totalOrders: 1, totalSpent: total },
          $setOnInsert: { loyaltyPoints: 0 },
          lastOrderAt: new Date(),
        },
        { upsert: true, new: true }
      );
      customerId = customer._id.toString();
    }

    const count = await Order.countDocuments({ businessId });
    const orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;

    const order = await Order.create({
      businessId,
      orderNumber,
      customerId,
      customerName: customerName || "Online Customer",
      customerPhone,
      customerEmail,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount ?? 0,
        gst: item.gst ?? 0,
        total: item.price * (1 - (item.discount ?? 0) / 100) * item.quantity,
      })),
      subtotal,
      discount,
      taxAmount,
      total,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      notes,
      source: "online",
      whatsappOrder: false,
    });

    await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (product) {
          const previousStock = product.stock;
          product.stock -= item.quantity;
          product.totalSold = (product.totalSold || 0) + item.quantity;
          if (product.stock === 0) product.status = "out_of_stock";
          await product.save();

          await InventoryLog.create({
            businessId,
            productId: item.productId,
            type: "sale",
            quantity: -item.quantity,
            previousStock,
            newStock: product.stock,
            reference: orderNumber,
            createdBy: creatorId,
          });
        }
      })
    );

    await Notification.create({
      businessId,
      title: "New Online Order Placed",
      message: `Order ${orderNumber} for ₹${total.toLocaleString("en-IN")} placed by ${customerName || "Online Customer"}`,
      type: "order",
      link: "/dashboard/orders",
    });

    // Send order confirmation email if customer provided an email
    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail, {
        orderNumber,
        customerName: customerName || "Valued Customer",
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          total: item.price * (1 - (item.discount ?? 0) / 100) * item.quantity,
        })),
        subtotal,
        discount,
        taxAmount,
        total,
        paymentMethod,
        notes,
      }).catch((err) => console.error("[EMAIL] Order confirmation failed:", err));
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ success: false, error: "Order placement failed" }, { status: 500 });
  }
}
