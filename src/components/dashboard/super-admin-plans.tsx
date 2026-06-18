"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Zap,
  Lock,
  Unlock,
  Check,
  ToggleLeft,
  ToggleRight,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlanFeatures {
  products: number;
  staff: number;
  customers: number;
  invoicesPerMonth: number;
  analyticsHistory: number;
  onlineStorefront: boolean;
  whatsappOrders: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

interface AdminPlan {
  _id: string;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  durationDays: number | null;
  isTrial: boolean;
  isActive: boolean;
  sortOrder: number;
  features: PlanFeatures;
}

type DialogMode = "create" | "edit" | null;

const EMPTY_FEATURES: PlanFeatures = {
  products: 50,
  staff: 2,
  customers: 100,
  invoicesPerMonth: 100,
  analyticsHistory: 30,
  onlineStorefront: true,
  whatsappOrders: true,
  customDomain: false,
  prioritySupport: false,
  apiAccess: false,
};

const EMPTY_FORM = {
  slug: "",
  name: "",
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  durationDays: null as number | null,
  isTrial: false,
  isActive: true,
  sortOrder: 0,
  features: { ...EMPTY_FEATURES },
};

const planColors: Record<string, { bg: string; text: string; border: string }> = {
  trial: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800",
  },
  starter: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  pro: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
  },
  enterprise: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
};

