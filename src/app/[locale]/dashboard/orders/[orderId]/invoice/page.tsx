import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order, { IOrderDoc } from "@/models/Order";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import Business from "@/models/Business";
import { requireBusinessAuth } from "@/lib/require-auth";
import mongoose from "mongoose";

interface Props {
  params: Promise<{ locale: string; orderId: string }>;
}

export default async function OrderInvoiceRedirectPage({ params }: Props) {
  const { locale, orderId } = await params;
  const { businessId, session } = await requireBusinessAuth();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    notFound();
  }

  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) {
    notFound();
  }

  // Security isolation: verify the order belongs to this merchant's business
  if (order.businessId.toString() !== businessId) {
    redirect(`/${locale}/dashboard`);
  }

  // Check if an invoice has already been generated for this order
  let invoice = await Invoice.findOne({ orderId: order._id });

  if (!invoice) {
    // Dynamically generate the invoice!
    const business = await Business.findById(businessId).select(
      "name address phone gstNumber settings"
    );
    if (!business) {
      notFound();
    }

    // Attempt to attribute creation to the business owner user id, otherwise the session user
    const owner = await User.findOne({
      businessId: order.businessId,
      role: "business_owner",
    }).select("_id");
    const createdBy = owner?._id || new mongoose.Types.ObjectId(session.user.id);

    // Split taxes equally into intra-state CGST & SGST
    const totalTax = order.taxAmount ?? 0;
    const halfTax = totalTax / 2;

    const invoiceItems = order.items.map(
      (item: IOrderDoc["items"][number] & { nameGu?: string; sku?: string }) => ({
        productId: item.productId,
        name: item.name,
        nameGu: item.nameGu,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount ?? 0,
        gstPercentage: item.gst ?? 0,
        total: item.price * item.quantity,
      })
    );

    // Create the invoice matching the order's metadata
    invoice = await Invoice.create({
      businessId: order.businessId,
      invoiceNumber: order.orderNumber.replace("ORD-", business.settings?.invoicePrefix || "INV"),
      orderId: order._id,
      customerId: order.customerId ? new mongoose.Types.ObjectId(order.customerId) : undefined,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      items: invoiceItems,
      subtotal: order.subtotal,
      discountAmount: order.discount ?? 0,
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      total: order.total,
      status: order.paymentStatus === "paid" ? "paid" : "unpaid",
      paymentMethod: order.paymentMethod || "cash",
      paidAt: order.paymentStatus === "paid" ? new Date() : undefined,
      createdBy,
    });
  }

  // Redirect to the print-ready tax invoice viewer page
  redirect(`/${locale}/invoice/${businessId}/${invoice._id}`);
}
