import { motion } from "framer-motion";
import Image from "next/image";
import { Plus, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { IProduct, ICategory } from "@/types";
import { themeAestheticMap } from "./theme-config";

interface ProductRowProps {
  product: IProduct;
  locale: string;
  index: number;
  onAdd: (product: IProduct) => void;
  themeName?: string;
  categories: ICategory[];
  getCategoryIcon: (name: string) => {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
  };
}

export function ProductRow({
  product,
  locale,
  index,
  onAdd,
  themeName,
  categories,
  getCategoryIcon,
}: ProductRowProps) {
  const t = (en: string, gu: string) => (locale === "gu" ? gu : en);
  const discountedPrice = product.price * (1 - (product.discount ?? 0) / 100);
  const hasDiscount = (product.discount ?? 0) > 0;
  const aesthetic = themeAestheticMap[themeName ?? ""] ?? themeAestheticMap.minimal;
  const category = categories?.find((c) => c._id === product.categoryId);
  const { icon: CategoryIcon, gradient } = getCategoryIcon(category?.name ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className={`group relative flex items-center justify-between gap-4 p-4 mb-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-900/60 overflow-hidden`}
    >
      {/* Dynamic Background Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/[0.01] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Left: Beautiful Icon/Image First */}
      <div className="shrink-0 relative">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm relative flex items-center justify-center shrink-0 bg-gray-50 dark:bg-gray-800 group-hover:scale-105 transition-transform duration-300">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}
            >
              <CategoryIcon className="w-6 h-6 text-current" />
            </div>
          )}
        </div>

        {/* Hot / Featured mini-badge */}
        {product.isFeatured && (
          <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] text-white shadow-sm ring-1 ring-white dark:ring-gray-950 animate-pulse">
            ★
          </span>
        )}
      </div>

      {/* Middle: Title, Tag, and Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {locale === "gu" ? (product.nameGu ?? product.name) : product.name}
          </h3>
          {category && (
            <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/45 text-violet-650 dark:text-violet-400 border border-violet-100/50 dark:border-violet-900/30">
              {locale === "gu" ? (category.nameGu ?? category.name) : category.name}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 pr-4 sm:pr-8">
            {product.description}
          </p>
        )}

        {/* Details & Badges Row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
          {product.unit && (
            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              {product.unit}
            </span>
          )}
          {hasDiscount && (
            <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 font-bold border border-red-100/30 dark:border-red-900/30">
              {product.discount}% OFF
            </span>
          )}
          {!product.inStock && (
            <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-semibold flex items-center gap-1">
              <EyeOff className="w-2.5 h-2.5" />
              {t("Out of Stock", "સ્ટોક નથી")}
            </span>
          )}
        </div>
      </div>

      {/* Right: Price & Hover-revealed Add to Cart Button */}
      <div className="flex items-center gap-4 shrink-0 text-right">
        <div className="flex flex-col items-end">
          <span className="font-black text-gray-900 dark:text-white text-base sm:text-lg">
            {formatCurrency(discountedPrice)}
          </span>
          {hasDiscount && product.originalPrice && (
            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add from Last / Hover Slide-in button */}
        <div className="shrink-0 flex items-center justify-end w-[85px] sm:w-[95px] relative h-9">
          <button
            disabled={!product.inStock}
            onClick={() => onAdd(product)}
            className={`w-full h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-black shadow-md border-0 uppercase cursor-pointer active:scale-95 duration-200
              ${
                !product.inStock
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : `${aesthetic.buttonClass} hover:shadow-lg`
              }
              opacity-100 translate-x-0
              sm:opacity-0 sm:translate-x-4 sm:pointer-events-none
              group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto
              transition-all duration-300 ease-out z-10
            `}
          >
            {product.inStock ? (
              <>
                <Plus className="w-3.5 h-3.5 font-bold" />
                <span>{t("Add", "ઉમેરો")}</span>
              </>
            ) : (
              t("Sold", "ખત્મ")
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
