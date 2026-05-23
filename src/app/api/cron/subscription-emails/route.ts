import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import User from "@/models/User";
import { sendTrialExpiringEmail, sendTrialExpiredEmail } from "@/lib/email";

// Called daily by Vercel Cron (or any scheduler).
// Protect with CRON_SECRET so only authorized callers can trigger it.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date();

  const results = { warned7: 0, warned1: 0, expired: 0, errors: 0 };

  // 7-day warning: expires between 6d 23h and 7d 1h from now (1h window to avoid double-sends)
  const low7  = new Date(now.getTime() + (7 * 24 - 1) * 60 * 60 * 1000);
  const high7 = new Date(now.getTime() + (7 * 24 + 1) * 60 * 60 * 1000);

  // 1-day warning: expires between 23h and 25h from now
  const low1  = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const high1 = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Expired in the last 1 hour
  const expiredSince = new Date(now.getTime() - 60 * 60 * 1000);

  const [about7, about1, justExpired] = await Promise.all([
    Business.find({ subscriptionExpiresAt: { $gte: low7, $lte: high7 }, status: "active" })
      .select("name ownerId subscriptionExpiresAt")
      .lean(),
    Business.find({ subscriptionExpiresAt: { $gte: low1, $lte: high1 }, status: "active" })
      .select("name ownerId subscriptionExpiresAt")
      .lean(),
    Business.find({ subscriptionExpiresAt: { $gte: expiredSince, $lt: now }, status: "active" })
      .select("name ownerId subscriptionExpiresAt")
      .lean(),
  ]);

  async function notifyOwner(
    business: { name: string; ownerId: unknown },
    fn: (email: string, name: string, bizName: string) => Promise<unknown>
  ) {
    try {
      const owner = await User.findById(business.ownerId).select("email name").lean();
      if (!owner?.email) return;
      await fn(owner.email, owner.name || "Store Owner", business.name);
    } catch (err) {
      console.error("[CRON] Email failed:", err);
      results.errors++;
    }
  }

  const upgradeUrl = `${appUrl}/en/dashboard/billing`;

  for (const biz of about7) {
    await notifyOwner(biz, (email, name, bizName) =>
      sendTrialExpiringEmail(email, name, bizName, 7, upgradeUrl)
    );
    results.warned7++;
  }

  for (const biz of about1) {
    await notifyOwner(biz, (email, name, bizName) =>
      sendTrialExpiringEmail(email, name, bizName, 1, upgradeUrl)
    );
    results.warned1++;
  }

  for (const biz of justExpired) {
    await notifyOwner(biz, (email, name, bizName) =>
      sendTrialExpiredEmail(email, name, bizName, upgradeUrl)
    );
    results.expired++;
  }

  console.log("[CRON] subscription-emails:", results);
  return NextResponse.json({ success: true, results });
}
