import { Suspense } from "react";
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

export default function InvoiceViewPage({ params }: Props) {
  return (
    <Suspense fallback={<InvoiceLoadingSkeleton />}>
      <InvoiceContent params={params} />
    </Suspense>
  );
}

async function InvoiceContent({ params }: { params: Props["params"] }) {
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
    Invoice.findOne({ _id: invoiceId, businessId }).lean(),
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

function InvoiceLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 animate-pulse">
      <div className="max-w-2xl mx-auto p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-px bg-gray-200 dark:bg-gray-800 my-6" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        ))}
      </div>
    </div>
  );
}
