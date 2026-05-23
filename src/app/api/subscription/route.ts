import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { getSubscriptionInfo } from "@/lib/subscription";
import { PLANS } from "@/lib/plans";

export async function GET() {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const business = await Business.findById(businessId)
      .select("subscriptionPlan subscriptionExpiresAt trialStartedAt status")
      .lean();

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const info = getSubscriptionInfo(business);

    return NextResponse.json({
      success: true,
      data: {
        ...info,
        availablePlans: Object.values(PLANS).filter((p) => p.id !== "trial"),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