export function SuperAdminPlans() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/super-admin/plans");
      const json = await res.json();
      if (json.success) setPlans(json.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, features: { ...EMPTY_FEATURES } });
    setEditingPlan(null);
    setDialogMode("create");
  };

  const openEdit = (plan: AdminPlan) => {
    setForm({
      slug: plan.slug,
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      durationDays: plan.durationDays,
      isTrial: plan.isTrial,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
      features: { ...plan.features },
    });
    setEditingPlan(plan);
    setDialogMode("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url =
        dialogMode === "edit"
          ? `/api/super-admin/plans?id=${editingPlan!._id}`
          : "/api/super-admin/plans";
      const method = dialogMode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to save plan");
      setDialogMode(null);
      setIsLoading(true);
      fetchPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: AdminPlan) => {
    if (
      !confirm(
        `Delete the "${plan.name}" plan? Existing businesses on this plan keep their access until their subscription is manually changed.`
      )
    )
      return;
    setDeletingId(plan._id);
    try {
      const res = await fetch(`/api/super-admin/plans?id=${plan._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to delete");
      setIsLoading(true);
      fetchPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (plan: AdminPlan) => {
    setTogglingId(plan._id);
    try {
      const res = await fetch(`/api/super-admin/plans?id=${plan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to update");
      setIsLoading(true);
      fetchPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle");
    } finally {
      setTogglingId(null);
    }
  };

  const setFeature = (key: keyof PlanFeatures, value: number | boolean) => {
    setForm((prev) => ({ ...prev, features: { ...prev.features, [key]: value } }));
  };

  const numericFeatures: { key: keyof PlanFeatures; label: string; hint: string }[] = [
    { key: "products", label: "Products", hint: "-1 = unlimited" },
    { key: "staff", label: "Staff Accounts", hint: "-1 = unlimited" },
    { key: "customers", label: "Customers", hint: "-1 = unlimited" },
    { key: "invoicesPerMonth", label: "Invoices / Month", hint: "-1 = unlimited" },
    { key: "analyticsHistory", label: "Analytics History (days)", hint: "-1 = all time" },
  ];

  const booleanFeatures: { key: keyof PlanFeatures; label: string }[] = [
    { key: "onlineStorefront", label: "Online Storefront" },
    { key: "whatsappOrders", label: "WhatsApp Orders" },
    { key: "customDomain", label: "Custom Domain" },
    { key: "prioritySupport", label: "Priority Support" },
    { key: "apiAccess", label: "API Access" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <PackageCheck className="w-7 h-7 text-violet-600" />
            Plan Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage subscription plans. Features update immediately for all businesses on
            each plan.
          </p>
        </div>
        <Button variant="gradient" onClick={openCreate} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const colors = planColors[plan.slug] ?? planColors.starter;
            return (
              <Card
                key={plan._id}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${plan.isActive ? colors.border : "border-border opacity-60"}`}
              >
                <div
                  className={`p-4 ${colors.bg} border-b ${colors.border} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-lg ${colors.text}`}>{plan.name}</span>
                        {plan.isTrial && (
                          <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-[10px] font-bold">
                            Trial
                          </Badge>
                        )}
                        <Badge
                          className={
                            plan.isActive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-bold"
                              : "bg-gray-100 text-gray-500 border-gray-200 text-[10px] font-bold"
                          }
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{plan.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(plan)}
                      disabled={togglingId === plan._id}
                      className="rounded-lg text-muted-foreground hover:text-foreground"
                      title={plan.isActive ? "Deactivate plan" : "Activate plan"}
                    >
                      {togglingId === plan._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : plan.isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(plan)}
                      className="rounded-lg text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!plan.isTrial && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === plan._id}
                        onClick={() => handleDelete(plan)}
                        className="rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        {deletingId === plan._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>

                  {/* Pricing */}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                        Monthly
                      </span>
                      <span className="font-black text-foreground text-lg">
                        {plan.priceMonthly === 0
                          ? "Free"
                          : `₹${plan.priceMonthly.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    {plan.priceYearly > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                          Yearly
                        </span>
                        <span className="font-bold text-foreground">
                          ₹{plan.priceYearly.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {plan.durationDays && (
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                          Duration
                        </span>
                        <span className="font-bold text-foreground">{plan.durationDays} days</span>
                      </div>
                    )}
                  </div>

                  {/* Numeric limits */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { label: "Products", value: plan.features.products },
                      { label: "Staff", value: plan.features.staff },
                      { label: "Customers", value: plan.features.customers },
                      { label: "Invoices/mo", value: plan.features.invoicesPerMonth },
                      {
                        label: "Analytics",
                        value: plan.features.analyticsHistory,
                        suffix: plan.features.analyticsHistory === -1 ? "" : "d",
                      },
                    ].map((f) => (
                      <div
                        key={f.label}
                        className="flex items-center justify-between bg-muted/40 rounded-lg px-2 py-1"
                      >
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="font-bold text-foreground">
                          {f.value === -1
                            ? "∞"
                            : `${f.value.toLocaleString("en-IN")}${f.suffix ?? ""}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Boolean features */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "onlineStorefront", label: "Storefront" },
                      { key: "whatsappOrders", label: "WhatsApp" },
                      { key: "customDomain", label: "Custom Domain" },
                      { key: "prioritySupport", label: "Priority Support" },
                      { key: "apiAccess", label: "API" },
                    ].map((f) => {
                      const enabled = plan.features[f.key as keyof PlanFeatures] as boolean;
                      return (
                        <span
                          key={f.key}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            enabled
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800 line-through"
                          }`}
                        >
                          {enabled ? (
                            <Check className="w-2.5 h-2.5" />
                          ) : (
                            <X className="w-2.5 h-2.5" />
                          )}
                          {f.label}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT DIALOG ─────────────────────────────────────── */}
      <AnimatePresence>
        {dialogMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setDialogMode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-foreground">
                    {dialogMode === "create" ? "Create New Plan" : `Edit "${editingPlan?.name}"`}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dialogMode === "create"
                      ? "Add a new subscription tier to offer businesses."
                      : "Update plan details and feature limits."}
                  </p>
                </div>
                <button
                  onClick={() => setDialogMode(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Plan Name *
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Starter"
                      required
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Slug *{" "}
                      {dialogMode === "edit" && (
                        <span className="text-[10px] text-amber-500">(read-only)</span>
                      )}
                    </label>
                    <Input
                      value={form.slug}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                      placeholder="e.g. starter"
                      required
                      readOnly={dialogMode === "edit"}
                      className="h-10 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Description *
                  </label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Perfect for small shops getting started"
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Monthly Price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.priceMonthly}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, priceMonthly: Number(e.target.value) }))
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Yearly Price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.priceYearly}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, priceYearly: Number(e.target.value) }))
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Duration (days)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Leave blank = no expiry"
                      value={form.durationDays ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          durationDays: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Sort + Flags */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Sort Order</span>
                    <Input
                      type="number"
                      min="0"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
                      }
                      className="h-8 w-20 rounded-lg"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-semibold text-foreground">Active</span>
                  </label>
                  {dialogMode === "create" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isTrial}
                        onChange={(e) => setForm((p) => ({ ...p, isTrial: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        Mark as Trial plan
                      </span>
                    </label>
                  )}
                </div>

                {/* Numeric Feature Limits */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Feature Limits{" "}
                    <span className="normal-case font-normal">(use -1 for unlimited)</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {numericFeatures.map((f) => (
                      <div key={f.key}>
                        <label className="text-xs text-muted-foreground block mb-1">
                          {f.label}
                        </label>
                        <Input
                          type="number"
                          min="-1"
                          value={form.features[f.key] as number}
                          onChange={(e) => setFeature(f.key, Number(e.target.value))}
                          className="h-9 rounded-xl text-sm"
                          placeholder={f.hint}
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">{f.hint}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boolean Features */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Feature Access
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {booleanFeatures.map((f) => {
                      const enabled = form.features[f.key] as boolean;
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setFeature(f.key, !enabled)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all ${
                            enabled
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                              : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {enabled ? (
                            <Unlock className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogMode(null)}
                    className="rounded-xl h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={saving}
                    className="rounded-xl h-11 px-6"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {dialogMode === "create" ? "Create Plan" : "Save Changes"}
                      </>
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
