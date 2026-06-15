import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { InvoicesFilter } from "./invoices-filter";
import { ExportCsvButton } from "./export-csv-button";
import { getInvoices } from "@/services/invoice.service";
import { requireBusinessAuth } from "@/lib/require-auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { FileText } from "lucide-react";
import { MobileCard, MobileCardRow } from "@/components/shared/mobile-card";

const statusVariant: Record<string, "success" | "destructive" | "warning" | "secondary" | "info"> =
  {
    paid: "success",
    unpaid: "warning",
    cancelled: "destructive",
    draft: "secondary",
    refunded: "info",
  };

interface InvoicesManagerProps {
  page: number;
  q: string;
  status: string;
}

export async function InvoicesManager({ page, q, status }: InvoicesManagerProps) {
  const { businessId } = await requireBusinessAuth();
  const [t, locale] = await Promise.all([getTranslations("invoices"), getLocale()]);

  const { data: invoices, meta } = await getInvoices({ businessId, page, q, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("totalInvoices", { count: meta.total })}</p>
        </div>
        <ExportCsvButton invoices={invoices} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder={t("searchPlaceholder")} />
        </div>
        <InvoicesFilter currentStatus={status} />
      </div>

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500">{t("noInvoices")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("noInvoicesSub")}</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {[
                        t("thInvoice"),
                        t("thCustomer"),
                        t("thDate"),
                        t("thAmount"),
                        t("thStatus"),
                        t("thActions"),
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 ${i === 3 ? "text-right" : i === 5 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice._id.toString()}
                        className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {invoice.paymentMethod?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {invoice.customerName ?? t("walkInCustomer")}
                          </div>
                          {!!invoice.customerPhone && (
                            <div className="text-xs text-gray-400">{invoice.customerPhone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDateTime(invoice.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-sm text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
                            {t(invoice.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/${locale}/invoice/${businessId}/${invoice._id}`}
                              className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View / Print
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden space-y-3 p-4">
                {invoices.map((invoice) => (
                  <MobileCard key={invoice._id.toString()}>
                    <MobileCardRow label="Invoice #" value={invoice.invoiceNumber} />
                    <MobileCardRow
                      label="Customer"
                      value={invoice.customerName ?? t("walkInCustomer")}
                    />
                    <MobileCardRow label="Date" value={formatDateTime(invoice.createdAt)} />
                    <MobileCardRow
                      label="Status"
                      value={
                        <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
                          {t(invoice.status)}
                        </Badge>
                      }
                    />
                    <MobileCardRow
                      label="Total"
                      value={formatCurrency(invoice.total)}
                      valueClassName="text-violet-600 font-bold"
                    />
                    <div className="pt-2">
                      <Link
                        href={`/${locale}/invoice/${businessId}/${invoice._id}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors w-fit"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View / Print
                      </Link>
                    </div>
                  </MobileCard>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Pagination meta={meta} />
    </div>
  );
}
