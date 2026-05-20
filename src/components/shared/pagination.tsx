"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta | null | undefined;
}

export function Pagination({ meta }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tCommon = useTranslations("common");

  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
      <Button
        variant="outline"
        size="sm"
        disabled={!meta.hasPrev}
        onClick={() => handlePageChange(meta.page - 1)}
        className="rounded-lg"
      >
        {tCommon("previous")}
      </Button>
      <span className="text-sm text-muted-foreground">
        {tCommon("pageInfo", { page: meta.page, totalPages: meta.totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!meta.hasNext}
        onClick={() => handlePageChange(meta.page + 1)}
        className="rounded-lg"
      >
        {tCommon("next")}
      </Button>
    </div>
  );
}
