"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { IInvoice } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface ExportCsvButtonProps {
  invoices: IInvoice[];
}

export function ExportCsvButton({ invoices }: ExportCsvButtonProps) {
  const t = useTranslations("invoices");

  const exportCSV = () => {
    const rows = [
      ["Invoice #", "Date", "Customer", "Amount", "Status", "Payment Method"],
      ...invoices.map((inv) => [
        inv.invoiceNumber,
        formatDateTime(inv.createdAt),
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
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
      <Download className="w-4 h-4" />
      {t("exportCsv")}
    </Button>
  );
}
