"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustInventoryStock } from "@/actions/inventory.actions";
import { useTranslations } from "next-intl";

interface AdjustStockButtonProps {
  productId: string;
  productName: string;
  currentStock: number;
  locale: string;
}

export function AdjustStockButton({ productId, productName, currentStock, locale }: AdjustStockButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qty, setQty] = useState(0);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");

  const handleAdjust = () => {
    startTransition(async () => {
      const result = await adjustInventoryStock(productId, qty, notes, locale);
      if (result.success) {
        toast.success(t("stockAdjustedToast"));
        setIsOpen(false);
        setQty(0);
        setNotes("");
      } else {
        toast.error(result.error || "Failed to adjust stock");
      }
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-3 h-3" />
        {t("restock")}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">{productName}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("currentStock", { count: currentStock })}</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("addStockQty")}</label>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  placeholder={t("enterQtyPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("notes")}</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)} disabled={isPending}>
                {tCommon("cancel")}
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                disabled={isPending}
                onClick={handleAdjust}
              >
                {isPending ? "..." : t("updateStock")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
