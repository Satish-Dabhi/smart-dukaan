"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Bell, Sun, Moon, LogOut, Settings, User, ChevronDown, Globe, Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

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

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-lg relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

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
