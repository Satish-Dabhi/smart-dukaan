import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Plan from "@/models/Plan";
import { getSubscriptionInfo } from "@/lib/subscription";
import { ensurePlansSeeded } from "@/lib/seed-plans";

export async function GET() {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await ensurePlansSeeded();

    const business = await Business.findById(businessId)
      .select("subscriptionPlan subscriptionExpiresAt trialStartedAt status")
      .lean();

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const dbPlan = await Plan.findOne({ slug: business.subscriptionPlan }).lean();
    const info = getSubscriptionInfo(
      business,
      dbPlan?.features ?? undefined,
      dbPlan?.name ?? undefined
    );

    const availablePlans = await Plan.find({ isActive: true, isTrial: false })
      .sort({ sortOrder: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...info,
        availablePlans,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
