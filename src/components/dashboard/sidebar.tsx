"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  FileText,
  Users,
  Warehouse,
  BarChart3,
  Settings,
  Zap,
  QrCode,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Store,
  X,
  Lock,
  Building2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface SidebarProps {
  locale: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  role?: string;
  businessId?: string;
}

const getBusinessNavItems = (locale: string, t: (key: string) => string) => [
  {
    group: t("nav.main"),
    items: [
      { icon: LayoutDashboard, label: t("nav.dashboard"), href: `/${locale}/dashboard` },
      { icon: Zap, label: t("nav.pos"), href: `/${locale}/dashboard/pos` },
    ],
  },
  {
    group: t("nav.catalog"),
    items: [
      { icon: Package, label: t("nav.products"), href: `/${locale}/dashboard/products` },
      { icon: Tag, label: t("nav.categories"), href: `/${locale}/dashboard/categories` },
    ],
  },
  {
    group: t("nav.sales"),
    items: [
      { icon: ShoppingCart, label: t("nav.orders"), href: `/${locale}/dashboard/orders` },
      { icon: FileText, label: t("nav.invoices"), href: `/${locale}/dashboard/invoices` },
      { icon: Users, label: t("nav.customers"), href: `/${locale}/dashboard/customers` },
    ],
  },
  {
    group: t("nav.operations"),
    items: [
      { icon: Warehouse, label: t("nav.inventory"), href: `/${locale}/dashboard/inventory` },
      { icon: BarChart3, label: t("nav.analytics"), href: `/${locale}/dashboard/analytics` },
      { icon: QrCode, label: t("nav.qrCodes"), href: `/${locale}/dashboard/qr-codes` },
    ],
  },
  {
    group: t("nav.store"),
    items: [
      { icon: Store, label: t("nav.storefront"), href: `/${locale}/dashboard/storefront` },
      { icon: CreditCard, label: t("nav.billing"), href: `/${locale}/dashboard/billing` },
      { icon: Settings, label: t("nav.settings"), href: `/${locale}/dashboard/settings` },
    ],
  },
];

const getAdminNavItems = (locale: string) => [
  {
    group: "Platform",
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: `/${locale}/dashboard` }],
  },
  {
    group: "Management",
    items: [
      { icon: Users, label: "Users", href: `/${locale}/dashboard/super-admin/users` },
      { icon: Building2, label: "Businesses", href: `/${locale}/dashboard/super-admin/businesses` },
    ],
  },
];

