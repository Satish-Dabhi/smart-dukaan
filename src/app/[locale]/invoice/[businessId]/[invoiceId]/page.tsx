import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Business from "@/models/Business";
import mongoose from "mongoose";
import { InvoicePrintPage } from "@/components/invoice/invoice-print-page";

interface Props {
  params: Promise<{ locale: string; businessId: string; invoiceId: string }>;
}

export default async function InvoiceViewPage({ params }: Props) {
  const { locale, businessId, invoiceId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/invoice/${businessId}/${invoiceId}`);
  }

  if (
    !mongoose.Types.ObjectId.isValid(businessId) ||
    !mongoose.Types.ObjectId.isValid(invoiceId)
  ) {
    notFound();
  }

  await connectDB();

  const [invoice, business] = await Promise.all([
    Invoice.findOne({
      _id: invoiceId,
      businessId,
    }).lean(),
    Business.findById(businessId).lean(),
  ]);

  if (!invoice || !business) notFound();

  const userBusinessId = session.user.businessId;
  const userEmail = session.user.email;

  const isOwner = userBusinessId === businessId;
  const isCustomer = userEmail && invoice.customerEmail === userEmail;

  if (!isOwner && !isCustomer) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/invoice/${businessId}/${invoiceId}`);
  }

  const data = JSON.parse(JSON.stringify({ invoice, business }));

  return <InvoicePrintPage invoice={data.invoice} business={data.business} />;
}
