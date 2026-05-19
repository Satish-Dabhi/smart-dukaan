"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  Users, IndianRupee, AlertTriangle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "next-intl";

interface OverviewData {
  stats: {
    totalRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    monthOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  recentOrders: Array<{ _id: string; orderNumber: string; total: number; status: string; createdAt: string; customerName?: string }>;
  lowStockProducts: Array<{ _id: string; name: string; stock: number; minStock: number }>;
  revenueByDay: Array<{ date: string; value: number }>;
  topProducts: Array<{ _id: string; name: string; totalSold: number; revenue: number }>;
}

interface Props {
  data: OverviewData | null;
}

const statCards = (data: OverviewData["stats"]) => [
  {
    title: "Total Revenue",
    value: formatCurrency(data.totalRevenue),
    change: data.revenueGrowth,
    subValue: `${formatCurrency(data.monthRevenue)} this month`,
    icon: IndianRupee,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Total Orders",
    value: data.totalOrders.toLocaleString(),
    change: data.ordersGrowth,
    subValue: `${data.monthOrders} this month`,
    icon: ShoppingCart,
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: "Products",
    value: data.totalProducts.toLocaleString(),
    change: 0,
    subValue: "Active products",
    icon: Package,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Customers",
    value: data.totalCustomers.toLocaleString(),
    change: 0,
    subValue: "Total customers",
    icon: Users,
    color: "pink",
    gradient: "from-pink-500 to-rose-600",
  },
];

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "info",
  delivered: "success",
  cancelled: "destructive",
  paid: "success",
};

export function DashboardOverview({ data }: Props) {
  const locale = useLocale();

  if (!data) {
    return <OnboardingCard locale={locale} />;
  }

  const cards = statCards(data.stats);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                  >
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  {card.change !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        card.change >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {card.change >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {Math.abs(card.change)}%
                    </div>
                  )}
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mb-0.5">
                  {card.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {card.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">{card.subValue}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.revenueByDay}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => new Date(val).getDate().toString()}
                    className="text-gray-400"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    className="text-gray-400"
                  />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [formatCurrency(val), "Revenue"]}
                    labelFormatter={(label) => formatDate(label)}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>By revenue this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProducts.map((product, i) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                ))}
                {data.topProducts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </div>
              <Link href={`/${locale}/dashboard/orders`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customerName || "Walk-in"} •{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge variant={(statusColors[order.status] as "success" | "warning" | "info" | "destructive") ?? "secondary"}>
                      {order.status}
                    </Badge>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                ))}
                {data.recentOrders.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>Products running low</CardDescription>
              </div>
              <Link href={`/${locale}/dashboard/inventory`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  Manage <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min((product.stock / product.minStock) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {product.stock}/{product.minStock}
                        </span>
                      </div>
                    </div>
                    <Badge variant="warning">Low</Badge>
                  </div>
                ))}
                {data.lowStockProducts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    ✅ All products are well-stocked
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function OnboardingCard({ locale }: { locale: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center"
      >
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set up your store
        </h2>
        <p className="text-gray-500 mb-6">
          Create your business profile to start using SmartDukaan features.
        </p>
        <Link href={`/${locale}/dashboard/settings`}>
          <Button variant="gradient" size="lg">
            Set up your business
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
