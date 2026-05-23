"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";
import { SubscriptionBanner } from "./subscription-banner";
import type { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Building2, Package, Store, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { getSubscriptionInfo } from "@/lib/subscription";

interface DashboardShellProps {
  children: React.ReactNode;
  locale: string;
  session: Session;
  subscriptionInfo?: ReturnType<typeof getSubscriptionInfo> | null;
}

export function DashboardShell({ children, locale, session, subscriptionInfo }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [onboardingStep, setOnboardingStep] = useState<string>("completed");

  const businessId = session.user.businessId;
  const role = session.user.role;

  // Initialize onboarding step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (role === "super_admin") {
        setOnboardingStep("completed");
        return;
      }

      const currentStep = localStorage.getItem("smartdukaan_onboarding_step");
      if (currentStep) {
        setOnboardingStep(currentStep);
      } else if (businessId) {
        localStorage.setItem("smartdukaan_onboarding_step", "completed");
        setOnboardingStep("completed");
      } else {
        localStorage.setItem("smartdukaan_onboarding_step", "create_business");
        setOnboardingStep("create_business");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [businessId, role]);

  // Sync state dynamically when storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const step = localStorage.getItem("smartdukaan_onboarding_step");
      if (step) setOnboardingStep(step);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("onboarding_step_change", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("onboarding_step_change", handleStorageChange);
    };
  }, []);

  // Enforce route protection during onboarding
  useEffect(() => {
    if (role === "super_admin" || onboardingStep === "completed") return;

    const isSettingsPage = pathname.endsWith("/settings");
    const isProductsPage = pathname.endsWith("/products");
    const isStorefrontPage = pathname.endsWith("/storefront");

    if (onboardingStep === "create_business" && !isSettingsPage) {
      router.replace(`/${locale}/dashboard/settings`);
    } else if (onboardingStep === "add_product" && !isSettingsPage && !isProductsPage) {
      router.replace(`/${locale}/dashboard/products`);
    } else if (
      onboardingStep === "visit_storefront" &&
      !isSettingsPage &&
      !isProductsPage &&
      !isStorefrontPage
    ) {
      router.replace(`/${locale}/dashboard/storefront`);
    }
  }, [onboardingStep, pathname, locale, router, role]);

  const renderOnboardingBanner = () => {
    if (role === "super_admin" || onboardingStep === "completed") return null;

    let progressWidth = "w-1/3";
    let stepTitle = "";
    let stepDescription = "";
    let stepIcon = <Building2 className="w-5 h-5" />;
    let targetLink = `/${locale}/dashboard/settings`;

    if (onboardingStep === "create_business") {
      progressWidth = "w-1/3";
      stepTitle = "Step 1: Create your Business profile";
      stepDescription = "To unlock the system, you must first register your business credentials.";
      stepIcon = <Building2 className="w-5 h-5 text-indigo-200" />;
      targetLink = `/${locale}/dashboard/settings`;
    } else if (onboardingStep === "add_product") {
      progressWidth = "w-2/3";
      stepTitle = "Step 2: Add your first Product";
      stepDescription = "Great job! Now let's register a product to show on your website.";
      stepIcon = <Package className="w-5 h-5 text-indigo-200" />;
      targetLink = `/${locale}/dashboard/products`;
    } else if (onboardingStep === "visit_storefront") {
      progressWidth = "w-full";
      stepTitle = "Step 3: Preview/Copy your storefront URL";
      stepDescription =
        "Almost there! Visit or copy your storefront link to launch and complete onboarding.";
      stepIcon = <Store className="w-5 h-5 text-indigo-200" />;
      targetLink = `/${locale}/dashboard/storefront`;
    }

    return (
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 text-white py-3 px-4 sm:px-6 shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg animate-pulse shrink-0">{stepIcon}</div>
            <div>
              <p className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-300 animate-spin" />
                {stepTitle}
              </p>
              <p className="text-xs text-indigo-100">{stepDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Progress indicator */}
            <div className="hidden lg:block w-32 bg-white/20 h-1.5 rounded-full overflow-hidden shrink-0">
              <div
                className={cn(
                  "bg-pink-300 h-full rounded-full transition-all duration-500",
                  progressWidth
                )}
              />
            </div>

            <button
              onClick={() => router.push(targetLink)}
              className="w-full md:w-auto py-1.5 px-4 bg-white text-violet-700 hover:bg-violet-50 text-xs font-bold rounded-lg shadow transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 group"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden relative w-full">
      <DashboardSidebar
        locale={locale}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        role={role}
        businessId={businessId}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          session={session}
          locale={locale}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {subscriptionInfo && role !== "super_admin" && (
          <SubscriptionBanner
            plan={subscriptionInfo.plan}
            status={subscriptionInfo.status}
            daysRemaining={subscriptionInfo.daysRemaining}
            locale={locale}
          />
        )}
        {renderOnboardingBanner()}
        <main className="flex-1 overflow-auto p-4 sm:p-6 page-transition">{children}</main>
      </div>
    </div>
  );
}
