"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Search, Star, Shield, Truck, MessageCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, debounce } from "@/lib/utils";
import type { IBusiness, IProduct, ICategory, CartItem, IOrder, PaginationMeta } from "@/types";
import Link from "next/link";

// Import Shared Theme Configurations
import { themeAestheticMap } from "./theme-config";

// Import Subcomponents
import { ProductCard } from "./product-card";
import { ProductRow } from "./product-row";
import { CompactProductCard } from "./compact-product-card";
import { HeroBanner } from "./hero-banner";
import { CategoryShowcase } from "./category-showcase";
import { CartSidebar } from "./cart-sidebar";
import { CheckoutModal } from "./checkout-modal";
import { SuccessModal } from "./success-modal";
import { QRModal } from "./qr-modal";

// Import Dynamic Category Helper Icons
import {
  CupSoda,
  GlassWater,
  Coffee,
  Croissant,
  Cake,
  IceCream,
  Banana,
  Grape,
  Cherry,
  Carrot,
  Apple,
  Milk,
  Egg,
  Wheat,
  Cookie,
  Candy,
  Soup,
  Pizza,
  Utensils,
  ChefHat,
  Pill,
  Heart,
  Shirt,
  Scissors,
  Sparkles,
  Tv,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Leaf,
  Package,
  ShoppingBag,
  Flame,
  BookOpen,
  Tag,
  Gift,
  Gem,
  Crown,
  Clock,
  Smile,
  Store,
} from "lucide-react";

interface StorefrontProps {
  business: IBusiness;
  products: IProduct[];
  categories: ICategory[];
  locale: string;
  filters: {
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  pagination?: PaginationMeta;
  brandsList?: string[];
  maxCatalogPrice?: number;
}

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
        "from-violet-500/10 to-fuchsia-500/10 text-violet-650 dark:text-violet-400 border-violet-500/20",
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
        "from-indigo-500/10 to-purple-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20",
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
        "from-purple-500/10 to-pink-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20",
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
        "from-teal-500/10 to-emerald-500/10 text-teal-650 dark:text-teal-400 border-teal-500/20",
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
        "from-amber-500/10 to-yellow-500/10 text-amber-650 dark:text-amber-400 border-amber-500/20",
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
        "from-violet-500/10 to-indigo-500/10 text-violet-650 dark:text-violet-400 border-violet-500/20",
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
        "from-violet-500/10 to-indigo-500/10 text-violet-650 dark:text-violet-400 border-violet-500/20",
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
      gradient: "from-red-500/10 to-orange-500/10 text-red-650 dark:text-red-400 border-red-500/20",
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
        "from-amber-500/10 to-yellow-500/10 text-amber-650 dark:text-amber-400 border-amber-500/20",
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
        "from-slate-500/10 to-gray-600/10 text-slate-650 dark:text-slate-400 border-slate-500/20",
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
        "from-rose-500/10 to-red-500/10 text-rose-650 dark:text-rose-400 border-rose-500/20",
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
        "from-amber-500/10 to-yellow-500/10 text-amber-650 dark:text-amber-400 border-amber-500/20",
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
        "from-indigo-500/10 to-blue-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20",
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
        "from-yellow-400/10 to-amber-500/10 text-amber-650 dark:text-amber-400 border-amber-500/20",
    };
  }
  return {
    icon: Store,
    gradient:
      "from-violet-500/10 to-indigo-500/10 text-violet-650 dark:text-violet-400 border-violet-500/20",
  };
}

