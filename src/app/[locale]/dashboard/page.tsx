import { Suspense } from "react";
import { getCachedSession } from "@/lib/auth-cache";
import { connectDB } from "@/lib/db";
import { DashboardOverview } from "@/components/dashboard/overview";
import { AdminDashboardOverview } from "@/components/dashboard/admin-overview";
import { Metadata } from "next";
import mongoose from "mongoose";

export const metadata: Metadata = { title: "Dashboard" };

// ── Business owner dashboard data ────────────────────────────────────────────

async function getBusinessDashboardData(businessIdStr: string) {
  await connectDB();

  // Aggregation pipelines require ObjectId — string comparison silently returns 0
  const businessId = new mongoose.Types.ObjectId(businessIdStr);

  const [Order, Invoice, Product, Customer] = await Promise.all([
    import("@/models/Order").then((m) => m.default),
    import("@/models/Invoice").then((m) => m.default),
    import("@/models/Product").then((m) => m.default),
    import("@/models/Customer").then((m) => m.default),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    monthOrders,
    lastMonthOrders,
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalProducts,
    totalCustomers,
    recentOrders,
    lowStockProducts,
    revenueByDay,
    topProducts,
  ] = await Promise.all([
    Order.countDocuments({ businessId }),
    Order.countDocuments({ businessId, createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({
      businessId,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    }),
    Invoice.aggregate([
      { $match: { businessId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Invoice.aggregate([
      { $match: { businessId, status: "paid", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Invoice.aggregate([
      {
        $match: {
          businessId,
          status: "paid",
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Product.countDocuments({ businessId, status: "active" }),
    Customer.countDocuments({ businessId }),
    Order.find({ businessId })
      .select("orderNumber customerName customerPhone total status createdAt customerId")
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customerId", "name phone")
      .lean(),
    Product.find({ businessId, $expr: { $lte: ["$stock", "$minStock"] } })
      .select("name images stock minStock status")
      .limit(5)
      .lean(),
    Invoice.aggregate([
      { $match: { businessId, status: "paid", createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
    Order.aggregate([
      { $match: { businessId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          "product.name": 1,
          "product.images": 1,
        },
      },
    ]),
  ]);

  const currentRevenue = monthRevenue[0]?.total ?? 0;
  const previousRevenue = lastMonthRevenue[0]?.total ?? 0;
  const revenueGrowth =
    previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  const ordersGrowth =
    lastMonthOrders === 0 ? 100 : ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100;

  return {
    stats: {
      totalRevenue: totalRevenue[0]?.total ?? 0,
      monthRevenue: currentRevenue,
      totalOrders,
      monthOrders,
      totalProducts,
      totalCustomers,
      revenueGrowth: Math.round(revenueGrowth),
      ordersGrowth: Math.round(ordersGrowth),
    },
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
    revenueByDay: revenueByDay.map((d) => ({ date: d._id, value: d.revenue })),
    topProducts: topProducts.map((p) => ({
      _id: p._id.toString(),
      name: p.product.name,
      image: p.product.images?.[0],
      totalSold: p.totalSold,
      revenue: p.revenue,
    })),
  };
}

// ── Super-admin dashboard data ────────────────────────────────────────────────

async function getAdminDashboardData() {
  await connectDB();

  const [User, Business] = await Promise.all([
    import("@/models/User").then((m) => m.default),
    import("@/models/Business").then((m) => m.default),
  ]);

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalVerifiedUsers,
    totalBusinesses,
    planStats,
    statusStats,
    recentUsers,
    recentBusinesses,
    userGrowth,
    bizGrowth,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    Business.countDocuments(),
    Business.aggregate([{ $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } }]),
    Business.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.find()
      .select({
        password: 0,
        verificationOtp: 0,
        verificationOtpExpires: 0,
        resetPasswordOtp: 0,
        resetPasswordOtpExpires: 0,
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Business.find().populate("ownerId", "name email").sort({ createdAt: -1 }).limit(6).lean(),
    User.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Business.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const subscriptionsBreakdown = { free: 0, starter: 0, pro: 0, enterprise: 0 };
  planStats.forEach((p) => {
    if (p._id in subscriptionsBreakdown)
      subscriptionsBreakdown[p._id as keyof typeof subscriptionsBreakdown] = p.count;
  });

  const statusBreakdown = { active: 0, inactive: 0, suspended: 0 };
  statusStats.forEach((s) => {
    if (s._id in statusBreakdown) statusBreakdown[s._id as keyof typeof statusBreakdown] = s.count;
  });

  const growthMap: Record<string, { date: string; users: number; businesses: number }> = {};
  userGrowth.forEach((d) => {
    growthMap[d._id] = { date: d._id, users: d.count, businesses: 0 };
  });
  bizGrowth.forEach((d) => {
    if (growthMap[d._id]) growthMap[d._id].businesses = d.count;
    else growthMap[d._id] = { date: d._id, users: 0, businesses: d.count };
  });
  const growth = Object.values(growthMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    stats: {
      totalUsers,
      totalVerifiedUsers,
      totalBusinesses,
      subscriptionsBreakdown,
      statusBreakdown,
    },
    recent: {
      users: JSON.parse(JSON.stringify(recentUsers)),
      businesses: JSON.parse(JSON.stringify(recentBusinesses)),
    },
    growth,
  };
}

// ── Page components ───────────────────────────────────────────────────────────

async function AdminDashboardContent() {
  const data = await getAdminDashboardData();
  return <AdminDashboardOverview stats={data.stats} recent={data.recent} growth={data.growth} />;
}

async function BusinessDashboardContent() {
  const session = await getCachedSession();
  const businessId = session?.user?.businessId;
  if (!businessId) return <DashboardOverview data={null} />;
  const data = await getBusinessDashboardData(businessId);
  return <DashboardOverview data={data} />;
}

export default async function DashboardPage() {
  const session = await getCachedSession();

  if (session?.user?.role === "super_admin") {
    return (
      <Suspense>
        <AdminDashboardContent />
      </Suspense>
    );
  }

  return (
    <Suspense>
      <BusinessDashboardContent />
    </Suspense>
  );
}
