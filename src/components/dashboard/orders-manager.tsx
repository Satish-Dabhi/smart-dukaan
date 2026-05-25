import { getTranslations, getLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { OrdersFilter } from "./orders-filter";
import { UpdateOrderStatusButton } from "./update-order-status-button";
import { getOrders } from "@/services/order.service";
import { requireBusinessAuth } from "@/lib/require-auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ShoppingCart, Printer } from "lucide-react";
import type { OrderStatus } from "@/types";

const statusColors: Record<string, "success" | "warning" | "info" | "destructive" | "secondary"> = {
  placed: "warning",
  delivered: "success",
};

const nextStatus: Record<string, OrderStatus> = {
  placed: "delivered",
};

interface OrdersManagerProps {
  page: number;
  q: string;
  status: string;
}

export async function OrdersManager({ page, q, status }: OrdersManagerProps) {
  const { businessId } = await requireBusinessAuth();
  const [t, locale] = await Promise.all([getTranslations("orders"), getLocale()]);

  const { data: orders, meta } = await getOrders({ businessId, page, q, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("totalOrders", { count: meta.total })}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder={t("searchPlaceholder")} />
        </div>
        <OrdersFilter currentStatus={status} />
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500">{t("noOrders")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("noOrdersSub")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {[
                      t("thOrder"),
                      t("thCustomer"),
                      t("thSource") || "Source",
                      t("thItems"),
                      t("thTotal"),
                      t("thStatus"),
                      t("thDate"),
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
                  {orders.map((order) => (
                    <tr
                      key={order._id.toString()}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {order.source}
                          {order.source === "qr" && order.tableNumber
                            ? ` · Table ${order.tableNumber}`
                            : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.customerName ?? t("walkIn")}
                        </div>
                        {!!order.customerPhone && (
                          <div className="text-xs text-gray-400">{order.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.source === "pos" && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/40"
                          >
                            📟 POS Billing
                          </Badge>
                        )}
                        {order.source === "online" && (
                          <Badge
                            variant="secondary"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/40"
                          >
                            🌐 Online Store
                          </Badge>
                        )}
                        {order.source === "whatsapp" && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40"
                          >
                            💬 WhatsApp
                          </Badge>
                        )}
                        {order.source === "qr" && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/40"
                          >
                            📱 QR Menu {order.tableNumber ? `(T-${order.tableNumber})` : ""}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">
                          {t("itemsCount", { count: order.items?.length ?? 0 })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {formatCurrency(order.total)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[order.status] ?? "secondary"}>
                          {t(order.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {nextStatus[order.status] && (
                            <UpdateOrderStatusButton
                              orderId={order._id.toString()}
                              nextStatus={nextStatus[order.status]}
                              locale={locale}
                            />
                          )}
                          <a
                            href={`/${locale}/dashboard/orders/${order._id.toString()}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination meta={meta} />
    </div>
  );
}
