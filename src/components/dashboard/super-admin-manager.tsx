"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  X,
  Search,
  Loader2,
  Calendar,
  Award,
  Trash2,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export type AdminMode = "users" | "businesses";

interface SuperAdminManagerProps {
  locale: string;
  mode: AdminMode;
}

interface ISuperAdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface ISuperAdminBusiness {
  _id: string;
  name: string;
  slug: string;
  ownerId?: {
    name: string;
    email: string;
  };
  city?: string;
  state?: string;
  subscriptionPlan: string;
  status: string;
  subscriptionExpiresAt?: string;
}

interface ISuperAdminMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const planColors: Record<string, { bg: string; text: string }> = {
  trial: { bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-600 dark:text-sky-400" },
  starter: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400" },
  pro: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400" },
  enterprise: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
  },
};

export function SuperAdminManager({ locale, mode }: SuperAdminManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dataList, setDataList] = useState<Array<ISuperAdminUser | ISuperAdminBusiness>>([]);
  const [meta, setMeta] = useState<ISuperAdminMeta | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [subFilter, setSubFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [editingUser, setEditingUser] = useState<ISuperAdminUser | null>(null);
  const [editingBusinessSub, setEditingBusinessSub] = useState<ISuperAdminBusiness | null>(null);
  const [updatingAction, setUpdatingAction] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<"trial" | "starter" | "pro" | "enterprise">(
    "trial"
  );
  const [expiresAt, setExpiresAt] = useState("");

  const fetchData = useCallback(async () => {
    Promise.resolve().then(() => setIsLoading(true));
    try {
      const url = `/api/super-admin?tab=${mode}&page=${page}&limit=${limit}&q=${encodeURIComponent(appliedSearchQuery)}&subFilter=${subFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDataList(json.data);
          setMeta(json.meta);
        }
      }
    } catch (error) {
      console.error("Error fetching super admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mode, page, appliedSearchQuery, subFilter]);

  // Adjust state during render to avoid synchronous useEffect state updates (cascading renders)
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setPage(1);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
    setPage(1);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingAction(true);
    try {
      const res = await fetch("/api/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_user_role", userId, role: newRole }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setEditingUser(null);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      alert(msg);
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update subscription";
      alert(msg);
    } finally {
      setUpdatingAction(false);
    }
  };

  const handleToggleBusinessStatus = async (businessId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (
      !confirm(
        `Are you sure you want to ${nextStatus === "suspended" ? "suspend" : "activate"} this store?`
      )
    )
      return;

    Promise.resolve().then(() => setIsLoading(true));
    try {
      const res = await fetch("/api/super-admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_business_status", businessId, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update business status";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "user" | "business") => {
    const label = type === "user" ? "user account" : "business store";
    if (
      !confirm(`Are you sure you want to permanently delete this ${label}? This cannot be undone.`)
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch("/api/super-admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to delete ${label}`;
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const isUsers = mode === "users";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          {isUsers ? (
            <Users className="w-7 h-7 text-violet-600" />
          ) : (
            <Building2 className="w-7 h-7 text-pink-600" />
          )}
          {isUsers ? "User Management" : "Business Management"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isUsers
            ? "Search, manage roles, and remove user accounts."
            : "Search, manage subscriptions, suspend, or remove business stores."}
        </p>
      </div>

      {/* Search + Subscription Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <Input
            placeholder={
              isUsers ? "Search name or email..." : "Search store name, email or city..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md h-10 rounded-xl"
            startIcon={<Search className="w-4 h-4 text-muted-foreground" />}
          />
          <Button type="submit" variant="outline" className="h-10 rounded-xl">
            Search
          </Button>
        </form>
        {!isUsers && (
          <div className="flex gap-1.5 flex-wrap">
            {[
              {
                value: "all",
                label: "All",
                color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
              },
              {
                value: "trial",
                label: "On Trial",
                color: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400",
              },
              {
                value: "expiring_soon",
                label: "Expiring ≤7d",
                color: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
              },
              {
                value: "expired",
                label: "Expired",
                color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
              },
              {
                value: "active",
                label: "Paid",
                color:
                  "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
              },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setSubFilter(f.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  subFilter === f.value
                    ? `${f.color} border-current ring-1 ring-current`
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && !updatingAction ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── USERS TABLE ──────────────────────────────────────────────── */}
          {isUsers && (
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
                    {dataList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      dataList.map((item) => {
                        const u = item as ISuperAdminUser;
                        return (
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
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingUser(u)}
                                className="rounded-lg text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/20"
                              >
                                Edit Role
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deletingId === u._id}
                                onClick={() => handleDelete(u._id, "user")}
                                className="rounded-lg text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                {deletingId === u._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} page={page} setPage={setPage} />
            </Card>
          )}

          {/* ── BUSINESSES TABLE ──────────────────────────────────────────── */}
          {!isUsers && (
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
                      <th className="p-4 font-bold text-muted-foreground">Expiry</th>
                      <th className="p-4 font-bold text-muted-foreground">Visit Store</th>
                      <th className="p-4 font-bold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dataList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">
                          No businesses found
                        </td>
                      </tr>
                    ) : (
                      dataList.map((item) => {
                        const b = item as ISuperAdminBusiness;
                        return (
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
                                {b.ownerId?.name ?? "System"}
                              </p>
                              <p className="text-xs text-muted-foreground">{b.ownerId?.email}</p>
                            </td>
                            <td className="p-4 text-muted-foreground text-sm">
                              {[b.city, b.state].filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="p-4">
                              <Badge
                                className={`capitalize font-bold border-none ${planColors[b.subscriptionPlan]?.bg} ${planColors[b.subscriptionPlan]?.text}`}
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
                            <td className="p-4 text-xs">
                              {b.subscriptionExpiresAt ? (
                                (() => {
                                  const exp = new Date(b.subscriptionExpiresAt);
                                  const now = new Date();
                                  const diff = Math.ceil(
                                    (exp.getTime() - now.getTime()) / 86400000
                                  );
                                  const expired = diff < 0;
                                  return (
                                    <div>
                                      <span className="text-muted-foreground">
                                        {formatDate(b.subscriptionExpiresAt)}
                                      </span>
                                      {expired ? (
                                        <span className="ml-1 text-red-500 font-bold">
                                          (Expired)
                                        </span>
                                      ) : diff <= 7 ? (
                                        <span className="ml-1 text-amber-500 font-bold">
                                          ({diff}d left)
                                        </span>
                                      ) : null}
                                    </div>
                                  );
                                })()
                              ) : (
                                <span className="text-emerald-600 font-semibold">Lifetime</span>
                              )}
                            </td>
                            <td className="p-4">
                              <a
                                href={`/${locale}/business/${b.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Visit
                              </a>
                            </td>
                            <td className="p-4 text-right space-x-1 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingBusinessSub(b);
                                  setSelectedPlan(
                                    (b.subscriptionPlan as
                                      | "trial"
                                      | "starter"
                                      | "pro"
                                      | "enterprise") ?? "trial"
                                  );
                                  setExpiresAt(
                                    b.subscriptionExpiresAt
                                      ? new Date(b.subscriptionExpiresAt)
                                          .toISOString()
                                          .split("T")[0]
                                      : ""
                                  );
                                }}
                                className="rounded-lg text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/20"
                              >
                                <Award className="w-3.5 h-3.5 mr-1" />
                                Plan
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleBusinessStatus(b._id, b.status)}
                                className={`rounded-lg font-bold ${
                                  b.status === "active"
                                    ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                    : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                }`}
                              >
                                {b.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deletingId === b._id}
                                onClick={() => handleDelete(b._id, "business")}
                                className="rounded-lg text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                {deletingId === b._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} page={page} setPage={setPage} />
            </Card>
          )}
        </>
      )}

      {/* ── EDIT USER ROLE DIALOG ─────────────────────────────────────────── */}
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-foreground">Change User Role</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update permissions for {editingUser.name}
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
                    desc: "Full control of a shop store & dashboard",
                  },
                  {
                    value: "super_admin",
                    label: "Super Admin",
                    desc: "Root control over the SmartDukaan platform",
                  },
                  {
                    value: "staff",
                    label: "Staff Member",
                    desc: "POS ordering and billing management",
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
                      className={`w-5 h-5 shrink-0 mt-0.5 ${editingUser.role === role.value ? "text-violet-600" : "text-muted-foreground"}`}
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

      {/* ── EDIT SUBSCRIPTION DIALOG ──────────────────────────────────────── */}
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-foreground">Manage Subscription</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set billing tier for{" "}
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
                      {
                        value: "trial" as const,
                        label: "Free Trial",
                        price: "30 days free",
                        desc: "Reset trial window",
                      },
                      {
                        value: "starter" as const,
                        label: "Starter",
                        price: "₹499/mo",
                        desc: "200 products, 3 staff",
                      },
                      {
                        value: "pro" as const,
                        label: "Pro",
                        price: "₹999/mo",
                        desc: "2,000 products, 10 staff",
                      },
                      {
                        value: "enterprise" as const,
                        label: "Enterprise",
                        price: "₹2,499/mo",
                        desc: "Unlimited everything",
                      },
                    ].map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setSelectedPlan(tier.value)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedPlan === tier.value
                            ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-700"
                            : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <p className="text-sm font-bold text-foreground">{tier.label}</p>
                        <p className="text-xs text-violet-600 font-bold mt-0.5">{tier.price}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{tier.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
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
                    Leave blank to grant lifetime subscription.
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
                      "Apply Plan"
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

// ── Shared pagination component ───────────────────────────────────────────────

function Pagination({
  meta,
  page,
  setPage,
}: {
  meta: ISuperAdminMeta | null;
  page: number;
  setPage: (p: number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="p-4 border-t border-border flex items-center justify-between">
      <span className="text-xs text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => setPage(page - 1)}
          className="rounded-lg"
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
