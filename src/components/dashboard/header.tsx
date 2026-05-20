"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Bell, Sun, Moon, LogOut, Settings, User, ChevronDown, Globe, Menu, ShoppingBag, AlertTriangle, Info, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface HeaderProps {
  session: Session;
  locale: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ session, locale, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentLocale = useLocale();
  const t = useTranslations("header");
  const otherLocale = currentLocale === "en" ? "gu" : "en";
  const otherLocalePath = `/${otherLocale}/dashboard`;
  const user = session.user;

  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
          setUnreadCount(json.data.filter((n: any) => !n.read).length);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Setup simple polling every 15 seconds to fetch new orders/low stock alerts dynamically!
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification._id}`, {
          method: "PATCH",
        });
        fetchNotifications();
      } catch (error) {
        console.error("Error marking notification read:", error);
      }
    }
    setShowNotifications(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden rounded-lg mr-1 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        {/* Mobile logo */}
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base gradient-text whitespace-nowrap">
            SmartDukaan
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <Link href={otherLocalePath}>
          <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 hidden sm:flex">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold">{otherLocale.toUpperCase()}</span>
          </Button>
        </Link>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications Popover */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="rounded-lg relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border z-20 overflow-hidden flex flex-col max-h-[480px]">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gray-50/55 dark:bg-gray-800/35">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-border scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/20 text-violet-500 rounded-full flex items-center justify-center mb-3">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        All caught up!
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        No new notifications at the moment.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3 items-start",
                          !n.read && "bg-violet-50/20 dark:bg-violet-950/5"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
                          n.type === "order"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/30"
                            : n.type === "inventory"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-100 dark:border-amber-900/30"
                            : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-100 dark:border-blue-900/30"
                        )}>
                          {n.type === "order" ? (
                            <ShoppingBag className="w-4 h-4" />
                          ) : n.type === "inventory" ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-xs font-bold text-gray-900 dark:text-white truncate",
                              !n.read && "text-violet-600 dark:text-violet-400"
                            )}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 bg-violet-600 dark:bg-violet-400 rounded-full shrink-0 mt-2" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
              <AvatarFallback className="text-xs">
                {getInitials(user?.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border z-20 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={`/${locale}/dashboard/profile`}
                    className={cn("flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors")}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t("profile")}
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/settings`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {t("settings")}
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                  <button
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("signOut")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
