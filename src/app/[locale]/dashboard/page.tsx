import { getCachedSession } from "@/lib/auth-cache";
import { connectDB } from "@/lib/db";
import { DashboardOverview } from "@/components/dashboard/overview";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// Validates that this route produces an instant static shell for client-side navigation
export const unstable_instant = { prefetch: "static" };

async function getDashboardData(businessId?: string) {
  if (!businessId) return null;

  await connectDB();

  // Lazy imports for tree-shaking
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
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customerId", "name phone")
      .lean(),
    Product.find({ businessId, $expr: { $lte: ["$stock", "$minStock"] } })
      .limit(5)
      .lean(),
    Invoice.aggregate([
      {
        $match: { businessId, status: "paid", createdAt: { $gte: startOfMonth } },
      },
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
      { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.total" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
    ]),
  ]);

  const currentRevenue = monthRevenue[0]?.total ?? 0;
  const previousRevenue = lastMonthRevenue[0]?.total ?? 0;
  const revenueGrowth =
    previousRevenue === 0
      ? 100
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

  const ordersGrowth =
    lastMonthOrders === 0
      ? 100
      : ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100;

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
    // lean() returns ObjectId instances; serialise to plain strings for RSC payload
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
    revenueByDay: revenueByDay.map((d) => ({ date: d._id, value: d.revenue })),
    topProducts: topProducts.map((p) => ({
      _id: p._id,
      name: p.product.name,
      image: p.product.images?.[0],
      totalSold: p.totalSold,
      revenue: p.revenue,
    })),
  };
}

export default async function DashboardPage() {
  const session = await getCachedSession();
  const businessId = session?.user?.businessId;
  const data = await getDashboardData(businessId);

  return <DashboardOverview data={data} />;
}
