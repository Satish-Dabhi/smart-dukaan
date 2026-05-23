"use client";

import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, ShieldCheck, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalVerifiedUsers: number;
  totalBusinesses: number;
  subscriptionsBreakdown: { free: number; starter: number; pro: number; enterprise: number };
  statusBreakdown: { active: number; inactive: number; suspended: number };
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface RecentBusiness {
  _id: string;
  name: string;
  slug: string;
  subscriptionPlan: string;
  status: string;
  ownerId?: { name: string; email: string };
  createdAt: string;
}

interface GrowthPoint {
  date: string;
  users: number;
  businesses: number;
}

interface AdminDashboardOverviewProps {
  stats: AdminStats;
  recent: { users: RecentUser[]; businesses: RecentBusiness[] };
  growth: GrowthPoint[];
}

const PLAN_COLORS: Record<string, string> = {
  free: "#94a3b8",
  starter: "#3b82f6",
  pro: "#7c3aed",
  enterprise: "#f59e0b",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  inactive: "#94a3b8",
  suspended: "#ef4444",
};

const statCard = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export function AdminDashboardOverview({ stats, recent, growth }: AdminDashboardOverviewProps) {
  const subscriptionData = Object.entries(stats.subscriptionsBreakdown)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, key: name }))
    .filter((d) => d.value > 0);

  const statusData = Object.entries(stats.statusBreakdown)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name] ?? "#94a3b8",
    }));

  const summaryCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: `${stats.totalVerifiedUsers} verified`,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      label: "Verified Users",
      value: stats.totalVerifiedUsers,
      sub: `${stats.totalUsers - stats.totalVerifiedUsers} pending`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Total Businesses",
      value: stats.totalBusinesses,
      sub: `${stats.statusBreakdown.active} active`,
      icon: Building2,
      color: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      label: "Suspended Stores",
      value: stats.statusBreakdown.suspended,
      sub: `${stats.statusBreakdown.inactive} inactive`,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Platform Overview
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time snapshot of all users, stores, and subscriptions.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={card.label} custom={i} variants={statCard} initial="hidden" animate="visible">
            <Card className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {card.label}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Line Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              Platform Growth (Last 14 Days)
            </CardTitle>
            <CardDescription>New user and business registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {growth.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                No growth data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={growth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} dot={false} name="Users" />
                  <Line type="monotone" dataKey="businesses" stroke="#db2777" strokeWidth={2} dot={false} name="Businesses" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Subscription Pie */}
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Subscription Plans</CardTitle>
            <CardDescription>Distribution across tiers</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No businesses yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {subscriptionData.map((entry) => (
                        <Cell key={entry.key} fill={PLAN_COLORS[entry.key] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {subscriptionData.map((entry) => (
                    <div key={entry.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PLAN_COLORS[entry.key] ?? "#94a3b8" }}
                      />
                      {entry.name}: <span className="font-bold text-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Status Bar Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Status Bar */}
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pink-600" />
              Business Status Breakdown
            </CardTitle>
            <CardDescription>Active vs inactive vs suspended stores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Recent Registrations
            </CardTitle>
            <CardDescription>Latest users on the platform</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recent.users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No users yet</p>
            ) : (
              recent.users.map((u) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant="outline" className="capitalize text-xs font-semibold">
                      {u.role}
                    </Badge>
                    {u.isVerified ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200/50 text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200/50 text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Businesses */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Recently Onboarded Stores
          </CardTitle>
          <CardDescription>Latest business accounts registered on the platform</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {recent.businesses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No businesses yet</p>
          ) : (
            recent.businesses.map((b) => (
              <div key={b._id} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    /{b.slug} · {b.ownerId?.name ?? "Unknown"}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 items-center">
                  <Badge
                    className="capitalize text-xs font-bold border-none"
                    style={{
                      backgroundColor:
                        b.subscriptionPlan === "pro"
                          ? "#7c3aed20"
                          : b.subscriptionPlan === "enterprise"
                          ? "#f59e0b20"
                          : b.subscriptionPlan === "starter"
                          ? "#3b82f620"
                          : "#94a3b820",
                      color:
                        b.subscriptionPlan === "pro"
                          ? "#7c3aed"
                          : b.subscriptionPlan === "enterprise"
                          ? "#f59e0b"
                          : b.subscriptionPlan === "starter"
                          ? "#3b82f6"
                          : "#64748b",
                    }}
                  >
                    {b.subscriptionPlan}
                  </Badge>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      b.status === "active" ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
