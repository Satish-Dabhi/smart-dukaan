import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { IProduct, ICategory } from "@/types";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import { themeAestheticMap, getProductTagBadges } from "./theme-config";

interface ProductCardProps {
  product: IProduct;
  locale: string;
  index: number;
  onAdd: (product: IProduct) => void;
  compact?: boolean;
  themeName?: string;
  categories: ICategory[];
}

export function ProductCard({
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
  const { isVeg, isNonVeg, isSpicy, isFresh, isRx } = getProductTagBadges(product.tags);

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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
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
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
            -{product.discount}%
          </div>
        )}
        {product.isFeatured && !compact && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-white" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
              {t("Out of Stock", "સ્ટૉક ખત્મ")}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className={`${compact ? "p-2.5" : "p-3.5"} flex flex-col justify-between flex-1`}>
        <div>
          {category && (
            <span className="text-[10px] uppercase font-black tracking-wider text-violet-650 dark:text-violet-400 block mb-1">
              {locale === "gu" ? (category.nameGu ?? category.name) : category.name}
            </span>
          )}
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <h3
              className={`font-semibold text-foreground leading-tight truncate ${compact ? "text-xs" : "text-sm"}`}
            >
              {locale === "gu" ? (product.nameGu ?? product.name) : product.name}
            </h3>
            {isSpicy && (
              <span title="Spicy" className="text-[11px] leading-none">
                🌶️
              </span>
            )}
          </div>
          {/* Tag badges */}
          {(isVeg || isNonVeg || isFresh || isRx) && (
            <div className="flex items-center gap-1 flex-wrap mb-1">
              {isVeg && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500 shrink-0" />
                  {t("Veg", "વેજ")}
                </span>
              )}
              {isNonVeg && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded border border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
                  <span className="w-2 h-2 rounded-sm bg-red-500 shrink-0" />
                  {t("Non-Veg", "નૉન-વેજ")}
                </span>
              )}
              {isFresh && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  🌿 {t("Fresh", "તાજું")}
                </span>
              )}
              {isRx && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                  {t("Rx", "Rx")}
                </span>
              )}
            </div>
          )}

          {!compact && product.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {product.description}
            </p>
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
        </div>

        <div>
          {!compact && (
            <button
              className={`mt-2.5 w-full h-8 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
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
              className={`mt-1.5 w-full h-7 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer ${aesthetic.buttonClass} hover:opacity-90`}
              onClick={() => onAdd(product)}
            >
              {t("Add", "ઉમેરો")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
