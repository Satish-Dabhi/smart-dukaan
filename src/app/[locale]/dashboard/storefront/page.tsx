import { Suspense } from "react";
import { getCachedSession as auth } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, QrCode } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Storefront" };

async function StorefrontContent({ locale }: { locale: string }) {
  const session = await auth();
  const businessId = session?.user?.businessId;

  if (!businessId) {
    redirect(`/${locale}/dashboard/settings`);
  }

  await connectDB();
  const business = await Business.findById(businessId).lean();

  if (!business) {
    redirect(`/${locale}/dashboard/settings`);
  }

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/business/${business.slug}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Storefront</h1>
        <p className="text-sm text-gray-500 mt-1">Share your online store with customers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store URL</CardTitle>
          <CardDescription>Share this link with your customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-violet-600 flex-1 truncate">{storeUrl}</p>
            <button
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              onClick={undefined}
            >
              Copy
            </button>
          </div>

          <div className="flex gap-3">
            <Link href={storeUrl} target="_blank" className="flex-1">
              <Button variant="gradient" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Visit Your Store
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/qr-codes`}>
              <Button variant="outline" className="gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Business Name</span>
            <span className="font-medium">{business.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Theme</span>
            <span className="font-medium capitalize">{business.theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium capitalize ${business.status === "active" ? "text-emerald-600" : "text-gray-500"}`}>
              {business.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">WhatsApp Orders</span>
            <span className="font-medium">
              {business.whatsappNumber ? "✅ Enabled" : "❌ Not configured"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function StorefrontPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense>
      <StorefrontContent locale={locale} />
    </Suspense>
  );
}
