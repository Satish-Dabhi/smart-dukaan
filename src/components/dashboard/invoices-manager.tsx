"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, FileText, Printer, Eye } from "lucide-react";
import { formatCurrency, formatDateTime, debounce } from "@/lib/utils";
import { useCallback } from "react";

const statusVariant: Record<string, "success" | "destructive" | "warning" | "secondary" | "info"> = {
  paid: "success",
  unpaid: "warning",
  cancelled: "destructive",
  draft: "secondary",
  refunded: "info",
};

export function InvoicesManager() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const updateSearch = useCallback(
    debounce((q: string) => { setDebouncedSearch(q); setPage(1); }, 300),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", debouncedSearch, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (status) params.set("status", status);
      const res = await fetch(`/api/invoices?${params}`);
      return res.json();
    },
  });

  const invoices = data?.data ?? [];
  const meta = data?.meta;

  const exportCSV = () => {
    const rows = [
      ["Invoice #", "Date", "Customer", "Amount", "Status", "Payment Method"],
      ...invoices.map((inv: Record<string, unknown>) => [
        inv.invoiceNumber,
        formatDateTime(inv.createdAt as string),
        inv.customerName ?? "Walk-in",
        inv.total,
        inv.status,
        inv.paymentMethod,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? 0} total invoices</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by invoice # or customer..."
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
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="cancelled">Cancelled</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500">No invoices found</p>
              <p className="text-sm text-gray-400 mt-1">Bills will appear here after you use POS</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Invoice
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Date
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Amount
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice: Record<string, unknown>, i: number) => (
                    <motion.tr
                      key={invoice._id as string}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {invoice.invoiceNumber as string}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {(invoice.paymentMethod as string)?.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {(invoice.customerName as string) ?? "Walk-in Customer"}
                        </div>
                        {!!invoice.customerPhone && (
                          <div className="text-xs text-gray-400">{invoice.customerPhone as string}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(invoice.createdAt as string)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {formatCurrency(invoice.total as number)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[invoice.status as string] ?? "secondary"}>
                          {invoice.status as string}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                            <Printer className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
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

      {/* Pagination */}
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
