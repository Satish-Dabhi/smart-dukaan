import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import { sendBusinessSuspendedEmail } from "@/lib/email";
import { escapeRegex } from "@/lib/utils";
import { z } from "zod";

// Projection that never leaks OTP hashes or password hash
const USER_SAFE_PROJECTION = {
  password: 0,
  verificationOtp: 0,
  verificationOtpExpires: 0,
  resetPasswordOtp: 0,
  resetPasswordOtpExpires: 0,
};

const ALLOWED_ROLES = ["super_admin", "business_owner", "staff", "customer"] as const;
const ALLOWED_PLANS = ["trial", "starter", "pro", "enterprise"] as const;
const ALLOWED_STATUSES = ["active", "inactive", "suspended"] as const;

const UpdateRoleSchema = z.object({
  action: z.literal("update_user_role"),
  userId: z.string().min(1),
  role: z.enum(ALLOWED_ROLES),
});

const UpdateSubscriptionSchema = z.object({
  action: z.literal("update_subscription"),
  businessId: z.string().min(1),
  subscriptionPlan: z.enum(ALLOWED_PLANS),
  subscriptionExpiresAt: z.string().optional(),
});

const UpdateBusinessStatusSchema = z.object({
  action: z.literal("update_business_status"),
  businessId: z.string().min(1),
  status: z.enum(ALLOWED_STATUSES),
});

const PatchSchema = z.discriminatedUnion("action", [
  UpdateRoleSchema,
  UpdateSubscriptionSchema,
  UpdateBusinessStatusSchema,
]);

const DeleteSchema = z.object({
  type: z.enum(["user", "business"]),
  id: z.string().min(1),
});

async function isSuperAdmin() {
  const session = await auth();
  return session?.user?.role === "super_admin";
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = req.nextUrl;
    const tab = searchParams.get("tab") ?? "overview";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const skip = (page - 1) * limit;
    const rawQ = searchParams.get("q") ?? "";
    const q = rawQ.trim().slice(0, 100);
    const subFilter = searchParams.get("subFilter") ?? "all"; // all | trial | expiring_soon | expired | active

    await connectDB();

    const [totalUsers, totalVerifiedUsers, totalBusinesses, planStats, statusStats] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Business.countDocuments(),
        Business.aggregate([{ $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } }]),
        Business.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

    const subscriptionsBreakdown: Record<string, number> = {};
    planStats.forEach((p) => {
      if (p._id) subscriptionsBreakdown[p._id as string] = p.count;
    });

    const statusBreakdown = { active: 0, inactive: 0, suspended: 0 };
    statusStats.forEach((s) => {
      if (s._id in statusBreakdown)
        statusBreakdown[s._id as keyof typeof statusBreakdown] = s.count;
    });

    const stats = {
      totalUsers,
      totalVerifiedUsers,
      totalBusinesses,
      subscriptionsBreakdown,
      statusBreakdown,
    };

    if (tab === "users") {
      const query: Record<string, unknown> = {};
      if (q) {
        const safe = escapeRegex(q);
        query.$or = [
          { name: { $regex: safe, $options: "i" } },
          { email: { $regex: safe, $options: "i" } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select(USER_SAFE_PROJECTION)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
      ]);

      return NextResponse.json({
        success: true,
        stats,
        data: users,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (tab === "businesses") {
      const query: Record<string, unknown> = {};
      if (q) {
        const safe = escapeRegex(q);
        query.$or = [
          { name: { $regex: safe, $options: "i" } },
          { email: { $regex: safe, $options: "i" } },
          { city: { $regex: safe, $options: "i" } },
        ];
      }

      // Subscription status filter
      const now = new Date();
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (subFilter === "trial") {
        query.subscriptionPlan = "trial";
        query.subscriptionExpiresAt = { $gt: now };
      } else if (subFilter === "expiring_soon") {
        query.subscriptionExpiresAt = { $gte: now, $lte: in7Days };
      } else if (subFilter === "expired") {
        query.subscriptionExpiresAt = { $lt: now };
      } else if (subFilter === "active") {
        query.subscriptionPlan = { $in: ["starter", "pro", "enterprise"] };
        // Paid plan is "active" when expiry is absent (lifetime) or in the future
        const activeExpiryCond = [
          { subscriptionExpiresAt: { $exists: false } },
          { subscriptionExpiresAt: null },
          { subscriptionExpiresAt: { $gt: now } },
        ];
        if (query.$or) {
          // Both the text-search OR and the active-expiry OR must hold — use $and
          query.$and = [{ $or: query.$or as unknown[] }, { $or: activeExpiryCond }];
          delete query.$or;
        } else {
          query.$or = activeExpiryCond;
        }
      }

      const [businesses, total] = await Promise.all([
        Business.find(query)
          .populate("ownerId", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Business.countDocuments(query),
      ]);

      return NextResponse.json({
        success: true,
        stats,
        data: businesses,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Overview tab
    const [recentUsers, recentBusinesses] = await Promise.all([
      User.find().select(USER_SAFE_PROJECTION).sort({ createdAt: -1 }).limit(5).lean(),
      Business.find().populate("ownerId", "name email").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      recent: { users: recentUsers, businesses: recentBusinesses },
    });
  } catch (error) {
    console.error("GET /api/super-admin error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();
    const data = parsed.data;

    if (data.action === "update_user_role") {
      const user = await User.findByIdAndUpdate(
        data.userId,
        { $set: { role: data.role } },
        { new: true, select: USER_SAFE_PROJECTION }
      );
      if (!user)
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      return NextResponse.json({
        success: true,
        message: "User role updated successfully",
        data: user,
      });
    }

    if (data.action === "update_subscription") {
      const business = await Business.findByIdAndUpdate(
        data.businessId,
        {
          $set: {
            subscriptionPlan: data.subscriptionPlan,
            ...(data.subscriptionExpiresAt
              ? { subscriptionExpiresAt: new Date(data.subscriptionExpiresAt) }
              : {}),
          },
        },
        { new: true }
      );
      if (!business)
        return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        data: business,
      });
    }

    if (data.action === "update_business_status") {
      const business = await Business.findByIdAndUpdate(
        data.businessId,
        { $set: { status: data.status } },
        { new: true }
      );
      if (!business)
        return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });

      if (data.status === "suspended") {
        try {
          const owner = await User.findById(business.ownerId).select("email name");
          if (owner?.email) {
            await sendBusinessSuspendedEmail(
              owner.email,
              owner.name || "Store Owner",
              business.name
            );
          }
        } catch (emailErr) {
          console.error("[SUPER_ADMIN_PATCH] Failed to send business suspended email:", emailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Business status updated successfully",
        data: business,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/super-admin error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Missing type or id" }, { status: 400 });
    }
    const { type, id } = parsed.data;

    await connectDB();

    if (type === "user") {
      const user = await User.findByIdAndDelete(id);
      if (!user)
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "User deleted successfully" });
    }

    if (type === "business") {
      const business = await Business.findByIdAndDelete(id);
      if (!business)
        return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Business deleted successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/super-admin error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
