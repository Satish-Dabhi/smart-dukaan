"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Phone, Mail, Star } from "lucide-react";
import { formatCurrency, formatDate, getInitials, debounce } from "@/lib/utils";

export function CustomersManager() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const updateSearch = useCallback(
    debounce((q: string) => { setDebouncedSearch(q); setPage(1); }, 300),
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["customers", debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await fetch(`/api/customers?${params}`);
      return res.json();
    },
  });

  const customers = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? 0} customers</p>
        </div>
      </div>

      <Input
        placeholder="Search by name, phone, or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); updateSearch(e.target.value); }}
        startIcon={<Search className="w-4 h-4" />}
        className="max-w-md"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500">No customers yet</p>
          <p className="text-sm text-gray-400 mt-1">Customers are added automatically when you add phone numbers during billing</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer: Record<string, unknown>, i: number) => (
              <motion.div
                key={customer._id as string}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md hover:border-violet-100 dark:hover:border-violet-900 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{getInitials(customer.name as string)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {customer.name as string}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone as string}
                        </div>
                        {!!customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {customer.email as string}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="text-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {customer.totalOrders as number}
                        </div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(customer.totalSpent as number)}
                        </div>
                        <div className="text-xs text-gray-500">Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {customer.loyaltyPoints as number}
                        </div>
                        <div className="text-xs text-gray-500">Points</div>
                      </div>
                    </div>

                    {!!customer.lastOrderAt && (
                      <div className="text-xs text-gray-400 mt-3">
                        Last order: {formatDate(customer.lastOrderAt as string)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

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
    </div>
  );
}
