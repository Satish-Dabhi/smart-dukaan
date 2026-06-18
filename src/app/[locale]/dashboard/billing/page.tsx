import { requireBusinessAuth } from "@/lib/require-auth";
import { getSubscriptionInfo } from "@/lib/subscription";
import { getBusinessForDashboard } from "@/lib/get-business-for-dashboard";
import { ensurePlansSeeded, getPlanBySlug } from "@/lib/seed-plans";
import Plan from "@/models/Plan";
import { connectDB } from "@/lib/db";
import { formatLimit, formatAnalytics } from "@/lib/plans";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Zap,
  Crown,
  Mail,
  Building2,
  PackageCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Billing & Plans — SmartDukaan" };

const planGradients: Record<string, string> = {
  trial: "from-sky-500 to-cyan-500",
  starter: "from-blue-500 to-indigo-500",
  pro: "from-violet-600 to-purple-600",
  enterprise: "from-amber-500 to-orange-500",
};

const planIconMap: Record<string, React.ReactNode> = {
  trial: <Clock className="w-5 h-5" />,
  starter: <Zap className="w-5 h-5" />,
  pro: <Building2 className="w-5 h-5" />,
  enterprise: <Crown className="w-5 h-5" />,
};

function getGradient(slug: string) {
  return planGradients[slug] ?? "from-violet-600 to-indigo-600";
}

function getIcon(slug: string) {
  return planIconMap[slug] ?? <PackageCheck className="w-5 h-5" />;
}

function FeatureRow({ label, value }: { label: string; value: string | boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {typeof value === "boolean" ? (
        value ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )
      ) : (
        <span className="font-semibold text-foreground">{value}</span>
      )}
    </div>
  );
}

