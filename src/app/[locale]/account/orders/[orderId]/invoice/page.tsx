import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";
import Business from "@/models/Business";
import mongoose from "mongoose";

interface Props {
  params: Promise<{ locale: string; orderId: string }>;
}

export default async function CustomerOrderInvoicePage({ params }: Props) {
  const { locale, orderId } = await params;
  const session = await auth();

  // 1. Authenticate user
  if (!session?.user?.email) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/account/orders/${orderId}/invoice`);
  }

  // 2. Validate orderId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    notFound();
  }

  await connectDB();

  // 3. Fetch order
  const order = await Order.findById(orderId);
  if (!order) {
    notFound();
  }

  // 4. Security isolation check: only the customer who placed the order can view/print it
  if (
    !order.customerEmail ||
    order.customerEmail.toLowerCase() !== session.user.email.toLowerCase()
  ) {
    redirect(`/${locale}/account/orders`);
  }

  // 5. Look for existing invoice
  let invoice = await Invoice.findOne({ orderId: order._id });

  // 6. Generate invoice dynamically if it doesn't exist
  if (!invoice) {
    const business = await Business.findById(order.businessId).select("ownerId settings");
    if (!business) {
      notFound();
    }

    const createdBy = business.ownerId;
    const totalTax = order.taxAmount ?? 0;
    const halfTax = totalTax / 2;

    const invoiceItems = order.items.map(
      (item: {
        productId: mongoose.Types.ObjectId;
        name: string;
        nameGu?: string;
        sku?: string;
        quantity: number;
        price: number;
        discount?: number;
        gst?: number;
        total: number;
      }) => ({
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

  // 7. Redirect to the print-ready invoice viewer page
  redirect(`/${locale}/invoice/${order.businessId}/${invoice._id}`);
}
