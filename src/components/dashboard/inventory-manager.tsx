"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, AlertTriangle, Plus, Warehouse, TrendingDown } from "lucide-react";
import { debounce } from "@/lib/utils";

export function InventoryManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [page, setPage] = useState(1);
  const [adjustProduct, setAdjustProduct] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");

  const updateSearch = useCallback(
    debounce((q: string) => { setDebouncedSearch(q); setPage(1); }, 300),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["products-inventory", debouncedSearch, filter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (filter === "low") params.set("lowStock", "true");
      if (filter === "out") params.set("status", "out_of_stock");
      const res = await fetch(`/api/products?${params}`);
      return res.json();
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ id, quantity, notes }: { id: string; quantity: number; notes: string }) => {
      const res = await fetch(`/api/inventory/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity, notes, type: "adjustment" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success("Stock adjusted!");
      queryClient.invalidateQueries({ queryKey: ["products-inventory"] });
      setAdjustProduct(null);
      setAdjustQty(0);
      setAdjustNote("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? 0} products tracked</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); updateSearch(e.target.value); }}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {f === "low" ? "Low Stock" : f === "out" ? "Out of Stock" : "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Warehouse className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500">No products to manage</p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {["Product", "SKU", "Stock", "Min Stock", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: Record<string, unknown>, i: number) => {
                      const stock = product.stock as number;
                      const minStock = (product.minStock as number) ?? 5;
                      const isLow = stock <= minStock && stock > 0;
                      const isOut = stock === 0;

                      return (
                        <motion.tr
                          key={product._id as string}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {(product.images as string[])?.[0] ? (
                                <img
                                  src={(product.images as string[])[0]}
                                  alt={product.name as string}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                                  📦
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {product.name as string}
                                </p>
                                <p className="text-xs text-gray-500">{product.unit as string ?? "pcs"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {(product.sku as string) ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className={`text-sm font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}`}>
                              {stock}
                            </div>
                            <div className="w-24 mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min((stock / (minStock * 3)) * 100, 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{minStock}</td>
                          <td className="px-4 py-3">
                            {isOut ? (
                              <Badge variant="destructive" className="gap-1">
                                <TrendingDown className="w-3 h-3" />
                                Out of Stock
                              </Badge>
                            ) : isLow ? (
                              <Badge variant="warning" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success">In Stock</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() =>
                                setAdjustProduct({
                                  id: product._id as string,
                                  name: product.name as string,
                                  stock,
                                })
                              }
                            >
                              <Plus className="w-3 h-3" />
                              Restock
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Adjust Stock Modal */}
      {adjustProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">{adjustProduct.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Current stock: {adjustProduct.stock}</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Add Stock Quantity</label>
                <Input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  placeholder="Enter quantity to add"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes (optional)</label>
                <Input
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Purchase from supplier"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setAdjustProduct(null)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                loading={adjustMutation.isPending}
                onClick={() => adjustMutation.mutate({ id: adjustProduct.id, quantity: adjustQty, notes: adjustNote })}
              >
                Update Stock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
