"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/actions/order.actions";
import { OrderStatus } from "@/types";
import { useTranslations } from "next-intl";

interface UpdateOrderStatusButtonProps {
  orderId: string;
  nextStatus: OrderStatus;
  locale: string;
}

export function UpdateOrderStatusButton({ orderId, nextStatus, locale }: UpdateOrderStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("orders");

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus, locale);
      if (result.success) {
        toast.success(t("orderStatusUpdatedToast"));
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1"
      onClick={handleUpdate}
      disabled={isPending}
    >
      <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
      {t(nextStatus)}
    </Button>
  );
}
