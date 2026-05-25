import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { InventoryFilter } from "./inventory-filter";
import { AdjustStockButton } from "./adjust-stock-button";
import { getProducts } from "@/services/product.service";
import { requireBusinessAuth } from "@/lib/require-auth";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import { AlertTriangle, Warehouse, TrendingDown } from "lucide-react";

interface InventoryManagerProps {
  page: number;
  q: string;
  filter: "all" | "low" | "out";
}

export async function InventoryManager({ page, q, filter }: InventoryManagerProps) {
  const { businessId } = await requireBusinessAuth();
  const [t, locale] = await Promise.all([getTranslations("inventory"), getLocale()]);

  const { data: products, meta } = await getProducts({
    businessId,
    page,
    q,
    lowStock: filter === "low" ? true : undefined,
    status: filter === "out" ? "out_of_stock" : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("productsTracked", { count: meta.total })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder={t("searchPlaceholder")} />
        </div>
        <InventoryFilter currentFilter={filter} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Warehouse className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500">{t("noProducts")}</p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {[
                        t("thProduct"),
                        t("thSku"),
                        t("thStock"),
                        t("thMinStock"),
                        t("thStatus"),
                        t("thActions"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const stock = product.stock;
                      const minStock = product.minStock ?? 5;
                      const isLow = stock <= minStock && stock > 0;
                      const isOut = stock === 0;

                      return (
                        <tr
                          key={product._id.toString()}
                          className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                  <ProductImageFallback
                                    name={product.name}
                                    className="w-full h-full"
                                    iconClassName="w-5 h-5"
                                    showOverlay={false}
                                  />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">{product.unit ?? "pcs"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.sku ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div
                              className={`text-sm font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}`}
                            >
                              {stock}
                            </div>
                            <div className="w-24 mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{
                                  width: `${Math.min((stock / (minStock * 3)) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{minStock}</td>
                          <td className="px-4 py-3">
                            {isOut ? (
                              <Badge variant="destructive" className="gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {t("outOfStock")}
                              </Badge>
                            ) : isLow ? (
                              <Badge variant="warning" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {t("lowStock")}
                              </Badge>
                            ) : (
                              <Badge variant="success">{t("inStock")}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <AdjustStockButton
                              productId={product._id.toString()}
                              productName={product.name}
                              currentStock={stock}
                              locale={locale}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Pagination meta={meta} />
        </>
      )}
    </div>
  );
}
