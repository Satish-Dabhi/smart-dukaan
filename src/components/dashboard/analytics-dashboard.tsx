"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { BlankChartState } from "./overview";
import { TrendingUp, ShoppingBag, BarChart3, Clock, Layers } from "lucide-react";

const COLORS = ["#7c3aed", "#db2777", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState("30");
  const locale = useLocale();
  const t = useTranslations("analytics");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?period=${period}`);
      const json = await res.json();
      return json.data;
    },
  });

  const periods = [
    { label: t("days7"), value: "7" },
    { label: t("days30"), value: "30" },
    { label: t("days90"), value: "90" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Revenue chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>{t("revenueOverTime")}</CardTitle>
                <CardDescription>{t("dailyRevenuePastDays", { count: Number(period) })}</CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.revenueByDay || data.revenueByDay.length === 0 ? (
                  <BlankChartState
                    title={t("noRevenueData")}
                    description={t("noRevenueDataDesc")}
                    actionLabel={t("goToPos")}
                    actionHref={`/${locale}/dashboard/pos`}
                    chartType="area"
                    icon={TrendingUp}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.revenueByDay}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => formatDate(v)}
                      />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: any) => [formatCurrency(v), t("revenue")]}
                        labelFormatter={(l) => formatDate(l)}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        fill="url(#revGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders by status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("ordersByStatus")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.ordersByStatus || data.ordersByStatus.length === 0 ? (
                    <BlankChartState
                      title={t("noOrdersYet")}
                      description={t("noOrdersYetDesc")}
                      actionLabel={t("createOrder")}
                      actionHref={`/${locale}/dashboard/pos`}
                      chartType="pie"
                      icon={ShoppingBag}
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={data.ordersByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label={({ status, percent }: any) =>
                            `${status} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {data.ordersByStatus.map((_: unknown, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue by category */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("revenueByCategory")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.revenueByCategory || data.revenueByCategory.length === 0 ? (
                    <BlankChartState
                      title={t("noCategoryRevenue")}
                      description={t("noCategoryRevenueDesc")}
                      actionLabel={t("manageCategories")}
                      actionHref={`/${locale}/dashboard/categories`}
                      chartType="bar"
                      icon={Layers}
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={data.revenueByCategory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <Tooltip formatter={(v: any) => [formatCurrency(v), t("revenue")]} />
                        <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Peak hours */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("peakHours")}</CardTitle>
                  <CardDescription>{t("whenMostOrders")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!data?.peakHours || data.peakHours.length === 0 ? (
                    <BlankChartState
                      title={t("noPeakHoursData")}
                      description={t("noPeakHoursDataDesc")}
                      actionLabel={t("recordSales")}
                      actionHref={`/${locale}/dashboard/pos`}
                      chartType="bar"
                      icon={Clock}
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.peakHours}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis
                          dataKey="hour"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(h) => `${h}:00`}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip labelFormatter={(l) => `${l}:00 - ${(+l + 1) % 24}:00`} />
                        <Bar dataKey="count" fill="#db2777" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top products */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("topProducts")}</CardTitle>
                  <CardDescription>{t("byRevenuePeriod")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!data?.topProducts || data.topProducts.length === 0 ? (
                    <BlankChartState
                      title={t("noTopProducts")}
                      description={t("noTopProductsDesc")}
                      actionLabel={t("goToProducts")}
                      actionHref={`/${locale}/dashboard/products`}
                      chartType="pie"
                      icon={BarChart3}
                    />
                  ) : (
                    <div className="space-y-3">
                      {data.topProducts.slice(0, 5).map((
                        product: { id: string; name: string; totalSold: number; revenue: number },
                        i: number
                      ) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: COLORS[i % COLORS.length] }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{t("unitsSoldCount", { count: product.totalSold })}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
