import { motion } from "framer-motion";
import { CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IOrder, IBusiness } from "@/types";

interface SuccessModalProps {
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  placedOrder: IOrder | null;
  setPlacedOrder: (order: IOrder | null) => void;
  handleSuccessWhatsApp: () => void;
  business: IBusiness;
  t: (en: string, gu: string) => string;
  formatCurrency: (value: number) => string;
}

export function SuccessModal({
  showSuccessModal,
  setShowSuccessModal,
  placedOrder,
  setPlacedOrder,
  handleSuccessWhatsApp,
  business,
  t,
  formatCurrency,
}: SuccessModalProps) {
  if (!showSuccessModal || !placedOrder) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 text-center shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800"
      >
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
          <CheckCircle className="w-10 h-10 animate-bounce" />
        </div>

        <h3 className="font-extrabold text-2xl text-foreground mb-1">
          {t("Order Placed!", "ઓર્ડર સફળતાપૂર્વક મૂકાયો!")}
        </h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
          {t(`Order Number: ${placedOrder.orderNumber}`, `ઓર્ડર નંબર: ${placedOrder.orderNumber}`)}
        </p>

        <div className="text-left bg-gray-55 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 space-y-2 border border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t("Order Details", "ઓર્ડર વિગતો")}
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
            {placedOrder.items.map((item, i: number) => (
              <div key={i} className="flex justify-between text-xs text-foreground">
                <span className="truncate max-w-[200px]">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-bold text-foreground">
            <span>{t("Total Paid", "કુલ ચૂકવેલ")}</span>
            <span className="text-violet-650 dark:text-violet-400">
              {formatCurrency(placedOrder.total)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {business.whatsappNumber && (
            <Button
              variant="gradient"
              onClick={handleSuccessWhatsApp}
              className="w-full gap-2 h-12 text-base font-bold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-violet-900/30 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              {t("Send WhatsApp Confirmation", "WhatsApp પર કન્ફર્મેશન મોકલો")}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setShowSuccessModal(false);
              setPlacedOrder(null);
            }}
            className="w-full h-12 text-base font-bold rounded-2xl border-gray-200 dark:border-gray-800 cursor-pointer"
          >
            {t("Continue Shopping", "ખરીદી ચાલુ રાખો")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
