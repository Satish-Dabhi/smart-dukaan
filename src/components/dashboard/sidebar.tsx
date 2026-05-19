"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Tag, ShoppingCart, FileText,
  Users, Warehouse, BarChart3, Settings, Zap, QrCode,
  ChevronLeft, ChevronRight, ShoppingBag, Store
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  locale: string;
}

const getNavItems = (locale: string) => [
  {
    group: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: `/${locale}/dashboard` },
      { icon: Zap, label: "POS Billing", href: `/${locale}/dashboard/pos` },
    ],
  },
  {
    group: "Catalog",
    items: [
      { icon: Package, label: "Products", href: `/${locale}/dashboard/products` },
      { icon: Tag, label: "Categories", href: `/${locale}/dashboard/categories` },
    ],
  },
  {
    group: "Sales",
    items: [
      { icon: ShoppingCart, label: "Orders", href: `/${locale}/dashboard/orders` },
      { icon: FileText, label: "Invoices", href: `/${locale}/dashboard/invoices` },
      { icon: Users, label: "Customers", href: `/${locale}/dashboard/customers` },
    ],
  },
  {
    group: "Operations",
    items: [
      { icon: Warehouse, label: "Inventory", href: `/${locale}/dashboard/inventory` },
      { icon: BarChart3, label: "Analytics", href: `/${locale}/dashboard/analytics` },
      { icon: QrCode, label: "QR Codes", href: `/${locale}/dashboard/qr-codes` },
    ],
  },
  {
    group: "Store",
    items: [
      { icon: Store, label: "Storefront", href: `/${locale}/dashboard/storefront` },
      { icon: Settings, label: "Settings", href: `/${locale}/dashboard/settings` },
    ],
  },
];

export function DashboardSidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = getNavItems(locale);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden md:flex flex-col bg-card border-r border-border h-full z-10 flex-shrink-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-base gradient-text whitespace-nowrap"
              >
                SmartDukaan
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navItems.map((group) => (
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
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      )}
                      title={collapsed ? item.label : undefined}
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
                            className="whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
