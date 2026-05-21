import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import { sendBusinessSuspendedEmail } from "@/lib/email";

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
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;
    const q = searchParams.get("q") ?? "";

    await connectDB();

    // 1. Gather Overview Stats always
    const [totalUsers, totalVerifiedUsers, totalBusinesses, planStats, statusStats] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Business.countDocuments(),
        Business.aggregate([{ $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } }]),
        Business.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

    const subscriptionsBreakdown = {
      free: 0,
      starter: 0,
      pro: 0,
      enterprise: 0,
    };
    planStats.forEach((p) => {
      if (p._id in subscriptionsBreakdown) {
        subscriptionsBreakdown[p._id as keyof typeof subscriptionsBreakdown] = p.count;
      }
    });

    const statusBreakdown = {
      active: 0,
      inactive: 0,
      suspended: 0,
    };
    statusStats.forEach((s) => {
      if (s._id in statusBreakdown) {
        statusBreakdown[s._id as keyof typeof statusBreakdown] = s.count;
      }
    });

    const stats = {
      totalUsers,
      totalVerifiedUsers,
      totalBusinesses,
      subscriptionsBreakdown,
      statusBreakdown,
    };

    // 2. Fetch specific list depending on the selected tab
    if (tab === "users") {
      const query: Record<string, unknown> = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(query),
      ]);

      return NextResponse.json({
        success: true,
        stats,
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (tab === "businesses") {
      const query: Record<string, unknown> = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
        ];
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
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Default: Overview tab - return summary + list of recent activities
    const [recentUsers, recentBusinesses] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).lean(),
      Business.find().populate("ownerId", "name email").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      recent: {
        users: recentUsers,
        businesses: recentBusinesses,
      },
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
    const { action, userId, businessId, role, subscriptionPlan, subscriptionExpiresAt, status } =
      body;

    await connectDB();

    if (action === "update_user_role") {
      if (!userId || !role) {
        return NextResponse.json(
          { success: false, error: "Missing required parameters" },
          { status: 400 }
        );
      }

      const user = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true });

      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "User role updated successfully",
        data: user,
      });
    }

    if (action === "update_subscription") {
      if (!businessId || !subscriptionPlan) {
        return NextResponse.json(
          { success: false, error: "Missing required parameters" },
          { status: 400 }
        );
      }

      const business = await Business.findByIdAndUpdate(
        businessId,
        {
          $set: {
            subscriptionPlan,
            subscriptionExpiresAt: subscriptionExpiresAt
              ? new Date(subscriptionExpiresAt)
              : undefined,
          },
        },
        { new: true }
      );

      if (!business) {
        return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Subscription plan updated successfully",
        data: business,
      });
    }

    if (action === "update_business_status") {
      if (!businessId || !status) {
        return NextResponse.json(
          { success: false, error: "Missing required parameters" },
          { status: 400 }
        );
      }

      const business = await Business.findByIdAndUpdate(
        businessId,
        { $set: { status } },
        { new: true }
      );

      if (!business) {
        return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
      }

      // Trigger suspension email alert asynchronously
      if (status === "suspended") {
        try {
          const owner = await User.findById(business.ownerId);
          if (owner && owner.email) {
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
