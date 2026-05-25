"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MapPin,
  Share2,
  QrCode,
  MessageCircle,
  Search,
  Star,
  ShoppingCart,
  X,
  CheckCircle,
  Truck,
  Shield,
  Sun,
  Moon,
  Store,
  Loader2,
  LogIn,
  LogOut,
  Carrot,
  Milk,
  Coffee,
  Cookie,
  Pill,
  Shirt,
  Scissors,
  Sparkles,
  Package,
  Leaf,
  ShoppingBag,
  Apple,
  Cake,
  Utensils,
  Tv,
  Candy,
  BookOpen,
  Flame,
  Heart,
  Tag,
  Gift,
  Gem,
  Crown,
  Banana,
  Egg,
  Wheat,
  Grape,
  Cherry,
  CupSoda,
  GlassWater,
  Croissant,
  IceCream,
  Pizza,
  Soup,
  ChefHat,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Smile,
  Clock,
} from "lucide-react";
import { useTheme } from "next-themes";
import { formatCurrency, debounce } from "@/lib/utils";
import type { IBusiness, IProduct, ICategory, CartItem, IOrder } from "@/types";
import { QRCodeCanvas } from "qrcode.react";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";

interface StorefrontProps {
  business: IBusiness;
  products: IProduct[];
  categories: ICategory[];
  locale: string;
  filters: { category?: string; q?: string; sort?: string };
}

const themeMap: Record<string, { from: string; to: string; accent: string }> = {
  grocery: { from: "from-emerald-600", to: "to-teal-700", accent: "bg-emerald-600" },
  cafe: { from: "from-amber-600", to: "to-orange-700", accent: "bg-amber-600" },
  bakery: { from: "from-rose-500", to: "to-pink-700", accent: "bg-rose-500" },
  restaurant: { from: "from-red-600", to: "to-orange-700", accent: "bg-red-600" },
  medical: { from: "from-blue-600", to: "to-cyan-700", accent: "bg-blue-600" },
  salon: { from: "from-purple-600", to: "to-pink-700", accent: "bg-purple-600" },
  retail: { from: "from-indigo-600", to: "to-violet-700", accent: "bg-indigo-600" },
  minimal: { from: "from-violet-600", to: "to-purple-700", accent: "bg-violet-600" },
};

const themeAestheticMap: Record<
  string,
  {
    fontFamily: string;
    bgColor: string;
    cardStyle: string;
    isCulinaryMenu: boolean;
    buttonClass: string;
    badgeClass: string;
  }
