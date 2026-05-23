import { cache } from "react";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";

// React.cache() deduplicates this call within a single server-side render tree.
// Both the layout (suspension + subscription banner) and the billing page call
// this function with the same businessId — only ONE MongoDB round-trip happens
// per request regardless of how many server components call it.
export const getBusinessForDashboard = cache(async (businessId: string) => {
  await connectDB();
  return Business.findById(businessId)
    .select("status name subscriptionPlan subscriptionExpiresAt trialStartedAt")
    .lean();
});
