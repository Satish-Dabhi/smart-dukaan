"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type NavLink =
  | { type: "anchor"; label: string; sectionId: string }
  | { type: "page"; label: string; href: string };

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handler);
    };
  }, []);

  const navLinks: NavLink[] = [
    { type: "anchor", label: t("features"), sectionId: "features" },
    { type: "anchor", label: "How It Works", sectionId: "how-it-works" },
    { type: "anchor", label: t("pricing"), sectionId: "pricing" },
    { type: "page", label: "Contact", href: `/${locale}/contact` },
  ];

  function linkHref(link: NavLink): string {
    if (link.type === "page") return link.href;
    return isHomePage ? `#${link.sectionId}` : `/${locale}/#${link.sectionId}`;
  }

  const otherLocale = locale === "en" ? "gu" : "en";
  const localePath = locale === "en" ? "/gu" : "/en";

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <Image
              src="/icons/favicon-96x96.png"
              width={32}
              height={32}
              alt="SmartDukaan"
              className="rounded-lg shadow-md group-hover:shadow-violet-500/30 transition-shadow"
            />
            <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              SmartDukaan
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const href = linkHref(link);
              return (
                <a
                  key={link.type === "anchor" ? link.sectionId : link.href}
                  href={href}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href={localePath}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-600 dark:text-gray-300"
              >
                <Globe className="w-4 h-4" />
                {otherLocale === "gu" ? "ગુ" : "EN"}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-violet-600" />
                ))}
              {!mounted && <div className="w-4 h-4" />}
            </Button>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
            <Link href={`/${locale}/auth/login`}>
              <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-200">
                {t("login")}
              </Button>
            </Link>
            <Link href={`/${locale}/auth/register`}>
              <Button variant="gradient" size="sm" className="shadow-md shadow-violet-500/20">
                {t("signup")}
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const href = linkHref(link);
                return (
                  <a
                    key={link.type === "anchor" ? link.sectionId : link.href}
                    href={href}
                    className="block text-sm font-medium text-gray-600 dark:text-gray-300 py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 mt-2">
                <div className="flex gap-2">
                  <Link href={localePath} className="flex-1" onClick={() => setIsMobileOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <Globe className="w-4 h-4" />
                      {otherLocale === "gu" ? "ગુજરાતી" : "English"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 justify-center"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      setIsMobileOpen(false);
                    }}
                  >
                    {mounted && (
                      <>
                        {theme === "dark" ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span>{t("lightMode")}</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-violet-600" />
                            <span>{t("darkMode")}</span>
                          </>
                        )}
                      </>
                    )}
                    {!mounted && <div className="h-4 w-4" />}
                  </Button>
                </div>
                <Link href={`/${locale}/auth/login`} onClick={() => setIsMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t("login")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`} onClick={() => setIsMobileOpen(false)}>
                  <Button variant="gradient" className="w-full">
                    {t("signup")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