export function StorefrontPage({
  business,
  products,
  categories,
  locale,
  filters,
  pagination,
  brandsList = [],
  maxCatalogPrice = 1000,
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
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

  // Faceted Search Filters local states
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState(filters.minPrice ?? "0");
  const [tempMaxPrice, setTempMaxPrice] = useState(filters.maxPrice ?? maxCatalogPrice.toString());

  const [prevMinPrice, setPrevMinPrice] = useState(filters.minPrice);
  if (filters.minPrice !== prevMinPrice) {
    setPrevMinPrice(filters.minPrice);
    setTempMinPrice(filters.minPrice ?? "0");
  }

  const [prevMaxPrice, setPrevMaxPrice] = useState(filters.maxPrice);
  const [prevMaxCatalogPrice, setPrevMaxCatalogPrice] = useState(maxCatalogPrice);
  if (filters.maxPrice !== prevMaxPrice || maxCatalogPrice !== prevMaxCatalogPrice) {
    setPrevMaxPrice(filters.maxPrice);
    setPrevMaxCatalogPrice(maxCatalogPrice);
    setTempMaxPrice(filters.maxPrice ?? maxCatalogPrice.toString());
  }

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

  // Click outside auth dropdown handler
  useEffect(() => {
    if (!showAuthDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".auth-dropdown-container")) {
        setShowAuthDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showAuthDropdown]);

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

  const storeUrl = typeof window !== "undefined" ? window.location.href : "";

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.q) params.set("q", filters.q);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.page) params.set("page", filters.page);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

      // Reset page when category, search, brands or price constraints change
      if (
        updates.category !== undefined ||
        updates.q !== undefined ||
        updates.brand !== undefined ||
        updates.minPrice !== undefined ||
        updates.maxPrice !== undefined
      ) {
        params.delete("page");
      }

      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [filters, pathname, router]
  );

  const getPageHref = useCallback(
    (pageNumber: number) => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.q) params.set("q", filters.q);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      params.set("page", pageNumber.toString());
      return `${pathname}?${params.toString()}`;
    },
    [filters, pathname]
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

  // Determine current active product view mode based on merchant settings
  const productViewMode = business.productView ?? "card";

  // Group products by category when no specific category is filtered and no active search query
  const groupedProducts = useMemo(() => {
    if (filters.category || filters.q) {
      return null;
    }

    const groups: Array<{ category: ICategory | null; products: IProduct[] }> = [];

    // Group products by category ID
    const productGroups = displayProducts.reduce<Record<string, IProduct[]>>((acc, product) => {
      const catId = product.categoryId ?? "uncategorized";
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(product);
      return acc;
    }, {});

    // First, add categorized products in the order of categories
    categories.forEach((cat) => {
      const catProducts = productGroups[cat._id];
      if (catProducts && catProducts.length > 0) {
        groups.push({
          category: cat,
          products: catProducts,
        });
      }
    });

    // Then, add uncategorized products if any exist
    const uncategorized = productGroups["uncategorized"] || [];
    if (uncategorized.length > 0) {
      groups.push({
        category: null,
        products: uncategorized,
      });
    }

    return groups;
  }, [displayProducts, categories, filters.category, filters.q]);

  return (
    <div
      className={`min-h-screen ${aesthetic.bgColor} ${aesthetic.fontFamily} transition-colors duration-300`}
    >
      {/* ─── Hero Banner Subcomponent ───────────────────────────────────── */}
      <HeroBanner
        business={business}
        session={session}
        cartCount={cartCount}
        cartTotal={cartTotal}
        resolvedTheme={mounted ? resolvedTheme : "light"}
        setTheme={setTheme}
        locale={locale}
        setShowCart={setShowCart}
        showAuthDropdown={showAuthDropdown}
        setShowAuthDropdown={setShowAuthDropdown}
        setShowQR={setShowQR}
        pathname={pathname}
        t={t}
        storeUrl={storeUrl}
        formatCurrency={formatCurrency}
      />

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
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t("Search products...", "ઉત્પાદન શોધો...")}
                value={searchValue}
                onChange={handleSearch}
                startIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* SEO-safe Premium Collapsible Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersSheet(!showFiltersSheet)}
              className={`h-9 flex items-center gap-1.5 cursor-pointer rounded-lg border shrink-0 ${
                showFiltersSheet || filters.brand || filters.minPrice || filters.maxPrice
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-305"
              }`}
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">{t("Filters", "ફિલ્ટર્સ")}</span>
              {(filters.brand || filters.minPrice || filters.maxPrice) && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-[9px] rounded-full bg-violet-600 text-white dark:bg-violet-500"
                >
                  {(filters.brand ? filters.brand.split(",").length : 0) +
                    (filters.minPrice || filters.maxPrice ? 1 : 0)}
                </Badge>
              )}
            </Button>

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

          {/* Collapsible Facet Filters Sheet */}
          {showFiltersSheet && (
            <div className="mt-3 p-4 bg-gray-50/70 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800 rounded-xl space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Price Range Filters */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
                    {t("Price Range", "કિંમત મર્યાદા")}
                  </h4>
                  <div className="space-y-4 p-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-303">
                      <span>₹{tempMinPrice}</span>
                      <span>₹{tempMaxPrice}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {t("Min Price", "લઘુત્તમ")}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={maxCatalogPrice}
                          value={tempMinPrice}
                          onChange={(e) => setTempMinPrice(e.target.value)}
                          className="w-full h-1.5 bg-gray-200 dark:bg-gray-750 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {t("Max Price", "મહત્તમ")}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={maxCatalogPrice}
                          value={tempMaxPrice}
                          onChange={(e) => setTempMaxPrice(e.target.value)}
                          className="w-full h-1.5 bg-gray-200 dark:bg-gray-750 rounded-lg appearance-none cursor-pointer accent-violet-600"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="gradient"
                        className="flex-1 h-7 text-[10px] font-black"
                        onClick={() =>
                          updateFilters({
                            minPrice: tempMinPrice !== "0" ? tempMinPrice : undefined,
                            maxPrice:
                              tempMaxPrice !== maxCatalogPrice.toString()
                                ? tempMaxPrice
                                : undefined,
                          })
                        }
                      >
                        {t("Apply Price", "લાગુ કરો")}
                      </Button>
                      {(filters.minPrice || filters.maxPrice) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] font-black border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => {
                            setTempMinPrice("0");
                            setTempMaxPrice(maxCatalogPrice.toString());
                            updateFilters({ minPrice: undefined, maxPrice: undefined });
                          }}
                        >
                          {t("Reset", "રીસેટ")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Brand Facets List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
                    {t("Brands", "બ્રાન્ડ્સ")}
                  </h4>
                  {brandsList.length === 0 ? (
                    <p className="text-xs text-muted-foreground pr-2 leading-relaxed">
                      {t("No specific brands present in catalog", "કેટલોગમાં બ્રાન્ડ ઉપલબ્ધ નથી")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                        {brandsList.map((brand) => {
                          const activeBrands = filters.brand ? filters.brand.split(",") : [];
                          const isChecked = activeBrands.includes(brand);
                          return (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => {
                                let newBrands = [...activeBrands];
                                if (isChecked) {
                                  newBrands = newBrands.filter((b) => b !== brand);
                                } else {
                                  newBrands.push(brand);
                                }
                                updateFilters({
                                  brand: newBrands.length > 0 ? newBrands.join(",") : undefined,
                                });
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none"
                                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                              }`}
                            >
                              {brand}
                            </button>
                          );
                        })}
                      </div>
                      {filters.brand && (
                        <button
                          onClick={() => updateFilters({ brand: undefined })}
                          className="text-[10px] font-bold text-red-500 hover:underline inline-block mt-1 cursor-pointer"
                        >
                          {t("Clear brands", "બ્રાન્ડ્સ સાફ કરો")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* General Reset Action */}
              {(filters.brand || filters.minPrice || filters.maxPrice) && (
                <div className="flex justify-end pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => {
                      setTempMinPrice("0");
                      setTempMaxPrice(maxCatalogPrice.toString());
                      updateFilters({ brand: undefined, minPrice: undefined, maxPrice: undefined });
                    }}
                    className="text-xs font-extrabold text-red-500 hover:text-red-650 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                  >
                    <span>🗑️</span>
                    <span>{t("Reset All Filters", "બધા ફિલ્ટર્સ રીસેટ કરો")}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => updateFilters({ category: undefined })}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
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
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
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
        {/* Category Circle Cards Showcase Subcomponent */}
        <CategoryShowcase
          categories={categories}
          filters={filters}
          updateFilters={updateFilters}
          locale={locale}
          t={t}
          getCategoryIcon={getCategoryIcon}
        />

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
                  themeName={business.theme}
                  categories={categories}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Main Products Grid / Rows / Compact List ────────────────── */}
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
                  className="mt-4 cursor-pointer"
                  onClick={() => updateFilters({ q: undefined, category: undefined })}
                >
                  {t("Clear filters", "ફિલ્ટર સાફ કરો")}
                </Button>
              )}
            </div>
          ) : groupedProducts ? (
            // Category-Grouped Layout (renders when viewing all products with no active search/category filter)
            groupedProducts.map((group) => {
              const cat = group.category;
              const catName = cat
                ? locale === "gu"
                  ? (cat.nameGu ?? cat.name)
                  : cat.name
                : t("Other Products", "અન્ય ઉત્પાદનો");
              const { icon: CategoryIcon, gradient } = getCategoryIcon(cat ? cat.name : "");

              return (
                <div
                  key={cat ? cat._id : "uncategorized"}
                  className="space-y-6 mt-12 first:mt-0 animate-fadeIn"
                >
                  {/* Visual Category Divider Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient} shadow-sm border border-gray-100/50 dark:border-gray-850/50`}
                    >
                      <CategoryIcon className="w-5 h-5 text-current" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider shrink-0 flex items-center gap-2">
                      <span>{catName}</span>
                      <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {group.products.length}{" "}
                        {group.products.length === 1 ? t("item", "આઇટમ") : t("items", "આઇટમ્સ")}
                      </span>
                    </h3>
                    <div className="flex-1 border-b border-dashed border-gray-200 dark:border-gray-800 mx-2" />
                  </div>

                  {/* Grouped Layout Render based on settings view choice */}
                  {aesthetic.isCulinaryMenu ? (
                    <div className="max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-amber-100/50 dark:border-stone-800 shadow-xl shadow-amber-500/5">
                      {group.products.map((product, i) => (
                        <ProductRow
                          key={product._id}
                          product={product}
                          locale={locale}
                          index={i}
                          onAdd={addToCart}
                          themeName={business.theme}
                          categories={categories}
                          getCategoryIcon={getCategoryIcon}
                        />
                      ))}
                    </div>
                  ) : productViewMode === "row" ? (
                    <div className="max-w-3xl mx-auto space-y-3">
                      {group.products.map((product, i) => (
                        <ProductRow
                          key={product._id}
                          product={product}
                          locale={locale}
                          index={i}
                          onAdd={addToCart}
                          themeName={business.theme}
                          categories={categories}
                          getCategoryIcon={getCategoryIcon}
                        />
                      ))}
                    </div>
                  ) : productViewMode === "compact" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {group.products.map((product, i) => (
                        <CompactProductCard
                          key={product._id}
                          product={product}
                          locale={locale}
                          index={i}
                          onAdd={addToCart}
                          themeName={business.theme}
                          categories={categories}
                          getCategoryIcon={getCategoryIcon}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                      {group.products.map((product, i) => (
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
                </div>
              );
            })
          ) : // Flat Layout (renders when a specific category or search filter is active)
          aesthetic.isCulinaryMenu ? (
            <div className="max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-amber-100/50 dark:border-stone-800 shadow-xl shadow-amber-500/5">
              {displayProducts.map((product, i) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  locale={locale}
                  index={i}
                  onAdd={addToCart}
                  themeName={business.theme}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          ) : productViewMode === "row" ? (
            <div className="max-w-3xl mx-auto space-y-3">
              {displayProducts.map((product, i) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  locale={locale}
                  index={i}
                  onAdd={addToCart}
                  themeName={business.theme}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          ) : productViewMode === "compact" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayProducts.map((product, i) => (
                <CompactProductCard
                  key={product._id}
                  product={product}
                  locale={locale}
                  index={i}
                  onAdd={addToCart}
                  themeName={business.theme}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
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

          {/* ─── Crawler-friendly Storefront Pagination ─── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10">
              <Link
                href={getPageHref(pagination.page - 1)}
                onClick={(e) => {
                  if (pagination.page <= 1) e.preventDefault();
                  else updateFilters({ page: (pagination.page - 1).toString() });
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center justify-center ${
                  pagination.hasPrev
                    ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed"
                }`}
              >
                {t("← Prev", "← પાછળ")}
              </Link>

              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pagination.page === pageNum;
                return (
                  <Link
                    key={pageNum}
                    href={getPageHref(pageNum)}
                    onClick={(e) => {
                      e.preventDefault();
                      updateFilters({ page: pageNum.toString() });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center border transition-all ${
                      isActive
                        ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              <Link
                href={getPageHref(pagination.page + 1)}
                onClick={(e) => {
                  if (pagination.page >= pagination.totalPages) e.preventDefault();
                  else updateFilters({ page: (pagination.page + 1).toString() });
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center justify-center ${
                  pagination.hasNext
                    ? "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed"
                }`}
              >
                {t("Next →", "આગળ →")}
              </Link>
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
                  <span className="text-primary shrink-0">📍</span>
                  <span>
                    {business.address}, {business.city}, {business.state} – {business.pincode}
                  </span>
                </div>
              )}
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors font-semibold"
                >
                  <span className="text-primary shrink-0">📞</span>
                  {business.phone}
                </a>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ─── Floating Cart Button (mobile) ───────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-auto sm:right-6 sm:w-auto z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3.5 rounded-2xl shadow-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <span>{t("View Cart", "કાર્ટ જુઓ")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-violet-600 rounded-full text-xs flex items-center justify-center text-white font-black">
                {cartCount}
              </span>
              <span className="font-bold">{formatCurrency(cartTotal)}</span>
            </div>
          </button>
        </div>
      )}

      {/* ─── Cart Sidebar Drawer ─────────────────────────────────────────── */}
      <CartSidebar
        showCart={showCart}
        setShowCart={setShowCart}
        cartCount={cartCount}
        cart={cart}
        locale={locale}
        t={t}
        updateQuantity={updateQuantity}
        cartTotal={cartTotal}
        session={session}
        pendingCartKey={pendingCartKey}
        router={router}
        pathname={pathname}
        setShowCheckoutModal={setShowCheckoutModal}
        setCart={setCart}
      />

      {/* ─── QR Code Modal ────────────────────────────────────────────────── */}
      <QRModal
        showQR={showQR}
        setShowQR={setShowQR}
        business={business}
        storeUrl={storeUrl}
        t={t}
      />

      {/* ─── Checkout Form Modal ──────────────────────────────────────────── */}
      <CheckoutModal
        showCheckoutModal={showCheckoutModal}
        setShowCheckoutModal={setShowCheckoutModal}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        checkoutForm={checkoutForm}
        setCheckoutForm={setCheckoutForm}
        handlePlaceOrder={handlePlaceOrder}
        cart={cart}
        cartTotal={cartTotal}
        isSubmitting={isSubmitting}
        t={t}
        formatCurrency={formatCurrency}
      />

      {/* ─── Order Success Confirmation Receipt Modal ──────────────────────── */}
      <SuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        placedOrder={placedOrder}
        setPlacedOrder={setPlacedOrder}
        handleSuccessWhatsApp={handleSuccessWhatsApp}
        business={business}
        t={t}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
