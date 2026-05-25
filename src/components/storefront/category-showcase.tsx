import { Store } from "lucide-react";
import type { ICategory } from "@/types";

interface CategoryShowcaseProps {
  categories: ICategory[];
  filters: { category?: string; q?: string; sort?: string };
  updateFilters: (updates: Record<string, string | undefined>) => void;
  locale: string;
  t: (en: string, gu: string) => string;
  getCategoryIcon: (name: string) => {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
  };
}

export function CategoryShowcase({
  categories,
  filters,
  updateFilters,
  locale,
  t,
  getCategoryIcon,
}: CategoryShowcaseProps) {
  if (categories.length === 0) return null;

  return (
    <section className="animate-fadeIn">
      <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
        <Store className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        {t("Browse Categories", "શ્રેણીઓ બ્રાઉઝ કરો")}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* "All" Card */}
        <button
          onClick={() => updateFilters({ category: undefined })}
          className="shrink-0 flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
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
              className="shrink-0 flex flex-col items-center gap-2 group focus:outline-none cursor-pointer"
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
  );
}
