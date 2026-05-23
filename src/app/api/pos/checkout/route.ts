import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import Business from "@/models/Business";
import Customer from "@/models/Customer";
import InventoryLog from "@/models/InventoryLog";
import { sendOrderConfirmationEmail } from "@/lib/email";
import mongoose from "mongoose";
import { z } from "zod";

const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  nameGu: z.string().optional(),
  quantity: z.number().int().positive(),
});

const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  paymentMethod: z.string().min(1).default("cash"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const sessionBusinessId = (session.user as { businessId?: string })?.businessId;
    if (!sessionBusinessId) {
      return NextResponse.json(
        { success: false, error: "No business associated with this account" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }
    const { items, customerName, customerPhone, customerEmail, paymentMethod } = parsed.data;

    const businessId = sessionBusinessId;

    await connectDB();

    const business = await Business.findById(businessId)
      .select("name address phone gstNumber settings status")
      .lean();
    if (!business || business.status !== "active") {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    // Load all products in one query — server-side pricing, prevents N+1 + price manipulation
    const productIds = items.map((i) => new mongoose.Types.ObjectId(i.productId));
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      businessId,
    })
      .select("_id name nameGu price discount gstPercentage hsnCode stock status")
      .lean();

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "One or more products not found in this business" },
        { status: 404 }
      );
    }

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    // Validate stock and build invoice items from DB prices (never trust client)
    let computedSubtotal = 0;
    let computedCgst = 0;
    let computedSgst = 0;
    const invoiceItems = [];

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
      const itemGst = itemSubtotal * gstRate;
      // Split GST equally between CGST and SGST for intra-state
      const halfGst = itemGst / 2;

      computedSubtotal += itemSubtotal;
      computedCgst += halfGst;
      computedSgst += halfGst;

      invoiceItems.push({
        productId: product._id,
        name: item.name,
        nameGu: item.nameGu,
        quantity: item.quantity,
        price: unitPrice,
        discount: product.discount ?? 0,
        gstPercentage: product.gstPercentage ?? 0,
        hsnCode: product.hsnCode,
        total: itemSubtotal,
      });
    }

    const computedTotal = computedSubtotal + computedCgst + computedSgst;

    // Upsert customer
    let customerId: string | undefined;
    if (customerPhone) {
      const customer = await Customer.findOneAndUpdate(
        { businessId, phone: customerPhone },
        {
          $set: { name: customerName || "Customer", lastOrderAt: new Date() },
          $inc: { totalOrders: 1, totalSpent: computedTotal },
          $setOnInsert: { loyaltyPoints: 0 },
        },
        { upsert: true, new: true }
      );
      customerId = customer._id.toString();
    }

    // Generate invoice number atomically
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $inc: { "settings.invoiceCounter": 1 } },
      { new: true }
    );
    const invoiceNumber = `${updatedBusiness?.settings?.invoicePrefix ?? "INV"}${String(
      updatedBusiness?.settings?.invoiceCounter ?? 1
    ).padStart(5, "0")}`;

    const invoice = await Invoice.create({
      businessId,
      invoiceNumber,
      customerId,
      customerName: customerName || "Walk-in Customer",
      customerPhone,
      customerEmail: customerEmail || undefined,
      items: invoiceItems,
      subtotal: computedSubtotal,
      discountAmount: 0,
      cgst: computedCgst,
      sgst: computedSgst,
      igst: 0,
      total: computedTotal,
      status: "paid",
      paymentMethod,
      paidAt: new Date(),
      createdBy: userId,
    });

    // Atomic stock decrement — bulkWrite with $inc to prevent race conditions
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
      await Invoice.findByIdAndDelete(invoice._id);
      return NextResponse.json(
        { success: false, error: "Stock update failed — please retry" },
        { status: 409 }
      );
    }

    // Mark zero-stock products out_of_stock
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
          reference: invoiceNumber,
          createdBy: userId,
        };
      })
    );

    if (customerEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const invoiceUrl = appUrl ? `${appUrl}/en/invoice/${businessId}/${invoice._id}` : undefined;
      sendOrderConfirmationEmail(customerEmail, {
        orderNumber: invoiceNumber,
        customerName: customerName || "Valued Customer",
        items: invoiceItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
        subtotal: computedSubtotal,
        discount: 0,
        taxAmount: computedCgst + computedSgst,
        total: computedTotal,
        paymentMethod,
        notes: invoiceUrl ? `View your invoice: ${invoiceUrl}` : undefined,
      }).catch((err) => console.error("[EMAIL] POS invoice email failed:", err));
    }

    return NextResponse.json({
      success: true,
      data: {
        ...invoice.toObject(),
        businessName: business.name,
        businessAddress: business.address,
        businessPhone: business.phone,
        gstNumber: business.gstNumber,
      },
    });
  } catch (error) {
    console.error("POST /api/pos/checkout:", error);
    return NextResponse.json({ success: false, error: "Checkout failed" }, { status: 500 });
  }
}
