"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Store,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComponentType } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const CHART_COLORS = [
  "#7c3aed",
  "#db2777",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
];

export interface BlankChartStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ComponentType<{ className?: string }>;
  chartType?: "area" | "pie" | "bar";
}

export function BlankChartState({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon,
  chartType = "area",
}: BlankChartStateProps) {
  return (
    <div className="relative h-[250px] w-full flex flex-col items-center justify-center rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 border border-dashed border-border p-6 text-center">
      {/* Blurred background mock chart */}
      <div className="absolute inset-0 opacity-10 dark:opacity-[0.06] select-none pointer-events-none filter blur-[2px] transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart
              data={[
                { name: "A", value: 10 },
                { name: "B", value: 40 },
                { name: "C", value: 25 },
                { name: "D", value: 70 },
                { name: "E", value: 45 },
                { name: "F", value: 85 },
              ]}
            >
              <Area
                type="monotone"
                dataKey="value"
                stroke="#7c3aed"
                fill="#7c3aed"
                strokeWidth={2}
              />
            </AreaChart>
          ) : chartType === "pie" ? (
            <PieChart>
              <Pie
                data={[
                  { name: "A", value: 40 },
                  { name: "B", value: 30 },
                  { name: "C", value: 20 },
                  { name: "D", value: 10 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={65}
                fill="#7c3aed"
                dataKey="value"
              />
            </PieChart>
          ) : (
            <BarChart
              data={[
                { name: "A", value: 20 },
                { name: "B", value: 60 },
                { name: "C", value: 40 },
                { name: "D", value: 80 },
                { name: "E", value: 50 },
              ]}
            >
              <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center max-w-xs animate-in fade-in zoom-in-95 duration-500">
        <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2.5 shadow-sm border border-violet-100 dark:border-violet-900/30">
          {Icon ? (
            <Icon className="w-5 h-5 animate-pulse" />
          ) : (
            <TrendingUp className="w-5 h-5 animate-pulse" />
          )}
        </div>
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3.5 leading-relaxed">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button
              size="sm"
              variant="gradient"
              className="rounded-lg text-xs font-semibold px-4 py-1.5 shadow-md"
            >
              {actionLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

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
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    customerName?: string;
  }>;
  lowStockProducts: Array<{ _id: string; name: string; stock: number; minStock: number }>;
  revenueByDay: Array<{ date: string; value: number }>;
  topProducts: Array<{ _id: string; name: string; totalSold: number; revenue: number }>;
}

interface Props {
  data: OverviewData | null;
}

const statCards = (
  data: OverviewData["stats"],
  t: (key: string, values?: Record<string, string | number>) => string
) => [
  {
    title: t("totalRevenue"),
    value: formatCurrency(data.totalRevenue),
    change: data.revenueGrowth,
    subValue: t("thisMonthRevenue", { amount: formatCurrency(data.monthRevenue) }),
    icon: IndianRupee,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: t("totalOrders"),
    value: data.totalOrders.toLocaleString(),
    change: data.ordersGrowth,
    subValue: t("thisMonthOrders", { count: data.monthOrders }),
    icon: ShoppingCart,
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: t("totalProducts"),
    value: data.totalProducts.toLocaleString(),
    change: 0,
    subValue: t("activeProducts"),
    icon: Package,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: t("totalCustomers"),
    value: data.totalCustomers.toLocaleString(),
    change: 0,
    subValue: t("totalCustomersSub"),
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
  const t = useTranslations("dashboard");

  if (!data) {
    return <OnboardingCard locale={locale} />;
  }

  const cards = statCards(data.stats, t);

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
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("revenueTrend")}</CardTitle>
              <CardDescription>{t("revenueTrendSub")}</CardDescription>
            </CardHeader>
            <CardContent>
              {data.revenueByDay.length === 0 ? (
                <BlankChartState
                  title={t("noRevenueData")}
                  description={t("noRevenueDataSub")}
                  actionLabel={t("startPosBilling")}
                  actionHref={`/${locale}/dashboard/pos`}
                  chartType="area"
                />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.revenueByDay}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-100 dark:stroke-gray-800"
                    />
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
                      formatter={(val: any) => [formatCurrency(val), t("revenue")]}
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
              )}
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
              <CardTitle>{t("topProductsShare")}</CardTitle>
              <CardDescription>{t("topProductsShareSub")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
              {data.topProducts.length === 0 ? (
                <BlankChartState
                  title={t("noProductSales")}
                  description={t("noProductSalesSub")}
                  actionLabel={t("addProductBtn")}
                  actionHref={`/${locale}/dashboard/products`}
                  chartType="pie"
                />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.topProducts}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {data.topProducts.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Product Volume Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("productSalesVolume")}</CardTitle>
            <CardDescription>{t("productSalesVolumeSub")}</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <BlankChartState
                title={t("noSalesVolumeData")}
                description={t("noSalesVolumeDataSub")}
                actionLabel={t("createOrderBtn")}
                actionHref={`/${locale}/dashboard/pos`}
                chartType="bar"
              />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={data.topProducts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-gray-100 dark:stroke-gray-800"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${value}`, t("unitsSold")]} />
                  <Bar dataKey="totalSold" fill="#7c3aed" radius={[6, 6, 0, 0]}>
                    {data.topProducts.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

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
                <CardTitle>{t("recentOrders")}</CardTitle>
                <CardDescription>{t("latestTransactions")}</CardDescription>
              </div>
              <Link href={`/${locale}/dashboard/orders`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  {t("viewAll")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customerName || t("walkInCustomer")} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        (statusColors[order.status] as
                          | "success"
                          | "warning"
                          | "info"
                          | "destructive") ?? "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                ))}
                {data.recentOrders.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">{t("noOrdersYet")}</p>
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
                  {t("lowStockAlert")}
                </CardTitle>
                <CardDescription>{t("productsRunningLow")}</CardDescription>
              </div>
              <Link href={`/${locale}/dashboard/inventory`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  {t("manage")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
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
                    <Badge variant="warning">{t("lowStock")}</Badge>
                  </div>
                ))}
                {data.lowStockProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center w-full">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 border border-emerald-100 dark:border-emerald-900/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 max-w-[200px]">{t("allProductsStocked")}</p>
                  </div>
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
  const t = useTranslations("dashboard");
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center"
      >
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/5 dark:from-violet-500/20 dark:via-purple-500/10 dark:to-pink-500/10 border border-violet-500/20 dark:border-violet-500/30 shadow-xl shadow-violet-500/5 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
          <div className="absolute -inset-10 bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 rounded-full opacity-30 blur-2xl group-hover:scale-125 transition-transform duration-700 -z-10 animate-pulse" />
          <Store className="w-12 h-12 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-all duration-300 group-hover:rotate-3" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("setupStore")}</h2>
        <p className="text-gray-500 mb-6">{t("setupStoreSub")}</p>
        <Link href={`/${locale}/dashboard/settings`}>
          <Button variant="gradient" size="lg">
            {t("setupBusinessBtn")}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