export default async function BillingPage() {
  const { businessId } = await requireBusinessAuth();
  const business = await getBusinessForDashboard(businessId);

  await connectDB();
  await ensurePlansSeeded();

  const currentDbPlan = business ? await getPlanBySlug(business.subscriptionPlan ?? "trial") : null;

  const info = business
    ? getSubscriptionInfo(
        business,
        currentDbPlan?.features ?? undefined,
        currentDbPlan?.name ?? undefined
      )
    : null;

  const adminEmail = process.env.SMTP_USER || "support@smartdukaan.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const paidPlans = await Plan.find({ isActive: true, isTrial: false })
    .sort({ sortOrder: 1 })
    .lean();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-violet-600" />
          Billing &amp; Plans
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription plan and track your trial period.
        </p>
      </div>

      {/* Current Plan Card */}
      {info && (
        <Card className="rounded-2xl overflow-hidden border-border">
          <div className={`bg-gradient-to-r ${getGradient(info.plan)} p-5 text-white`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                  Current Plan
                </p>
                <div className="flex items-center gap-2">
                  {getIcon(info.plan)}
                  <h2 className="text-2xl font-black">{info.planName}</h2>
                </div>
                <p className="text-sm text-white/80 mt-1">{currentDbPlan?.description}</p>
              </div>
              <Badge
                className={`font-bold border-0 capitalize ${
                  info.status === "expired"
                    ? "bg-red-500/30 text-red-100"
                    : info.status === "trial"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/30 text-emerald-100"
                }`}
              >
                {info.status === "expired"
                  ? "Expired"
                  : info.status === "trial"
                    ? "Trial"
                    : "Active"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              {info.isExpired ? (
                <div className="flex items-center gap-1.5 text-red-500 font-bold">
                  <AlertTriangle className="w-4 h-4" /> Expired
                </div>
              ) : info.status === "trial" ? (
                <div className="flex items-center gap-1.5 text-sky-600 font-bold">
                  <Clock className="w-4 h-4" />
                  {info.daysRemaining} day{info.daysRemaining !== 1 ? "s" : ""} remaining
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {info.plan === "trial" ? "Trial Expires" : "Renews / Expires"}
              </p>
              <p className="font-semibold text-foreground">
                {info.expiresAt ? formatDate(info.expiresAt.toISOString()) : "No expiry"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Monthly Price
              </p>
              <p className="font-black text-foreground text-lg">
                {currentDbPlan?.priceMonthly === 0
                  ? "Free"
                  : `₹${currentDbPlan?.priceMonthly?.toLocaleString("en-IN") ?? "—"}`}
                {(currentDbPlan?.priceMonthly ?? 0) > 0 && (
                  <span className="text-xs text-muted-foreground font-normal"> /mo</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Features */}
      {info?.features && (
        <div>
          <h2 className="text-lg font-extrabold text-foreground mb-3">Your Plan Features</h2>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-0">
              <FeatureRow label="Products" value={formatLimit(info.features.products)} />
              <FeatureRow label="Staff Accounts" value={formatLimit(info.features.staff)} />
              <FeatureRow label="Customers" value={formatLimit(info.features.customers)} />
              <FeatureRow
                label="Invoices / Month"
                value={formatLimit(info.features.invoicesPerMonth)}
              />
              <FeatureRow
                label="Analytics History"
                value={formatAnalytics(info.features.analyticsHistory)}
              />
              <FeatureRow label="Online Storefront" value={info.features.onlineStorefront} />
              <FeatureRow label="WhatsApp Orders" value={info.features.whatsappOrders} />
              <FeatureRow label="Custom Domain" value={info.features.customDomain} />
              <FeatureRow label="Priority Support" value={info.features.prioritySupport} />
              <FeatureRow label="API Access" value={info.features.apiAccess} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Plans */}
      {paidPlans.length > 0 && (
        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-1">Available Plans</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Choose a plan that fits your business. Contact us to activate it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidPlans.map((plan) => {
              const isCurrent = info?.plan === plan.slug && !info?.isExpired;
              const isPopular = plan.slug === "pro";
              return (
                <Card
                  key={plan._id.toString()}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${
                    isPopular
                      ? "border-violet-400 shadow-lg shadow-violet-100 dark:shadow-violet-900/20"
                      : "border-border"
                  }`}
                >
                  {isPopular && (
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-center text-xs font-bold py-1 tracking-wider uppercase">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradient(plan.slug)} flex items-center justify-center text-white`}
                      >
                        {getIcon(plan.slug)}
                      </div>
                      <h3 className="font-extrabold text-foreground text-lg">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-black text-foreground">
                        ₹{plan.priceMonthly.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-muted-foreground"> /month</span>
                      {plan.priceYearly > 0 && (
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                          or ₹{plan.priceYearly.toLocaleString("en-IN")}/year (save{" "}
                          {Math.round(100 - (plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
                        </p>
                      )}
                    </div>

                    <div className="space-y-0 mb-5">
                      <FeatureRow label="Products" value={formatLimit(plan.features.products)} />
                      <FeatureRow label="Staff Accounts" value={formatLimit(plan.features.staff)} />
                      <FeatureRow
                        label="Invoices/Month"
                        value={formatLimit(plan.features.invoicesPerMonth)}
                      />
                      <FeatureRow
                        label="Analytics"
                        value={formatAnalytics(plan.features.analyticsHistory)}
                      />
                      <FeatureRow label="Custom Domain" value={plan.features.customDomain} />
                      <FeatureRow label="Priority Support" value={plan.features.prioritySupport} />
                    </div>

                    {isCurrent ? (
                      <div className="w-full py-2 text-center text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                        Current Plan
                      </div>
                    ) : (
                      <a
                        href={`mailto:${adminEmail}?subject=${encodeURIComponent(`Upgrade Request — ${plan.name} Plan`)}&body=${encodeURIComponent(`Hi,\n\nI'd like to upgrade my SmartDukaan store to the ${plan.name} plan (₹${plan.priceMonthly}/month).\n\nStore URL: ${appUrl}\n\nPlease get in touch to process the upgrade.\n\nThank you!`)}`}
                        className={`block w-full py-2.5 text-center text-sm font-bold rounded-xl transition-all ${
                          isPopular
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        {info?.isExpired ? "Upgrade Now" : "Choose Plan"}
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact / Help */}
      <Card className="rounded-2xl border-border bg-muted/30">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-bold text-foreground">Need help choosing?</p>
              <p className="text-sm text-muted-foreground">
                Email us and we&apos;ll help you find the right plan for your business.
              </p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl shrink-0" asChild>
            <Link href={`mailto:${adminEmail}?subject=SmartDukaan Plan Help`}>Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
