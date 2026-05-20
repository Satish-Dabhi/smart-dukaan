"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus, Search, Edit2, Trash2, Package,
  Upload, Download, Star, AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import type { IProduct } from "@/types";
import { ProductDialog } from "@/components/dashboard/product-dialog";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import { useTranslations } from "next-intl";

interface Props {
  businessId?: string;
}

export function ProductsManager({ businessId }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const debouncedSearch = useDebounce(search, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", businessId, debouncedSearch, selectedCategory, selectedStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedStatus) params.set("status", selectedStatus);
      const res = await fetch(`/api/products?${params}`);
      return res.json();
    },
    enabled: !!businessId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success(t("productDeletedToast"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleDelete = (id: string, name: string) => {
    setConfirmDelete({ id, name });
  };

  const products: IProduct[] = data?.data ?? [];
  const meta = data?.meta;

  const statusColor: Record<string, "success" | "destructive" | "warning"> = {
    active: "success",
    inactive: "secondary" as "destructive",
    out_of_stock: "destructive",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("productsInCatalog", { count: meta?.total ?? 0 })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            {t("import")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            {t("export")}
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingProduct(null);
              setShowDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {t("addProduct")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={handleSearch}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
        >
          <option value="">{t("allStatus")}</option>
          <option value="active">{t("activeOption")}</option>
          <option value="inactive">{t("inactiveOption")}</option>
          <option value="out_of_stock">{t("outOfStockOption")}</option>
        </select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("noProductsYet")}</h3>
          <p className="text-gray-500 mb-4">{t("addFirstProductSub")}</p>
          <Button
            variant="gradient"
            onClick={() => {
              setEditingProduct(null);
              setShowDialog(true);
            }}
          >
            {t("addProduct")}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300">
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ProductImageFallback
                        name={product.name}
                        className="w-full h-full"
                        iconClassName="w-10 h-10"
                      />
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {t("featuredLabel")}
                      </div>
                    )}
                    {product.stock <= (product.minStock ?? 5) && product.stock > 0 && (
                      <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t("lowStockLabel")}
                      </div>
                    )}

                    {/* Action buttons on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowDialog(true);
                        }}
                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
                      >
                        <Edit2 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-600 text-sm">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge variant={statusColor[product.status] ?? "secondary"} className="text-xs">
                        {product.status === "out_of_stock" ? "OOS" : t(product.status === "active" ? "activeOption" : "inactiveOption")}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{t("stockCount", { count: product.stock })}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPrev}
                onClick={() => setPage((p) => p - 1)}
              >
                {tCommon("previous")}
              </Button>
              <span className="text-sm text-gray-500">
                {t("pageInfo", { page: meta.page, totalPages: meta.totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                {tCommon("next")}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Product Dialog */}
      <ProductDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditingProduct(null); }}
        product={editingProduct}
        businessId={businessId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          setShowDialog(false);
          setEditingProduct(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={confirmDelete ? t("deleteProductTitle", { name: confirmDelete.name }) : ""}
        description={t("deleteProductDesc")}
        confirmLabel={t("deleteProduct")}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            deleteMutation.mutate(confirmDelete.id);
            setConfirmDelete(null);
          }
        }}
      />
    </div>
  );
}
