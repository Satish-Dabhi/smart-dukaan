import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Plan from "@/models/Plan";
import Product from "@/models/Product";
import Invoice from "@/models/Invoice";
import { DEFAULT_PLANS } from "@/lib/plans";
import type { IPlanFeatures } from "@/models/Plan";

async function getPlanFeaturesForBusiness(businessId: string): Promise<IPlanFeatures> {
  await connectDB();
  const business = await Business.findById(businessId).select("subscriptionPlan").lean();
  const slug = (business?.subscriptionPlan as string) ?? "trial";

  const dbPlan = await Plan.findOne({ slug }).select("features").lean();
  if (dbPlan?.features) return dbPlan.features as IPlanFeatures;

  return DEFAULT_PLANS.find((p) => p.slug === slug)?.features ?? DEFAULT_PLANS[0].features;
}

export async function checkProductLimit(
  businessId: string
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const features = await getPlanFeaturesForBusiness(businessId);
  const limit = features.products;
  if (limit === -1) return { allowed: true, limit: -1, current: 0 };

  const current = await Product.countDocuments({ businessId });
  return { allowed: current < limit, limit, current };
}

export async function checkInvoiceMonthlyLimit(
  businessId: string
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const features = await getPlanFeaturesForBusiness(businessId);
  const limit = features.invoicesPerMonth;
  if (limit === -1) return { allowed: true, limit: -1, current: 0 };

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const current = await Invoice.countDocuments({
    businessId,
    createdAt: { $gte: start },
  });
  return { allowed: current < limit, limit, current };
}

export async function getAnalyticsHistoryDays(businessId: string): Promise<number> {
  const features = await getPlanFeaturesForBusiness(businessId);
  return features.analyticsHistory;
}

export async function checkFeatureAccess(
  businessId: string,
  feature: keyof IPlanFeatures
): Promise<boolean> {
  const features = await getPlanFeaturesForBusiness(businessId);
  const value = features[feature];
  if (typeof value === "boolean") return value;
  return value === -1 || (value as number) > 0;
}
