import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { IProduct, ICategory } from "@/types";
import { themeAestheticMap } from "./theme-config";

interface CompactProductCardProps {
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

export function CompactProductCard({
  product,
  locale,
  index,
  onAdd,
  themeName,
  categories,
  getCategoryIcon,
}: CompactProductCardProps) {
  const discountedPrice = product.price * (1 - (product.discount ?? 0) / 100);
  const aesthetic = themeAestheticMap[themeName ?? ""] ?? themeAestheticMap.minimal;
  const category = categories?.find((c) => c._id === product.categoryId);
  const { icon: CategoryIcon, gradient } = getCategoryIcon(category?.name ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.2 }}
      className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700 transition-all"
    >
      {/* Small Category Badge Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient}`}
      >
        <CategoryIcon className="w-4 h-4 text-current" />
      </div>

      {/* Product Information */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
          {locale === "gu" ? (product.nameGu ?? product.name) : product.name}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
          {product.unit && <span>{product.unit}</span>}
          {product.unit && product.discount && <span>•</span>}
          {product.discount ? (
            <span className="text-red-500 font-semibold">-{product.discount}%</span>
          ) : null}
        </div>
      </div>

      {/* Price & Add Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">
          {formatCurrency(discountedPrice)}
        </span>

        <button
          disabled={!product.inStock}
          onClick={() => onAdd(product)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-all active:scale-90 ${
            !product.inStock
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : `${aesthetic.buttonClass} hover:opacity-90`
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