> = {
  grocery: {
    fontFamily: "font-sans",
    bgColor: "bg-emerald-50/20 dark:bg-emerald-950/5",
    cardStyle:
      "rounded-2xl border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm",
    isCulinaryMenu: false,
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  cafe: {
    fontFamily: "font-serif",
    bgColor: "bg-[#FAF6F0] dark:bg-[#1C1917] text-stone-900 dark:text-stone-100",
    cardStyle:
      "rounded-xl border-amber-200 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700 shadow-md",
    isCulinaryMenu: true,
    buttonClass: "bg-amber-700 hover:bg-amber-800 text-white",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  },
  bakery: {
    fontFamily: "font-sans",
    bgColor: "bg-[#FFF8F8] dark:bg-[#1E1B1B] text-rose-950 dark:text-rose-50",
    cardStyle:
      "rounded-3xl border-rose-100 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 shadow-sm",
    isCulinaryMenu: false,
    buttonClass: "bg-rose-500 hover:bg-rose-600 text-white rounded-2xl",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
  },
  restaurant: {
    fontFamily: "font-serif",
    bgColor: "bg-[#FCFBF7] dark:bg-[#121212]",
    cardStyle:
      "rounded-lg border-red-200 dark:border-red-900/30 hover:border-red-400 dark:hover:border-red-700 shadow-md",
    isCulinaryMenu: true,
    buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  },
  medical: {
    fontFamily: "font-sans",
    bgColor: "bg-slate-50 dark:bg-slate-950",
    cardStyle:
      "rounded-lg border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 shadow-none",
    isCulinaryMenu: false,
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
  salon: {
    fontFamily: "font-serif",
    bgColor: "bg-[#FAF5FF] dark:bg-[#181124] text-purple-950 dark:text-purple-50",
    cardStyle:
      "rounded-2xl border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700",
    isCulinaryMenu: false,
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
  },
  retail: {
    fontFamily: "font-sans",
    bgColor: "bg-white dark:bg-gray-950",
    cardStyle:
      "rounded-none border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 shadow-none",
    isCulinaryMenu: false,
    buttonClass:
      "bg-indigo-600 hover:bg-indigo-700 text-white uppercase tracking-wider rounded-none",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  minimal: {
    fontFamily: "font-sans",
    bgColor: "bg-white dark:bg-gray-950",
    cardStyle:
      "rounded-xl border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white shadow-none",
    isCulinaryMenu: false,
    buttonClass:
      "bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white",
    badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

// Helper to map category names dynamically to stunning retail icons & gradients
function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes("beverage") ||
    lower.includes("drink") ||
    lower.includes("soda") ||
    lower.includes("juice") ||
    lower.includes("cola")
  ) {
    return {
      icon: CupSoda,
      gradient:
        "from-pink-500/10 to-orange-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    };
  }
  if (
    lower.includes("glasswater") ||
    lower.includes("water") ||
    lower.includes("mineral") ||
    lower.includes("hydration")
  ) {
    return {
      icon: GlassWater,
      gradient:
        "from-cyan-400/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/20",
    };
  }
  if (
    lower.includes("coffee") ||
    lower.includes("tea") ||
    lower.includes("cafe") ||
    lower.includes("chai")
  ) {
    return {
      icon: Coffee,
      gradient:
        "from-orange-500/10 to-amber-600/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    };
  }
  if (
    lower.includes("bakery") ||
    lower.includes("bread") ||
    lower.includes("roti") ||
    lower.includes("croissant")
  ) {
    return {
      icon: Croissant,
      gradient:
        "from-amber-600/10 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-600/20",
    };
  }
  if (
    lower.includes("cake") ||
    lower.includes("sweet") ||
    lower.includes("dessert") ||
    lower.includes("pastry") ||
    lower.includes("mithai")
  ) {
    return {
      icon: Cake,
      gradient:
        "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
  }
  if (
    lower.includes("icecream") ||
    lower.includes("gelato") ||
    lower.includes("kulfi") ||
    lower.includes("cold dessert")
  ) {
    return {
      icon: IceCream,
      gradient:
        "from-pink-400/10 to-rose-400/10 text-pink-500 dark:text-pink-400 border-pink-400/20",
    };
  }
  if (lower.includes("banana")) {
    return {
      icon: Banana,
      gradient:
        "from-yellow-400/10 to-amber-400/10 text-yellow-600 dark:text-yellow-500 border-yellow-400/20",
    };
  }
  if (lower.includes("grape") || lower.includes("wine")) {
    return {
      icon: Grape,
      gradient:
        "from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    };
  }
  if (lower.includes("cherry") || lower.includes("berry")) {
    return {
      icon: Cherry,
      gradient: "from-red-500/10 to-rose-600/10 text-red-600 dark:text-red-400 border-red-500/20",
    };
  }
  if (
    lower.includes("veg") ||
    lower.includes("carrot") ||
    lower.includes("onion") ||
    lower.includes("potato") ||
    lower.includes("sabji")
  ) {
    return {
      icon: Carrot,
      gradient:
        "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    };
  }
  if (lower.includes("fruit") || lower.includes("apple") || lower.includes("mango")) {
    return {
      icon: Apple,
      gradient:
        "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    };
  }
  if (
    lower.includes("dairy") ||
    lower.includes("milk") ||
    lower.includes("cheese") ||
    lower.includes("curd") ||
    lower.includes("butter")
  ) {
    return {
      icon: Milk,
      gradient: "from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    };
  }
  if (lower.includes("egg") || lower.includes("poultry") || lower.includes("eggroll")) {
    return {
      icon: Egg,
      gradient:
        "from-yellow-500/10 to-orange-400/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
    };
  }
  if (
    lower.includes("grain") ||
    lower.includes("wheat") ||
    lower.includes("atta") ||
    lower.includes("flour")
  ) {
    return {
      icon: Wheat,
      gradient:
        "from-amber-500/10 to-yellow-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (
    lower.includes("snack") ||
    lower.includes("cookie") ||
    lower.includes("biscuit") ||
    lower.includes("chips") ||
    lower.includes("namkeen")
  ) {
    return {
      icon: Cookie,
      gradient:
        "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
  }
  if (
    lower.includes("candy") ||
    lower.includes("chocolate") ||
    lower.includes("toffee") ||
    lower.includes("lollipop")
  ) {
    return {
      icon: Candy,
      gradient:
        "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
  }
  if (
    lower.includes("soup") ||
    lower.includes("broth") ||
    lower.includes("hotpot") ||
    lower.includes("maggi")
  ) {
    return {
      icon: Soup,
      gradient:
        "from-amber-500/10 to-red-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (
    lower.includes("pizza") ||
    lower.includes("burger") ||
    lower.includes("slice") ||
    lower.includes("fastfood")
  ) {
    return {
      icon: Pizza,
      gradient: "from-red-500/10 to-yellow-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    };
  }
  if (
    lower.includes("dining") ||
    lower.includes("food") ||
    lower.includes("lunch") ||
    lower.includes("dinner") ||
    lower.includes("meal")
  ) {
    return {
      icon: Utensils,
      gradient: "from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    };
  }
  if (
    lower.includes("chef") ||
    lower.includes("culinary") ||
    lower.includes("catering") ||
    lower.includes("cook")
  ) {
    return {
      icon: ChefHat,
      gradient:
        "from-slate-500/10 to-zinc-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    };
  }
  if (
    lower.includes("medicine") ||
    lower.includes("pharma") ||
    lower.includes("health") ||
    lower.includes("pill") ||
    lower.includes("tablet")
  ) {
    return {
      icon: Pill,
      gradient:
        "from-cyan-500/10 to-blue-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    };
  }
  if (
    lower.includes("heart") ||
    lower.includes("wellness") ||
    lower.includes("organic care") ||
    lower.includes("cardio")
  ) {
    return {
      icon: Heart,
      gradient: "from-red-500/10 to-pink-500/10 text-red-500 dark:text-red-400 border-red-500/20",
    };
  }
  if (
    lower.includes("cloth") ||
    lower.includes("wear") ||
    lower.includes("apparel") ||
    lower.includes("shirt") ||
    lower.includes("fashion")
  ) {
    return {
      icon: Shirt,
      gradient:
        "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    };
  }
  if (
    lower.includes("salon") ||
    lower.includes("parlor") ||
    lower.includes("hair") ||
    lower.includes("grooming") ||
    lower.includes("cut")
  ) {
    return {
      icon: Scissors,
      gradient:
        "from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
    };
  }
  if (
    lower.includes("beauty") ||
    lower.includes("cosmetic") ||
    lower.includes("sparkle") ||
    lower.includes("service")
  ) {
    return {
      icon: Sparkles,
      gradient:
        "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    };
  }
  if (
    lower.includes("electronic") ||
    lower.includes("tv") ||
    lower.includes("appliance") ||
    lower.includes("television")
  ) {
    return {
      icon: Tv,
      gradient:
        "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
  }
  if (
    lower.includes("smartphone") ||
    lower.includes("mobile") ||
    lower.includes("phone") ||
    lower.includes("cellphone")
  ) {
    return {
      icon: Smartphone,
      gradient:
        "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
  }
  if (lower.includes("laptop") || lower.includes("computer") || lower.includes("pc")) {
    return {
      icon: Laptop,
      gradient:
        "from-slate-600/10 to-zinc-700/10 text-slate-700 dark:text-slate-400 border-slate-600/20",
    };
  }
  if (
    lower.includes("headphones") ||
    lower.includes("audio") ||
    lower.includes("music") ||
    lower.includes("sound")
  ) {
    return {
      icon: Headphones,
      gradient:
        "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    };
  }
  if (
    lower.includes("home") ||
    lower.includes("decor") ||
    lower.includes("household") ||
    lower.includes("furniture")
  ) {
    return {
      icon: Home,
      gradient:
        "from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    };
  }
  if (
    lower.includes("organic") ||
    lower.includes("natural") ||
    lower.includes("leaf") ||
    lower.includes("herbal")
  ) {
    return {
      icon: Leaf,
      gradient:
        "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (
    lower.includes("package") ||
    lower.includes("box") ||
    lower.includes("parcel") ||
    lower.includes("delivery")
  ) {
    return {
      icon: Package,
      gradient:
        "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    };
  }
  if (
    lower.includes("shopping") ||
    lower.includes("bag") ||
    lower.includes("grocery bag") ||
    lower.includes("carry bag")
  ) {
    return {
      icon: ShoppingBag,
      gradient:
        "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    };
  }
  if (
    lower.includes("flame") ||
    lower.includes("spicy") ||
    lower.includes("hot") ||
    lower.includes("grill")
  ) {
    return {
      icon: Flame,
      gradient: "from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    };
  }
  if (
    lower.includes("book") ||
    lower.includes("stationery") ||
    lower.includes("notebook") ||
    lower.includes("read")
  ) {
    return {
      icon: BookOpen,
      gradient:
        "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (
    lower.includes("tag") ||
    lower.includes("deal") ||
    lower.includes("sale") ||
    lower.includes("discount") ||
    lower.includes("coupon")
  ) {
    return {
      icon: Tag,
      gradient:
        "from-slate-500/10 to-gray-600/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    };
  }
  if (
    lower.includes("gift") ||
    lower.includes("present") ||
    lower.includes("hamper") ||
    lower.includes("flower")
  ) {
    return {
      icon: Gift,
      gradient:
        "from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
  }
  if (
    lower.includes("gem") ||
    lower.includes("jewelry") ||
    lower.includes("gold") ||
    lower.includes("silver") ||
    lower.includes("diamond")
  ) {
    return {
      icon: Gem,
      gradient:
        "from-cyan-500/10 to-indigo-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    };
  }
  if (
    lower.includes("crown") ||
    lower.includes("luxury") ||
    lower.includes("premium") ||
    lower.includes("royal") ||
    lower.includes("vip")
  ) {
    return {
      icon: Crown,
      gradient:
        "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  if (
    lower.includes("clock") ||
    lower.includes("time") ||
    lower.includes("watch") ||
    lower.includes("timer")
  ) {
    return {
      icon: Clock,
      gradient:
        "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    };
  }
  if (
    lower.includes("smile") ||
    lower.includes("fun") ||
    lower.includes("toy") ||
    lower.includes("kids") ||
    lower.includes("happy")
  ) {
    return {
      icon: Smile,
      gradient:
        "from-yellow-400/10 to-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
    };
  }
  return {
    icon: Store,
    gradient:
      "from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  };
}

export function StorefrontPage({
  business,
  products,
  categories,
  locale,
  filters,
}: StorefrontProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const aesthetic = themeAestheticMap[business.theme ?? ""] ?? themeAestheticMap.minimal;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.q ?? "");

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Checkout and Order states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
    paymentMethod: "cod",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<IOrder | null>(null);

  const pendingCartKey = `sd_pending_cart_${business._id}`;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // After returning from auth: restore saved cart and open checkout
  useEffect(() => {
    if (!session) return;
    const saved = localStorage.getItem(pendingCartKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CartItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const timer = setTimeout(() => {
          setCart(parsed);
          setShowCheckoutModal(true);
        }, 0);
        localStorage.removeItem(pendingCartKey);
        return () => clearTimeout(timer);
      }
    } catch {
      localStorage.removeItem(pendingCartKey);
    }
  }, [session, pendingCartKey]);

  // Pre-fill name from logged-in user
  useEffect(() => {
    if (session?.user?.name) {
      const timer = setTimeout(() => {
        setCheckoutForm((prev) => ({
          ...prev,
          customerName: prev.customerName || session.user.name || "",
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [session?.user?.name]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!checkoutForm.customerName.trim()) {
      errors.customerName = t("Name is required", "નામ જરૂરી છે");
    }
    if (!checkoutForm.customerPhone.trim()) {
      errors.customerPhone = t("Phone number is required", "ફોન નંબર જરૂરી છે");
    } else if (!/^\d{10}$/.test(checkoutForm.customerPhone.replace(/[\s\-()]/g, ""))) {
      errors.customerPhone = t(
        "Enter a valid 10-digit mobile number",
        "10-અંકનો માન્ય મોબાઇલ નંબર દાખલ કરો"
      );
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setIsSubmitting(true);

    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = cart.reduce(
        (sum, item) => sum + item.price * (item.discount / 100) * item.quantity,
        0
      );
      const taxAmount = cart.reduce((sum, item) => {
        const priceAfterDiscount = item.price * (1 - item.discount / 100);
        return sum + priceAfterDiscount * (item.gst / 100) * item.quantity;
      }, 0);
      const total = subtotal - discount + taxAmount;

      const orderPayload = {
        businessId: business._id,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
          gst: item.gst,
        })),
        customerName: checkoutForm.customerName,
        customerPhone: checkoutForm.customerPhone,
        customerEmail: session?.user?.email ?? undefined,
        subtotal,
        discount,
        taxAmount,
        total,
        notes: checkoutForm.notes,
        paymentMethod: checkoutForm.paymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order placement failed");
      }

      setPlacedOrder(data.data);
      setCart([]);
      setShowCheckoutModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setFormErrors({
        form:
          errMsg ||
          t(
            "Something went wrong. Please try again.",
            "કાંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો."
          ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessWhatsApp = () => {
    if (!business.whatsappNumber || !placedOrder) return;
    const itemsList = placedOrder.items
      .map((item) => `${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`)
      .join("\n");
    const message = `Hello ${business.name},\n\nI just placed an order on your site! 😍\n\n*Order Number:* ${placedOrder.orderNumber}\n\n*Items Ordered:*\n${itemsList}\n\n*Total Amount:* ₹${placedOrder.total}\n*Payment Method:* ${placedOrder.paymentMethod ? placedOrder.paymentMethod.toUpperCase() : ""}\n\n*Customer Details:*\nName: ${placedOrder.customerName}\nPhone: ${placedOrder.customerPhone}\n${placedOrder.notes ? `Notes: ${placedOrder.notes}\n` : ""}\nPlease process my order. Thank you!`;
    window.open(
      `https://wa.me/${business.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const theme = themeMap[business.theme ?? ""] ?? themeMap.minimal;
  const storeUrl = typeof window !== "undefined" ? window.location.href : "";

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.q) params.set("q", filters.q);
      if (filters.sort) params.set("sort", filters.sort);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [filters, pathname, router]
  );

  const debouncedSearch = useMemo(
    () => debounce((q: string) => updateFilters({ q: q || undefined }), 400),
    [updateFilters]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const addToCart = (product: IProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          nameGu: product.nameGu,
          price: product.price,
          quantity: 1,
          discount: product.discount ?? 0,
          gst: product.gstPercentage ?? 0,
          image: product.images?.[0],
          stock: 0,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * (1 - item.discount / 100) * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);
  const displayProducts = products;
  const t = (en: string, gu: string) => (locale === "gu" ? gu : en);

  return (
    <div
      className={`min-h-screen ${aesthetic.bgColor} ${aesthetic.fontFamily} transition-colors duration-300`}
    >
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${theme.from} ${theme.to} overflow-hidden`}>
        {business.banner && (
          <div className="absolute inset-0">
            <Image src={business.banner} alt="" fill className="object-cover opacity-20" />
          </div>
        )}
        {/* Decorative circle */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
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
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {t("QR Menu", "QR મેનૂ")}
                </button>
                <button
                  onClick={() => navigator.share?.({ url: storeUrl, title: business.name })}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {t("Share", "શેર")}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20"
                >
                  {mounted && resolvedTheme === "dark" ? (
                    <Sun className="w-3.5 h-3.5" />
                  ) : (
                    <Moon className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {mounted && resolvedTheme === "dark"
                      ? t("Light Mode", "લાઇટ મોડ")
                      : t("Dark Mode", "ડાર્ક મોડ")}
                  </span>
                </button>

                {/* Account / Login Controls */}
                {session ? (
                  <div className="relative flex items-center gap-1.5 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all">
                    <span>👤 {session.user.name || "Customer"}</span>
                    {session.user.role === "customer" ? (
                      <Link
                        href={`/${locale}/account/orders`}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-2.5 py-1 rounded-full text-xs font-bold transition-colors ml-1"
                      >
                        {t("My Orders", "મારા ઓર્ડર")}
                      </Link>
                    ) : (
                      <Link
                        href={`/${locale}/dashboard`}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-2.5 py-1 rounded-full text-xs font-bold transition-colors ml-1"
                      >
                        {t("Dashboard", "ડૅશબોર્ડ")}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        import("next-auth/react").then((m) => m.signOut());
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors pl-1 border-l border-gray-200 ml-1"
                      title={t("Sign Out", "લૉગ આઉટ")}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all">
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t("Login", "લૉગ ઇન")}</span>
                    </button>
                    {/* Hover Dropdown */}
                    <div className="absolute left-0 mt-1 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 hidden group-hover:block hover:block">
                      <Link
                        href={`/${locale}/auth/customer-auth?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        🛍️ {t("Customer Sign In", "ગ્રાહક લૉગ ઇન")}
                      </Link>
                      <Link
                        href={`/${locale}/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-100 dark:border-gray-700"
                      >
                        💼 {t("Merchant Portal", "વેપારી પોર્ટલ")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cart button (top right on desktop) */}
            {cartCount > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="hidden sm:flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                {t("Cart", "કાર્ટ")} ({cartCount})
                <span className="font-bold">{formatCurrency(cartTotal)}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Trust Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              {t("Secure Ordering", "સુરક્ષિત ઓર્ડર")}
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              {t("Fast Delivery", "ઝડપી ડિલિવરી")}
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              {t("WhatsApp Orders", "WhatsApp ઓર્ડર")}
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              {t("Quality Products", "ગુણવત્તા ઉત્પાદનો")}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Search + Filters ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder={t("Search products...", "ઉત્પાદન શોધો...")}
                value={searchValue}
                onChange={handleSearch}
                startIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm cursor-pointer"
              value={filters.sort ?? ""}
              onChange={(e) => updateFilters({ sort: e.target.value || undefined })}
            >
              <option value="">{t("Sort by", "ક્રમ")}</option>
              <option value="newest">{t("Newest", "નવા")}</option>
              <option value="price-asc">{t("Price: Low → High", "કિંમત: ઓછી → વધુ")}</option>
              <option value="price-desc">{t("Price: High → Low", "કિંમત: વધુ → ઓછી")}</option>
              <option value="popular">{t("Most Popular", "સૌથી લોકપ્રિય")}</option>
            </select>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => updateFilters({ category: undefined })}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !filters.category
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t("All", "બધું")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() =>
                    updateFilters({ category: filters.category === cat._id ? undefined : cat._id })
                  }
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filters.category === cat._id
                      ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {locale === "gu" ? (cat.nameGu ?? cat.name) : cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* Category Circle Cards Showcase */}
        {categories.length > 0 && (
          <section className="animate-fadeIn">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Store className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              {t("Browse Categories", "શ્રેણીઓ બ્રાઉઝ કરો")}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {/* "All" Card */}
              <button
                onClick={() => updateFilters({ category: undefined })}
                className="shrink-0 flex flex-col items-center gap-2 group focus:outline-none"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    !filters.category
                      ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 scale-105"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-md text-gray-500 hover:text-violet-600"
                  }`}
                >
                  <Store className="w-6 h-6 transition-transform group-hover:scale-110" />
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    !filters.category
                      ? "text-violet-600 dark:text-violet-400 font-bold"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-violet-600"
                  }`}
                >
                  {t("All Products", "બધા ઉત્પાદનો")}
                </span>
              </button>

              {/* Individual Category Cards */}
              {categories.map((cat) => {
                const isSelected = filters.category === cat._id;
                const { icon: IconComp, gradient } = getCategoryIcon(cat.name);

                return (
                  <button
                    key={cat._id}
                    onClick={() => updateFilters({ category: isSelected ? undefined : cat._id })}
                    className="shrink-0 flex flex-col items-center gap-2 group focus:outline-none"
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isSelected
                          ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 scale-105"
                          : `bg-gradient-to-br ${gradient} border-gray-100 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-md text-current`
                      }`}
                    >
                      <IconComp
                        className={`w-6 h-6 transition-transform group-hover:scale-110 ${isSelected ? "text-white" : ""}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold tracking-wide transition-colors ${
                        isSelected
                          ? "text-violet-600 dark:text-violet-400 font-bold"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-violet-600"
                      }`}
                    >
                      {locale === "gu" ? (cat.nameGu ?? cat.name) : cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Featured Products (if no active filter) ─────────────────── */}
        {!filters.category && !filters.q && featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-bold text-foreground">
                {t("Featured Picks", "ખાસ ઉત્પાદનો")}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                  index={i}
                  onAdd={addToCart}
                  compact
                  categories={categories}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Main Products Grid ───────────────────────────────────────── */}
        <section>
          {(filters.category || filters.q) && (
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xl font-bold text-foreground">
                {filters.q
                  ? t(`Results for "${filters.q}"`, `"${filters.q}" માટે પરિણામ`)
                  : categories.find((c) => c._id === filters.category)
                    ? t(
                        `${categories.find((c) => c._id === filters.category)?.name}`,
                        `${categories.find((c) => c._id === filters.category)?.nameGu ?? ""}`
                      )
                    : t("Products", "ઉત્પાદનો")}
              </h2>
              <Badge variant="secondary">{displayProducts.length}</Badge>
            </div>
          )}

          {displayProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4 text-4xl">
                🔍
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("No products found", "કોઈ ઉત્પાદન મળ્યું નહીં")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("Try a different search or browse all categories", "અલગ શોધ અજમાવો")}
              </p>
              {(filters.q || filters.category) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => updateFilters({ q: undefined, category: undefined })}
                >
                  {t("Clear filters", "ફિલ્ટર સાફ કરો")}
                </Button>
              )}
            </div>
          ) : aesthetic.isCulinaryMenu ? (
            <div className="max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-amber-100/50 dark:border-stone-800 shadow-xl shadow-amber-500/5">
              {displayProducts.map((product) => {
                const discountedPrice = product.price * (1 - (product.discount ?? 0) / 100);
                const hasDiscount = (product.discount ?? 0) > 0;
                return (
                  <div
                    key={product._id}
                    className="flex items-start justify-between gap-4 py-4 border-b border-dashed border-stone-200 dark:border-stone-850 last:border-none group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {locale === "gu" ? (product.nameGu ?? product.name) : product.name}
                        </h3>
                        {/* Show category label if present */}
                        {(() => {
                          const cat = categories.find((c) => c._id === product.categoryId);
                          if (cat) {
                            return (
                              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-stone-850 dark:text-amber-300">
                                {locale === "gu" ? (cat.nameGu ?? cat.name) : cat.name}
                              </span>
                            );
                          }
                          return null;
                        })()}
                        <div className="flex-1 border-b border-dotted border-stone-300 dark:border-stone-700 mx-2" />
                        <div className="shrink-0 text-right">
                          <span className="font-extrabold text-amber-700 dark:text-amber-500 text-base sm:text-lg">
                            {formatCurrency(discountedPrice)}
                          </span>
                          {hasDiscount && product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through block">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 pr-4 sm:pr-8 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {product.unit && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                          >
                            {product.unit}
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-2 py-0.5 font-medium"
                          >
                            {t("Out of Stock", "સ્ટૉક ખાલી")}
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge
                            variant="secondary"
                            className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-[10px] px-2 py-0.5 font-bold"
                          >
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 relative border border-gray-100 dark:border-gray-800 shadow-sm shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ProductImageFallback
                            name={product.name}
                            icon={product.icon}
                            className="w-full h-full"
                            iconClassName="w-6 h-6 sm:w-8 sm:h-8"
                          />
                        )}
                      </div>
                      <button
                        disabled={!product.inStock}
                        onClick={() => addToCart(product)}
                        className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-sm transition-all duration-200 ${
                          !product.inStock
                            ? "bg-gray-100 dark:bg-gray-850 text-muted-foreground cursor-not-allowed"
                            : `${aesthetic.buttonClass} hover:opacity-90 active:scale-95`
                        }`}
                      >
                        {!product.inStock ? t("Unavailable", "ઉપલબ્ધ નથી") : t("+ Add", "+ ઉમેરો")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {displayProducts.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                  index={i}
                  onAdd={addToCart}
                  themeName={business.theme}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─── About Section ───────────────────────────────────────────── */}
        {(business.description || business.address) && (
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t("About Us", "અમારા વિશે")}
            </h2>
            {business.description && (
              <p className="text-muted-foreground leading-relaxed mb-4">{business.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {business.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>
                    {business.address}, {business.city}, {business.state} – {business.pincode}
                  </span>
                </div>
              )}
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  {business.phone}
                </a>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ─── Floating Cart Button (mobile) ───────────────────────────────── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-auto sm:right-6 sm:w-auto z-40"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3.5 rounded-2xl shadow-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>{t("View Cart", "કાર્ટ જુઓ")}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-violet-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {cartCount}
                </span>
                <span className="font-bold">{formatCurrency(cartTotal)}</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cart Sidebar ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cart header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="font-bold text-lg text-foreground">
                    {t("Your Cart", "તમારો કાર્ટ")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {cartCount} {t("item(s)", "આઇટમ")}
                  </p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    exit={{ opacity: 0, x: 50 }}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3"
                  >
                    {item.image ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <ProductImageFallback
                          name={item.name}
                          className="w-full h-full"
                          iconClassName="w-5 h-5"
                          showOverlay={false}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {locale === "gu" ? (item.nameGu ?? item.name) : item.name}
                      </p>
                      <p className="text-xs text-violet-600 font-medium">
                        {formatCurrency(item.price * (1 - item.discount / 100))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        disabled={false}
                      >
                        +
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Cart footer */}
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">{t("Total", "કુલ")}</span>
                  <span className="text-xl font-black text-violet-600">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                {cartCount > 0 ? (
                  <Button
                    variant="gradient"
                    className="w-full gap-2 h-12 text-base font-bold shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                    onClick={() => {
                      if (!session) {
                        localStorage.setItem(pendingCartKey, JSON.stringify(cart));
                        router.push(
                          `/${locale}/auth/customer-auth?callbackUrl=${encodeURIComponent(pathname)}`
                        );
                        return;
                      }
                      setShowCart(false);
                      setShowCheckoutModal(true);
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t("Proceed to Checkout", "ચેકઆઉટ કરવા આગળ વધો")}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {t("Your cart is empty", "તમારો કાર્ટ ખાલી છે")}
                  </Button>
                )}
                <button
                  onClick={() => setCart([])}
                  className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  {t("Clear cart", "કાર્ટ સાફ કરો")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── QR Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-xl text-foreground mb-1">{business.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">
                {t("Scan to visit our store", "ઓ storefront ની મુલાકાત માટે સ્કેન કરો")}
              </p>
              <div className="inline-block p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeCanvas value={storeUrl} size={180} />
              </div>
              <Button variant="outline" className="mt-5 w-full" onClick={() => setShowQR(false)}>
                {t("Close", "બંધ")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Checkout Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCheckoutModal(false);
              setFormErrors({});
            }}
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
                  <h3 className="font-extrabold text-2xl text-foreground bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {t("Complete Your Order", "તમારો ઓર્ડર પૂર્ણ કરો")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      "Enter your details to finalize the purchase",
                      "ખરીદી પૂર્ણ કરવા માટે વિગતો દાખલ કરો"
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setFormErrors({});
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("Full Name", "પૂરું નામ")} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    placeholder={t("Enter your name", "તમારું નામ દાખલ કરો")}
                    value={checkoutForm.customerName}
                    onChange={(e) => {
                      setCheckoutForm((prev) => ({ ...prev, customerName: e.target.value }));
                      if (formErrors.customerName)
                        setFormErrors((prev) => ({ ...prev, customerName: "" }));
                    }}
                    className={`h-11 rounded-xl focus-visible:ring-violet-500 ${formErrors.customerName ? "border-destructive" : ""}`}
                  />
                  {formErrors.customerName && (
                    <p className="text-xs text-destructive mt-1">{formErrors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("Phone Number", "ફોન નંબર")} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder={t("Enter 10-digit mobile number", "10-અંકનો મોબાઇલ નંબર")}
                    value={checkoutForm.customerPhone}
                    onChange={(e) => {
                      setCheckoutForm((prev) => ({ ...prev, customerPhone: e.target.value }));
                      if (formErrors.customerPhone)
                        setFormErrors((prev) => ({ ...prev, customerPhone: "" }));
                    }}
                    className={`h-11 rounded-xl focus-visible:ring-violet-500 ${formErrors.customerPhone ? "border-destructive" : ""}`}
                  />
                  {formErrors.customerPhone && (
                    <p className="text-xs text-destructive mt-1">{formErrors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("Delivery Address or Special Notes", "સરનામું અથવા વિશેષ નોંધો")}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t(
                      "E.g., Table 4, Home Delivery Address, or special requests...",
                      "દા.ત., ટેબલ 4, ડિલિવરી સરનામું..."
                    )}
                    value={checkoutForm.notes}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("Payment Method", "ચુકવણી પદ્ધતિ")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm((prev) => ({ ...prev, paymentMethod: "cod" }))}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-semibold transition-all ${
                        checkoutForm.paymentMethod === "cod"
                          ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-600"
                          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground"
                      }`}
                    >
                      <Truck className="w-5 h-5 mb-1 text-violet-500" />
                      {t("Cash on Delivery", "કેશ ઓન ડિલિવરી")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCheckoutForm((prev) => ({ ...prev, paymentMethod: "pay_at_store" }))
                      }
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-semibold transition-all ${
                        checkoutForm.paymentMethod === "pay_at_store"
                          ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-600"
                          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground"
                      }`}
                    >
                      <Store className="w-5 h-5 mb-1 text-violet-500" />
                      {t("Pay at Store", "દુકાન પર ચૂકવો")}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mt-2 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("Total Items", "કુલ આઇટમ")}</span>
                    <span className="font-semibold text-foreground">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
                    <span>{t("Amount Payable", "ચૂકવવાપાત્ર રકમ")}</span>
                    <span className="text-violet-600 dark:text-violet-400">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                {formErrors.form && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
                    {formErrors.form}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="gradient"
                  className="w-full h-12 text-base font-bold rounded-2xl shadow-xl shadow-violet-200 dark:shadow-violet-900/30 transition-transform active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("Placing Order...", "ઓર્ડર થઈ રહ્યો છે...")}
                    </>
                  ) : (
                    t(
                      `Place Order - ${formatCurrency(cartTotal)}`,
                      `ઓર્ડર સબમિટ કરો - ${formatCurrency(cartTotal)}`
                    )
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Success Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccessModal && placedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 text-center shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>

              <h3 className="font-extrabold text-2xl text-foreground mb-1">
                {t("Order Placed!", "ઓર્ડર સફળતાપૂર્વક મૂકાયો!")}
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
                {t(
                  `Order Number: ${placedOrder.orderNumber}`,
                  `ઓર્ડર નંબર: ${placedOrder.orderNumber}`
                )}
              </p>

              <div className="text-left bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 space-y-2 border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("Order Details", "ઓર્ડર વિગતો")}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {placedOrder.items.map((item, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-foreground">
                      <span className="truncate max-w-[200px]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>{t("Total Paid", "કુલ ચૂકવેલ")}</span>
                  <span className="text-violet-600 dark:text-violet-400">
                    {formatCurrency(placedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {business.whatsappNumber && (
                  <Button
                    variant="gradient"
                    onClick={handleSuccessWhatsApp}
                    className="w-full gap-2 h-12 text-base font-bold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t("Send WhatsApp Confirmation", "WhatsApp પર કન્ફર્મેશન મોકલો")}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setPlacedOrder(null);
                  }}
                  className="w-full h-12 text-base font-bold rounded-2xl border-gray-200 dark:border-gray-800"
                >
                  {t("Continue Shopping", "ખરીદી ચાલુ રાખો")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product Card Component ────────────────────────────────────────────────────

interface ProductCardProps {
  product: IProduct;
  locale: string;
  index: number;
  onAdd: (product: IProduct) => void;
  compact?: boolean;
  themeName?: string;
  categories: ICategory[];
}

function ProductCard({
  product,
  locale,
  index,
  onAdd,
  compact = false,
  themeName,
  categories,
}: ProductCardProps) {
  const t = (en: string, gu: string) => (locale === "gu" ? gu : en);
  const discountedPrice = product.price * (1 - (product.discount ?? 0) / 100);
  const hasDiscount = (product.discount ?? 0) > 0;
  const aesthetic = themeAestheticMap[themeName ?? ""] ?? themeAestheticMap.minimal;
  const category = categories?.find((c) => c._id === product.categoryId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
      className={`bg-white dark:bg-gray-900 border overflow-hidden transition-all duration-350 group ${aesthetic.cardStyle}`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800 ${compact ? "aspect-square" : "aspect-[4/3]"}`}
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ProductImageFallback
            name={product.name}
            icon={product.icon}
            className="w-full h-full"
            iconClassName={compact ? "w-8 h-8" : "w-10 h-10"}
          />
        )}
        {/* Badges */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{product.discount}%
          </div>
        )}
        {product.isFeatured && !compact && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-white" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
              {t("Out of Stock", "સ્ટૉક ખત્મ")}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className={`${compact ? "p-2.5" : "p-3.5"}`}>
        {category && (
          <span className="text-[10px] uppercase font-black tracking-wider text-violet-600 dark:text-violet-400 block mb-1">
            {locale === "gu" ? (category.nameGu ?? category.name) : category.name}
          </span>
        )}
        <h3
          className={`font-semibold text-foreground leading-tight truncate ${compact ? "text-xs" : "text-sm"}`}
        >
          {locale === "gu" ? (product.nameGu ?? product.name) : product.name}
        </h3>

        {!compact && product.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
        )}

        <div className="flex items-center gap-1.5 mt-1.5">
          <span
            className={`font-extrabold ${compact ? "text-sm" : "text-base"} text-violet-600 dark:text-violet-400`}
          >
            {formatCurrency(discountedPrice)}
          </span>
          {hasDiscount && product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {!compact && (
          <button
            className={`mt-2.5 w-full h-8 text-xs font-bold rounded-xl transition-all duration-200 ${
              !product.inStock
                ? "bg-gray-100 dark:bg-gray-800 text-muted-foreground cursor-not-allowed"
                : `${aesthetic.buttonClass} hover:opacity-90 active:scale-95`
            }`}
            disabled={!product.inStock}
            onClick={() => onAdd(product)}
          >
            {!product.inStock ? t("Unavailable", "ઉપલબ્ધ નથી") : t("+ Add", "+ ઉમેરો")}
          </button>
        )}

        {compact && product.inStock && (
          <button
            className={`mt-1.5 w-full h-7 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 ${aesthetic.buttonClass} hover:opacity-90`}
            onClick={() => onAdd(product)}
          >
            {t("Add", "ઉમેરો")}
          </button>
        )}
      </div>
    </motion.div>
  );
}
