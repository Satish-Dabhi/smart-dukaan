import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import type { IBusiness } from "@/types";

interface QRModalProps {
  showQR: boolean;
  setShowQR: (show: boolean) => void;
  business: IBusiness;
  storeUrl: string;
  t: (en: string, gu: string) => string;
}

export function QRModal({ showQR, setShowQR, business, storeUrl, t }: QRModalProps) {
  if (!showQR) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowQR(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-xl text-foreground mb-1">{business.name}</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {t("Scan to visit our store", "ઓ storefront ની મુલાકાત માટે સ્કેન કરો")}
        </p>
        <div className="inline-block p-4 bg-white rounded-2xl shadow-inner">
          <QRCodeCanvas value={storeUrl} size={180} />
        </div>
        <Button
          variant="outline"
          className="mt-5 w-full cursor-pointer"
          onClick={() => setShowQR(false)}
        >
          {t("Close", "બંધ")}
        </Button>
      </motion.div>
    </motion.div>
  );
}
