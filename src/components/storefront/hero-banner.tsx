import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone,
  MapPin,
  Share2,
  QrCode,
  MessageCircle,
  Sun,
  Moon,
  Store,
  LogIn,
  LogOut,
  ChevronDown,
  ShoppingCart,
  ShoppingBag,
  LayoutDashboard,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import type { IBusiness } from "@/types";
import type { Session } from "next-auth";
import { themeMap } from "./theme-config";

interface HeroBannerProps {
  business: IBusiness;
  session: Session | null;
  cartCount: number;
  cartTotal: number;
  resolvedTheme: string | undefined;
  setTheme: (theme: string) => void;
  locale: string;
  setShowCart: (show: boolean) => void;
  showAuthDropdown: boolean;
  setShowAuthDropdown: (show: boolean) => void;
  setShowQR: (show: boolean) => void;
  pathname: string;
  t: (en: string, gu: string) => string;
  storeUrl: string;
  formatCurrency: (value: number) => string;
}

export function HeroBanner({
  business,
  session,
  cartCount,
  cartTotal,
  resolvedTheme,
  setTheme,
  locale,
  setShowCart,
  showAuthDropdown,
  setShowAuthDropdown,
  setShowQR,
  pathname,
  t,
  storeUrl,
  formatCurrency,
}: HeroBannerProps) {
  const theme = themeMap[business.theme ?? ""] ?? themeMap.minimal;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={`relative bg-gradient-to-br ${theme.from} ${theme.to} rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg`}
    >
      {/* Background decorations clip container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-[2rem] sm:rounded-b-[3rem]">
        {business.banner && (
          <Image src={business.banner} alt="" fill className="object-cover opacity-20" priority />
        )}
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Floating Top Right Controls */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-50">
          {cartCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="hidden sm:flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-750 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-violet-500" />
              <span className="font-bold">{cartCount}</span>
              <span className="font-bold">{formatCurrency(cartTotal)}</span>
            </button>
          )}

          {/* Account / Login Controls */}
          <div className="relative auth-dropdown-container">
            {session ? (
              <>
                <button
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-750 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold uppercase shrink-0">
                    {session.user.name ? session.user.name[0] : "C"}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {session.user.name || "Customer"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showAuthDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showAuthDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-150/80 dark:border-gray-850 p-4 z-50 flex flex-col gap-3 text-left"
                    >
                      <div className="border-b border-gray-100 dark:border-gray-850 pb-2">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                          {t("Signed In As", "આના તરીકે લોગ ઇન કરેલ")}
                        </p>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                          {session.user.name || "User"}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user.email}
                        </p>
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/45 text-violet-650 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50">
                          {session.user.role === "customer"
                            ? t("🛍️ Customer", "🛍️ ગ્રાહક")
                            : t("💼 Merchant", "💼 વેપારી")}
                        </div>
                      </div>

                      {session.user.role === "customer" ? (
                        <Link
                          href={`/${locale}/account/orders`}
                          onClick={() => setShowAuthDropdown(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/15 dark:bg-violet-500/15 dark:hover:bg-violet-500/20 text-violet-650 dark:text-violet-400 text-xs font-bold transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            <span>{t("My Orders", "મારા ઓર્ડર")}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ) : (
                        <Link
                          href={`/${locale}/dashboard`}
                          onClick={() => setShowAuthDropdown(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/15 dark:bg-violet-500/15 dark:hover:bg-violet-500/20 text-violet-650 dark:text-violet-400 text-xs font-bold transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            <span>{t("Go to Dashboard", "ડૅશબોર્ડ")}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setShowAuthDropdown(false);
                          import("next-auth/react").then((m) => m.signOut());
                        }}
                        className="flex items-center gap-2 w-full p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-400 text-xs font-semibold transition-colors mt-1 border border-transparent hover:border-red-100 dark:hover:border-red-950/30 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("Sign Out", "લૉગ આઉટ")}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-750 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t("Login", "લૉગ ઇન")}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showAuthDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showAuthDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-150/80 dark:border-gray-800 p-3.5 z-50 flex flex-col gap-2 text-left"
                    >
                      <div className="px-2 py-1 mb-1">
                        <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">
                          {t("Welcome to Store!", "સ્ટોરમાં આપનું સ્વાગત છે!")}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {t(
                            "Choose a portal to sign in or get started",
                            "સાઇન ઇન કરવા અથવા શરૂ કરવા માટે પોર્ટલ પસંદ કરો"
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/${locale}/auth/customer-auth?callbackUrl=${encodeURIComponent(pathname)}`}
                        onClick={() => setShowAuthDropdown(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-violet-50/70 dark:hover:bg-violet-950/20 text-gray-700 dark:text-gray-300 hover:text-violet-650 dark:hover:text-violet-400 border border-transparent hover:border-violet-100 dark:hover:border-violet-900/40 transition-all group"
                      >
                        <div className="p-2 bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-violet-650 dark:group-hover:text-violet-400">
                              {t("Customer Sign In", "ગ્રાહક લૉગ ઇન")}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 group-hover:text-violet-500 transition-all" />
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                            {t(
                              "Track orders, bills & invoice receipts.",
                              "તમારા ઓર્ડર અને બિલ ટ્રૅક કરો."
                            )}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={`/${locale}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}
                        onClick={() => setShowAuthDropdown(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20 text-gray-700 dark:text-gray-300 hover:text-emerald-650 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 transition-all group border-t border-gray-100/50 dark:border-gray-800/50"
                      >
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-650 dark:group-hover:text-emerald-400">
                              {t("Merchant Portal", "વેપારી પોર્ટલ")}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 group-hover:text-emerald-500 transition-all" />
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                            {t(
                              "Manage store, inventory, bills & settings.",
                              "સ્ટોર, ઇન્વેન્ટરી અને બિલ મેનેજ કરો."
                            )}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              href={`/${locale}/business/${business.slug}`}
              className="block hover:scale-[1.02] active:scale-95 transition-all"
            >
              {business.logo ? (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30 shadow-2xl">
                  <Image
                    src={business.logo}
                    alt={business.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-2xl group overflow-hidden">
                  <Store className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              )}
            </Link>
          </div>

          {/* Business info */}
          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("Verified", "ચકાસાયેલ")}
              </Badge>
              {business.theme && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs capitalize">
                  {business.theme}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-sm">
              {business.name}
            </h1>
            {(locale === "gu" ? business.taglineGu : business.tagline) && (
              <p className="text-white/80 mt-2 text-base sm:text-lg max-w-lg">
                {locale === "gu" ? business.taglineGu : business.tagline}
              </p>
            )}
            {business.description && (
              <p className="text-white/70 mt-1 text-sm max-w-lg line-clamp-2">
                {business.description}
              </p>
            )}

            {/* Action chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {business.phone}
                </a>
              )}
              {(business.city || business.state) && (
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  <MapPin className="w-3.5 h-3.5" />
                  {[business.city, business.state].filter(Boolean).join(", ")}
                </span>
              )}
              {business.whatsappNumber && (
                <a
                  href={`https://wa.me/${business.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-emerald-400/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                {t("QR Menu", "QR મેનૂ")}
              </button>
              <button
                onClick={() => navigator.share?.({ url: storeUrl, title: business.name })}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {t("Share", "શેર")}
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20 cursor-pointer"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
                <span>
                  {resolvedTheme === "dark"
                    ? t("Light Mode", "લાઇટ મોડ")
                    : t("Dark Mode", "ડાર્ક મોડ")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple internal Badge component to avoid importing shadcn UI components unnecessarily
function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    >
      {children}
    </span>
  );
}

// Internal Building2 icon component in case it's not present or standard
function Building2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
