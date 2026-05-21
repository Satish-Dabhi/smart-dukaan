"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExternalLink, QrCode, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Business {
  _id: string;
  name: string;
  slug: string;
  theme?: string;
  status: string;
  whatsappNumber?: string;
  [key: string]: unknown;
}

interface StorefrontManagerProps {
  business: Business;
  locale: string;
}

export function StorefrontManager({ business, locale }: StorefrontManagerProps) {
  const [storeUrl, setStoreUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    // Dynamically resolve window origin to bypass any undefined server env issues
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setStoreUrl(`${window.location.origin}/${locale}/business/${business.slug}`);

        const step = localStorage.getItem("smartdukaan_onboarding_step");
        setIsOnboarding(step === "visit_storefront");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [business.slug, locale]);

  const completeOnboarding = () => {
    const step = localStorage.getItem("smartdukaan_onboarding_step");
    if (step === "visit_storefront") {
      localStorage.setItem("smartdukaan_onboarding_step", "completed");
      window.dispatchEvent(new Event("onboarding_step_change"));
      setIsOnboarding(false);

      toast.success("🎉 Onboarding Completed!", {
        description:
          "Your business is now fully live and all dashboard items are unlocked! Welcome to SmartDukaan.",
        duration: 6000,
        icon: <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />,
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      // Try to complete onboarding step upon copy
      completeOnboarding();

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Storefront</h1>
        <p className="text-sm text-gray-500 mt-1">Share your online store with customers</p>
      </div>

      {isOnboarding && (
        <div className="bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-pulse">
          <div className="p-2 bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Final Step: Preview & Share your Store!
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Simply copy your storefront URL or click &quot;Visit Your Store&quot; to verify your
              store layout. This will fully unlock the dashboard menus!
            </p>
          </div>
        </div>
      )}

      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-350">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/10 border-b border-border">
          <CardTitle className="text-base font-bold text-gray-950 dark:text-white">
            Store URL
          </CardTitle>
          <CardDescription>
            Share this link with your customers to get WhatsApp orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/60 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-850">
            <p className="text-sm font-medium text-violet-600 flex-1 truncate select-all">
              {storeUrl || "Loading..."}
            </p>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Link
              href={storeUrl || "#"}
              target="_blank"
              className="flex-1"
              onClick={completeOnboarding}
            >
              <Button variant="gradient" className="w-full gap-2 h-11" disabled={!storeUrl}>
                <ExternalLink className="w-4 h-4" />
                Visit Your Store
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard/qr-codes`}>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 h-11 border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-gray-950 dark:text-white">
            Store Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm p-6 pt-0">
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-gray-500">Business Name</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{business.name}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-gray-500">Theme</span>
            <span className="font-bold capitalize text-gray-800 dark:text-gray-200">
              {business.theme || "minimal"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-gray-500">Status</span>
            <span
              className={`font-bold capitalize px-2.5 py-0.5 rounded-full text-xs shrink-0 ${
                business.status === "active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
              }`}
            >
              {business.status}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-gray-500">WhatsApp Orders</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {business.whatsappNumber ? "✅ Enabled" : "❌ Not configured"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
