"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface InventoryFilterProps {
  currentFilter: "all" | "low" | "out";
}

export function InventoryFilter({ currentFilter }: InventoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("inventory");

  const setFilter = (f: "all" | "low" | "out") => {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "all") {
      params.delete("filter");
    } else {
      params.set("filter", f);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {(["all", "low", "out"] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
            currentFilter === f
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {f === "low" ? t("lowStock") : f === "out" ? t("outOfStock") : t("all")}
        </button>
      ))}
    </div>
  );
}
