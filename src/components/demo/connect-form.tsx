"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Coffee,
  Apple,
  Activity,
  Smartphone,
  PlusCircle,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConnectSchema } from "@/lib/schemas";

export function ConnectForm() {
  const t = useTranslations("demo");
  const locale = useLocale();

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Business Category Options with Icons
  const categoryOptions = [
    { id: "retail", label: t("retail"), icon: ShoppingBag, color: "from-violet-500 to-indigo-500" },
    {
      id: "restaurant",
      label: t("restaurant"),
      icon: Coffee,
      color: "from-amber-500 to-orange-500",
    },
    { id: "grocery", label: t("grocery"), icon: Apple, color: "from-emerald-500 to-teal-500" },
    { id: "pharmacy", label: t("pharmacy"), icon: Activity, color: "from-rose-500 to-pink-500" },
    {
      id: "electronics",
      label: t("electronics"),
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
    },
    { id: "other", label: t("other"), icon: PlusCircle, color: "from-gray-500 to-slate-500" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    // Validate client-side using Zod
    const validation = ConnectSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
      } else {
        setFormErrors(result.errors || { form: "Something went wrong. Please try again." });
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setFormErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-650/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual Features Highlights */}
          <div className="lg:col-span-5 text-left text-foreground flex flex-col space-y-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/50 text-violet-650 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SmartDukaan Live Demo</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-650 via-indigo-650 to-pink-600 bg-clip-text text-transparent"
              >
                {t("title")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed"
              >
                {t("subtitle")}
              </motion.p>
            </div>

            {/* Feature Points Grid */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-2">
                {t("featuresTitle")}
              </h2>
              {(["feature1", "feature2", "feature3", "feature4"] as const).map((key, idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx + 1) * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-sm font-medium text-foreground/80 pt-0.5">{t(key)}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-4 text-xs text-muted-foreground font-semibold"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-violet-500 border-2 border-background flex items-center justify-center font-bold text-white">
                  S
                </div>
                <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-background flex items-center justify-center font-bold text-white">
                  D
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center font-bold text-white">
                  A
                </div>
              </div>
              <span>Trusted by 10,000+ businesses across India</span>
            </motion.div>
          </div>

          {/* Right Column: Premium Form Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-900/70 backdrop-blur-xl border border-gray-150 dark:border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
                >
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-foreground">{t("formTitle")}</h2>
                    <p className="text-sm text-muted-foreground mt-1.5">{t("formSubtitle")}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t("fullName")} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            required
                            type="text"
                            placeholder={t("fullNamePlaceholder")}
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className={`h-11 pl-10 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 focus-visible:ring-violet-650 ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.name && (
                          <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Business Name */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t("businessName")} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            required
                            type="text"
                            placeholder={t("businessNamePlaceholder")}
                            value={formData.businessName}
                            onChange={(e) => handleInputChange("businessName", e.target.value)}
                            className={`h-11 pl-10 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 focus-visible:ring-violet-650 ${formErrors.businessName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.businessName && (
                          <p className="text-xs text-destructive mt-1">{formErrors.businessName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Business Email */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t("email")} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            required
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={`h-11 pl-10 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 focus-visible:ring-violet-650 ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {t("phone")} <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                          <Input
                            required
                            type="tel"
                            placeholder={t("phonePlaceholder")}
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className={`h-11 pl-10 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 focus-visible:ring-violet-650 ${formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Premium Custom Business Category Select (Grid style buttons) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {t("businessType")} <span className="text-destructive">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categoryOptions.map((opt) => {
                          const IconComp = opt.icon;
                          const isSelected = formData.businessType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleInputChange("businessType", opt.id)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? "border-violet-600 bg-violet-50/40 dark:bg-violet-950/15 text-violet-650 dark:text-violet-400 shadow-md shadow-violet-100 dark:shadow-none scale-[1.02]"
                                  : "border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30 text-muted-foreground"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                                  isSelected
                                    ? `bg-gradient-to-br ${opt.color} text-white`
                                    : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                                }`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="text-center font-medium leading-tight">
                                {opt.label}
                              </span>
                              {isSelected && (
                                <motion.div
                                  layoutId="selected-cat-glow"
                                  className="absolute inset-0 border border-violet-600 rounded-2xl pointer-events-none"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.businessType && (
                        <p className="text-xs text-destructive mt-1.5">{formErrors.businessType}</p>
                      )}
                    </div>

                    {/* Requirements / Notes */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {t("notes")}
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                        <textarea
                          rows={3}
                          placeholder={t("notesPlaceholder")}
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          className="w-full rounded-xl border border-input bg-gray-50/50 dark:bg-gray-950/20 pl-10 pr-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-650 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      {formErrors.notes && (
                        <p className="text-xs text-destructive mt-1">{formErrors.notes}</p>
                      )}
                    </div>

                    {formErrors.form && (
                      <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
                        {formErrors.form}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="gradient"
                      className="w-full h-12 text-base font-bold rounded-2xl shadow-xl shadow-violet-200 dark:shadow-violet-900/20 transition-transform active:scale-[0.98] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t("submitting")}
                        </>
                      ) : (
                        <>
                          {t("submit")}
                          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                // Beautiful interactive Success State Screen
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 flex flex-col items-center justify-center min-h-[500px]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-pink-650 text-white flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>

                  <div className="space-y-2 max-w-md">
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-650 to-pink-600 bg-clip-text text-transparent">
                      {t("successTitle")}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                      {t("successMessage").replace("{email}", formData.email)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-950/40 rounded-2xl p-4 w-full max-w-md border border-gray-150 dark:border-gray-900 text-left text-xs text-muted-foreground space-y-2">
                    <span className="font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                      What happens next?
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 mt-1 font-medium leading-relaxed">
                      <li>
                        Check your email inbox for our welcome kit and live demonstration checklist.
                      </li>
                      <li>
                        We are provisioning your personal store playground loaded with test stock.
                      </li>
                      <li>
                        Our product success advisor will dial you shortly to demo the tablet POS.
                      </li>
                    </ol>
                  </div>

                  <div className="pt-4 w-full max-w-md">
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/${locale}`;
                      }}
                      className="w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t("backHome")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