export function DashboardSidebar({ locale, isOpen, setIsOpen, role, businessId }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations();
  const [onboardingStep, setOnboardingStep] = useState<string>("completed");

  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSuperAdmin) {
        setOnboardingStep("completed");
        return;
      }

      const currentStep = localStorage.getItem("smartdukaan_onboarding_step");
      if (currentStep) {
        setOnboardingStep(currentStep);
      } else if (businessId) {
        localStorage.setItem("smartdukaan_onboarding_step", "completed");
        setOnboardingStep("completed");
      } else {
        localStorage.setItem("smartdukaan_onboarding_step", "create_business");
        setOnboardingStep("create_business");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [businessId, isSuperAdmin]);

  useEffect(() => {
    const handleStorageChange = () => {
      const step = localStorage.getItem("smartdukaan_onboarding_step");
      if (step) setOnboardingStep(step);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("onboarding_step_change", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("onboarding_step_change", handleStorageChange);
    };
  }, []);

  const isLocked = (href: string) => {
    if (isSuperAdmin || onboardingStep === "completed") return false;

    const isSettings = href.endsWith("/settings");
    const isCategories = href.endsWith("/categories");
    const isProducts = href.endsWith("/products");
    const isStorefront = href.endsWith("/storefront");

    if (onboardingStep === "create_business") return !isSettings;
    if (onboardingStep === "add_category") return !isSettings && !isCategories;
    if (onboardingStep === "add_product") return !isSettings && !isCategories && !isProducts;
    if (onboardingStep === "visit_storefront")
      return !isSettings && !isCategories && !isProducts && !isStorefront;
    return false;
  };

  const handleLockedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    let instruction = "";
    if (onboardingStep === "create_business") {
      instruction = "Step 1: Setup your Business under settings first!";
    } else if (onboardingStep === "add_category") {
      instruction = "Step 2: Add your first Category to organize your catalog!";
    } else if (onboardingStep === "add_product") {
      instruction = "Step 3: Add your first Product to unlock catalog & sales!";
    } else if (onboardingStep === "visit_storefront") {
      instruction = "Step 4: Preview/Copy your storefront URL to fully unlock!";
    }

    toast.error(`Feature Locked`, {
      description: instruction,
      action: {
        label: "Guide Me",
        onClick: () => {
          if (onboardingStep === "create_business") {
            window.location.href = `/${locale}/dashboard/settings`;
          } else if (onboardingStep === "add_category") {
            window.location.href = `/${locale}/dashboard/categories`;
          } else if (onboardingStep === "add_product") {
            window.location.href = `/${locale}/dashboard/products`;
          } else if (onboardingStep === "visit_storefront") {
            window.location.href = `/${locale}/dashboard/storefront`;
          }
        },
      },
    });
  };

  const navItems = isSuperAdmin ? getAdminNavItems(locale) : getBusinessNavItems(locale, t);

  const renderNavItems = (items: ReturnType<typeof getAdminNavItems>, closeMobile?: () => void) => (
    <>
      {items.map((group) => (
        <div key={group.group}>
          <AnimatePresence>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 mb-2"
              >
                {group.group}
              </motion.p>
            )}
          </AnimatePresence>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href));
              const locked = isLocked(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={locked ? "#" : item.href}
                    onClick={(e) => {
                      if (locked) {
                        handleLockedClick(e);
                      } else {
                        closeMobile?.();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                      locked && "opacity-40 cursor-not-allowed hover:bg-transparent"
                    )}
                    title={collapsed ? (locked ? `${item.label} (Locked)` : item.label) : undefined}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                        isActive && "text-violet-600 dark:text-violet-400"
                      )}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="whitespace-nowrap flex items-center justify-between w-full"
                        >
                          <span>{item.label}</span>
                          {locked && <Lock className="w-3.5 h-3.5 ml-2 text-gray-400 shrink-0" />}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {collapsed && locked && (
                      <div className="absolute right-1 top-1">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-card border-r border-border h-full z-10 flex-shrink-0"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shrink-0">
              {isSuperAdmin ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-white" />
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-base gradient-text whitespace-nowrap"
                >
                  {isSuperAdmin ? "Admin Panel" : "SmartDukaan"}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">{renderNavItems(navItems)}</nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen?.(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 md:hidden flex flex-col h-full shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setIsOpen?.(false)}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shrink-0">
                    {isSuperAdmin ? (
                      <ShieldCheck className="w-5 h-5 text-white" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="font-bold text-base gradient-text whitespace-nowrap">
                    {isSuperAdmin ? "Admin Panel" : "SmartDukaan"}
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen?.(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
                {navItems.map((group) => (
                  <div key={group.group}>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 mb-2">
                      {group.group}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href));
                        const locked = isLocked(item.href);

                        return (
                          <li key={item.href}>
                            <Link
                              href={locked ? "#" : item.href}
                              onClick={(e) => {
                                if (locked) {
                                  handleLockedClick(e);
                                } else {
                                  setIsOpen?.(false);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 group justify-between",
                                isActive
                                  ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                                locked && "opacity-40 cursor-not-allowed hover:bg-transparent"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon
                                  className={cn(
                                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                                    isActive && "text-violet-600 dark:text-violet-400"
                                  )}
                                />
                                <span>{item.label}</span>
                              </div>
                              {locked && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
