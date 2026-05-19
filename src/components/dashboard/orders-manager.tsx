"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, Eye, RefreshCw } from "lucide-react";
import { formatCurrency, formatDateTime, debounce } from "@/lib/utils";

const statusColors: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "info",
  preparing: "info",
  ready: "purple" as "info",
  delivered: "success",
  cancelled: "destructive",
};

const nextStatus: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};

export function OrdersManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const updateSearch = useCallback(
    debounce((q: string) => { setDebouncedSearch(q); setPage(1); }, 300),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["orders", debouncedSearch, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (status) params.set("status", status);
      const res = await fetch(`/api/orders?${params}`);
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? 0} total orders</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); updateSearch(e.target.value); }}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Orders will appear here after billing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Order", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: Record<string, unknown>, i: number) => (
                    <motion.tr
                      key={order._id as string}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {order.orderNumber as string}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {order.source as string}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {(order.customerName as string) ?? "Walk-in"}
                        </div>
                        {!!order.customerPhone && (
                          <div className="text-xs text-gray-400">{order.customerPhone as string}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">
                          {(order.items as unknown[])?.length ?? 0} items
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {formatCurrency(order.total as number)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[order.status as string] ?? "secondary"}>
                          {order.status as string}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(order.createdAt as string)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {nextStatus[order.status as string] && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order._id as string,
                                  status: nextStatus[order.status as string],
                                })
                              }
                            >
                              <RefreshCw className="w-3 h-3" />
                              {nextStatus[order.status as string]}
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  );
}
