import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import Business from "@/models/Business";
import Customer from "@/models/Customer";
import InventoryLog from "@/models/InventoryLog";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    // Use businessId from the authenticated session — never trust a client-supplied value
    const sessionBusinessId = (session.user as { businessId?: string })?.businessId;
    if (!sessionBusinessId) {
      return NextResponse.json(
        { success: false, error: "No business associated with this account" },
        { status: 403 }
      );
    }

    const {
      items,
      customerName,
      customerPhone,
      paymentMethod,
      discount,
      subtotal,
      cgst,
      sgst,
      total,
    } = await req.json();

    const businessId = sessionBusinessId;

    if (!items?.length) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    // Get or create business
    const business = await Business.findById(businessId).lean();
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    // Check and update stock
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

    // Get or create customer
    let customerId: string | undefined;
    if (customerPhone) {
      const customer = await Customer.findOneAndUpdate(
        { businessId, phone: customerPhone },
        {
          $set: { name: customerName || "Customer" },
          $inc: { totalOrders: 1, totalSpent: total },
          $setOnInsert: { loyaltyPoints: 0 },
          lastOrderAt: new Date(),
        },
        { upsert: true, new: true }
      );
      customerId = customer._id.toString();
    }

    // Generate invoice number
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $inc: { "settings.invoiceCounter": 1 } },
      { new: true }
    );
    const invoiceNumber = `${updatedBusiness?.settings?.invoicePrefix ?? "INV"}${String(
      updatedBusiness?.settings?.invoiceCounter ?? 1
    ).padStart(5, "0")}`;

    // Create invoice items
    const invoiceItems = items.map(
      (item: {
        productId: string;
        name: string;
        nameGu?: string;
        price: number;
        quantity: number;
        discount: number;
        gst: number;
      }) => ({
        productId: item.productId,
        name: item.name,
        nameGu: item.nameGu,
        quantity: item.quantity,
        price: item.price * (1 - item.discount / 100),
        discount: item.discount,
        gstPercentage: item.gst,
        total: item.price * (1 - item.discount / 100) * item.quantity,
      })
    );

    // Create invoice
    const invoice = await Invoice.create({
      businessId,
      invoiceNumber,
      customerId,
      customerName: customerName || "Walk-in Customer",
      customerPhone,
      items: invoiceItems,
      subtotal,
      discountAmount: discount,
      cgst,
      sgst,
      igst: 0,
      total,
      status: "paid",
      paymentMethod,
      paidAt: new Date(),
      createdBy: userId,
    });

    // Update stock and log inventory
    await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
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
            reference: invoiceNumber,
            createdBy: userId,
          });
        }
      })
    );

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
