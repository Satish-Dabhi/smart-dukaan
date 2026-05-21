"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  ShieldAlert,
  BadgePercent,
  X,
  Search,
  Loader2,
  Calendar,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface SuperAdminManagerProps {
  locale: string;
}

const planColors: Record<string, { bg: string; text: string; border: string }> = {
  free: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
  },
  starter: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/30",
  },
  pro: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-900/30",
  },
  enterprise: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/30",
  },
};

export function SuperAdminManager(_props: SuperAdminManagerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "businesses">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [dataList, setDataList] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);

  // Search and Paginations
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Edit states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingBusinessSub, setEditingBusinessSub] = useState<any>(null);
  const [updatingAction, setUpdatingAction] = useState(false);

  // Subscription form fields
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "pro" | "enterprise">(
    "free"
  );
  const [expiresAt, setExpiresAt] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/super-admin?tab=${activeTab}`;
      if (activeTab !== "overview") {
        url += `&page=${page}&limit=${limit}&q=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.stats);
          if (activeTab === "overview") {
            setRecent(json.recent);
          } else {
            setDataList(json.data);
            setMeta(json.meta);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching super admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "overview") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingAction(true);
    try {
      const res = await fetch("/api/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user_role",
          userId,
          role: newRole,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    } finally {
      setUpdatingAction(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusinessSub) return;

    setUpdatingAction(true);
    try {
      const res = await fetch("/api/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_subscription",
          businessId: editingBusinessSub._id,
          subscriptionPlan: selectedPlan,
          subscriptionExpiresAt: expiresAt || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setEditingBusinessSub(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update subscription");
    } finally {
      setUpdatingAction(false);
    }
  };

  const handleToggleBusinessStatus = async (businessId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (
      !confirm(
        `Are you sure you want to ${nextStatus === "suspended" ? "suspend" : "activate"} this business store?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_business_status",
          businessId,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update business status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Navigation Tabs ─────────────────────────────────────────────── */}
      <div className="flex border-b border-border gap-2 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: BadgePercent },
          { id: "users", label: "Users", icon: Users },
          { id: "businesses", label: "Businesses", icon: Building2 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                isActive
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading && !updatingAction ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ─── OVERVIEW TAB ──────────────────────────────────────────────── */}
          {activeTab === "overview" && stats && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      Total Users
                    </CardTitle>
                    <Users className="w-4 h-4 text-violet-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-foreground">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-emerald-500 font-bold">
                        {stats.totalVerifiedUsers} verified
                      </span>{" "}
                      • {stats.totalUsers - stats.totalVerifiedUsers} pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      Total Stores / Businesses
                    </CardTitle>
                    <Building2 className="w-4 h-4 text-pink-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-foreground">
                      {stats.totalBusinesses}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-emerald-500 font-bold">
                        {stats.statusBreakdown.active} active
                      </span>{" "}
                      • {stats.statusBreakdown.suspended} suspended
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow sm:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      Active Subscriptions
                    </CardTitle>
                    <Award className="w-4 h-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 items-center flex-wrap mt-0.5">
                      <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none font-bold">
                        Pro: {stats.subscriptionsBreakdown.pro}
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-bold">
                        Starter: {stats.subscriptionsBreakdown.starter}
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none font-bold">
                        Enterprise: {stats.subscriptionsBreakdown.enterprise}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {recent && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-2xl border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Recent Registered Users</CardTitle>
                      <CardDescription>Latest registrations in the system</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                      {recent.users.map((u: any) => (
                        <div key={u._id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="capitalize font-semibold" variant="outline">
                              {u.role}
                            </Badge>
                            {u.isVerified ? (
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200/50">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 border-gray-200/50">
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">
                        Recent Created Businesses
                      </CardTitle>
                      <CardDescription>Latest store launches</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                      {recent.businesses.map((b: any) => (
                        <div key={b._id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-foreground">{b.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Owner: {b.ownerId?.name || "System"}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge
                              className="capitalize font-bold border-none"
                              style={{
                                backgroundColor: planColors[b.subscriptionPlan]?.bg,
                                color: planColors[b.subscriptionPlan]?.text,
                              }}
                            >
                              {b.subscriptionPlan}
                            </Badge>
                            <span
                              className={`w-2 h-2 rounded-full ${b.status === "active" ? "bg-emerald-500" : "bg-red-500"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ─── USERS TAB ─────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md h-10 rounded-xl"
                  startIcon={<Search className="w-4 h-4 text-muted-foreground" />}
                />
                <Button type="submit" variant="outline" className="h-10 rounded-xl">
                  Search
                </Button>
              </form>

              <Card className="rounded-2xl border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
                        <th className="p-4 font-bold text-muted-foreground">Name</th>
                        <th className="p-4 font-bold text-muted-foreground">Email</th>
                        <th className="p-4 font-bold text-muted-foreground">Role</th>
                        <th className="p-4 font-bold text-muted-foreground">Verification</th>
                        <th className="p-4 font-bold text-muted-foreground">Created At</th>
                        <th className="p-4 font-bold text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dataList.map((u) => (
                        <tr
                          key={u._id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="p-4 font-bold text-foreground">{u.name}</td>
                          <td className="p-4 text-muted-foreground">{u.email}</td>
                          <td className="p-4">
                            <Badge className="capitalize font-semibold" variant="outline">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {u.isVerified ? (
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200/50">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 border-gray-200/50">
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUser(u)}
                              className="rounded-lg text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/20"
                            >
                              Edit Role
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginations */}
                {meta && meta.totalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Showing Page {meta.page} of {meta.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.page <= 1}
                        onClick={() => setPage(meta.page - 1)}
                        className="rounded-lg"
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.page >= meta.totalPages}
                        onClick={() => setPage(meta.page + 1)}
                        className="rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ─── BUSINESSES TAB ────────────────────────────────────────────── */}
          {activeTab === "businesses" && (
            <div className="space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Search store name, email or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md h-10 rounded-xl"
                  startIcon={<Search className="w-4 h-4 text-muted-foreground" />}
                />
                <Button type="submit" variant="outline" className="h-10 rounded-xl">
                  Search
                </Button>
              </form>

              <Card className="rounded-2xl border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
                        <th className="p-4 font-bold text-muted-foreground">Store Name</th>
                        <th className="p-4 font-bold text-muted-foreground">Owner</th>
                        <th className="p-4 font-bold text-muted-foreground">Location</th>
                        <th className="p-4 font-bold text-muted-foreground">Plan</th>
                        <th className="p-4 font-bold text-muted-foreground">Status</th>
                        <th className="p-4 font-bold text-muted-foreground">Subscription Expiry</th>
                        <th className="p-4 font-bold text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dataList.map((b) => (
                        <tr
                          key={b._id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-extrabold text-foreground">{b.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">/{b.slug}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-foreground">
                              {b.ownerId?.name || "System"}
                            </p>
                            <p className="text-xs text-muted-foreground">{b.ownerId?.email}</p>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {b.city}, {b.state}
                          </td>
                          <td className="p-4">
                            <Badge
                              className="capitalize font-bold border-none"
                              style={{
                                backgroundColor: planColors[b.subscriptionPlan]?.bg,
                                color: planColors[b.subscriptionPlan]?.text,
                              }}
                            >
                              {b.subscriptionPlan}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={
                                b.status === "active"
                                  ? "text-emerald-500 border-emerald-200 bg-emerald-50/20"
                                  : "text-red-500 border-red-200 bg-red-50/20"
                              }
                            >
                              {b.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            {b.subscriptionExpiresAt
                              ? formatDate(b.subscriptionExpiresAt)
                              : "Lifetime"}
                          </td>
                          <td className="p-4 text-right space-x-1 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingBusinessSub(b);
                                setSelectedPlan(b.subscriptionPlan);
                                setExpiresAt(
                                  b.subscriptionExpiresAt
                                    ? new Date(b.subscriptionExpiresAt).toISOString().split("T")[0]
                                    : ""
                                );
                              }}
                              className="rounded-lg text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/20"
                            >
                              Plan
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleBusinessStatus(b._id, b.status)}
                              className={`rounded-lg font-bold ${
                                b.status === "active"
                                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              }`}
                            >
                              {b.status === "active" ? "Suspend" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginations */}
                {meta && meta.totalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Showing Page {meta.page} of {meta.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.page <= 1}
                        onClick={() => setPage(meta.page - 1)}
                        className="rounded-lg"
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.page >= meta.totalPages}
                        onClick={() => setPage(meta.page + 1)}
                        className="rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ─── EDIT USER ROLE DIALOG ─────────────────────────────────────── */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-foreground">Change User Role</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update permissions level for {editingUser.name}
                  </p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "business_owner",
                    label: "Business Owner",
                    desc: "Allows full control of a shop store & dashboard settings",
                  },
                  {
                    value: "super_admin",
                    label: "Super Admin",
                    desc: "Grants absolute root control over the central SmartDukaan ecosystem",
                  },
                  {
                    value: "staff",
                    label: "Staff Member",
                    desc: "Allows store POS ordering and billing management",
                  },
                  {
                    value: "customer",
                    label: "Regular Customer",
                    desc: "Restricted buyer account",
                  },
                ].map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleUpdateRole(editingUser._id, role.value)}
                    disabled={updatingAction}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      editingUser.role === role.value
                        ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <ShieldAlert
                      className={`w-5 h-5 shrink-0 mt-0.5 ${editingUser.role === role.value ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">{role.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {role.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EDIT SUBSCRIPTION DIALOG ──────────────────────────────────── */}
      <AnimatePresence>
        {editingBusinessSub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingBusinessSub(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-foreground">
                    Manage Subscription Plan
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set limits and billing details for{" "}
                    <span className="font-bold text-violet-600">{editingBusinessSub.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingBusinessSub(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubscription} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Select Plan Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "free" as const, label: "Free Plan", price: "₹0" },
                      { value: "starter" as const, label: "Starter", price: "₹999/mo" },
                      { value: "pro" as const, label: "Pro Tier", price: "₹2,499/mo" },
                      { value: "enterprise" as const, label: "Enterprise", price: "₹4,999/mo" },
                    ].map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setSelectedPlan(tier.value)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedPlan === tier.value
                            ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300"
                            : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <p className="text-sm font-bold text-foreground">{tier.label}</p>
                        <p className="text-xs text-violet-600 font-bold mt-0.5">{tier.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Subscription Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="h-11 rounded-xl focus-visible:ring-violet-500"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Leave blank to grant lifetime subscription (e.g. no expiry date restrictions).
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingBusinessSub(null)}
                    className="rounded-xl h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={updatingAction}
                    className="rounded-xl h-11 px-6 shadow-md"
                  >
                    {updatingAction ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Apply Limits"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
