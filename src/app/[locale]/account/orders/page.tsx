import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";
import Business from "@/models/Business";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, FileText, LogOut } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ locale: string }>;
}

const statusVariant: Record<string, "warning" | "success"> = {
  placed: "warning",
  delivered: "success",
};

export default async function CustomerOrdersPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/account/orders`);
  }

  await connectDB();

  const [orders, invoices] = await Promise.all([
    Order.find({ customerEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Invoice.find({ customerEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
  ]);

  // Collect unique businessIds to show business names
  const businessIds = [
    ...new Set([
      ...orders.map((o) => o.businessId.toString()),
      ...invoices.map((i) => i.businessId.toString()),
    ]),
  ];
  const businesses = await Business.find({ _id: { $in: businessIds } })
    .select("_id name slug")
    .lean();
  const bizMap = Object.fromEntries(businesses.map((b) => [b._id.toString(), b]));

  const serialisedOrders = JSON.parse(JSON.stringify(orders));
  const serialisedInvoices = JSON.parse(JSON.stringify(invoices));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Orders</h1>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
          <Link
            href={`/${locale}/auth/login`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Orders section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Orders ({serialisedOrders.length})
          </h2>

          {serialisedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400 text-sm">
                No orders yet. Place an order from a store to see it here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {serialisedOrders.map(
                (order: {
                  _id: string;
                  orderNumber: string;
                  businessId: string;
                  status: string;
                  total: number;
                  items: { name: string; quantity: number }[];
                  createdAt: string;
                  source?: string;
                  tableNumber?: string;
                }) => {
                  const biz = bizMap[order.businessId];
                  return (
                    <Card key={order._id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {order.orderNumber}
                              </span>
                              <Badge variant={statusVariant[order.status] ?? "secondary"}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              {order.source === "qr" && order.tableNumber && (
                                <span className="text-xs text-gray-400">
                                  Table {order.tableNumber}
                                </span>
                              )}
                            </div>
                            {biz && (
                              <p className="text-xs text-violet-600 mt-0.5">{biz.name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {order.items.slice(0, 3).map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                              {order.items.length > 3 && ` +${order.items.length - 3} more`}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(order.total)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Invoices / Bills section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bills &amp; Invoices ({serialisedInvoices.length})
          </h2>

          {serialisedInvoices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400 text-sm">
                No invoices yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {serialisedInvoices.map(
                (inv: {
                  _id: string;
                  invoiceNumber: string;
                  businessId: string;
                  total: number;
                  status: string;
                  createdAt: string;
                }) => {
                  const biz = bizMap[inv.businessId];
                  return (
                    <Card key={inv._id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {inv.invoiceNumber}
                              </span>
                              <Badge variant={inv.status === "paid" ? "success" : "secondary"}>
                                {inv.status}
                              </Badge>
                            </div>
                            {biz && (
                              <p className="text-xs text-violet-600 mt-0.5">{biz.name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(inv.total)}
                            </p>
                            <Link
                              href={`/${locale}/invoice/${inv.businessId}/${inv._id}`}
                              className="text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200 rounded px-2 py-1 hover:bg-violet-50 transition-colors"
                            >
                              View / Print
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
