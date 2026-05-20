"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface InvoicesFilterProps {
  currentStatus: string;
}

export function InvoicesFilter({ currentStatus }: InvoicesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("invoices");

  const handleChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      className="h-9 px-3 rounded-lg border border-input bg-background text-sm min-w-[140px]"
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">{t("allStatus")}</option>
      <option value="paid">{t("paid")}</option>
      <option value="unpaid">{t("unpaid")}</option>
      <option value="cancelled">{t("cancelled")}</option>
      <option value="draft">{t("draft")}</option>
    </select>
  );
}
