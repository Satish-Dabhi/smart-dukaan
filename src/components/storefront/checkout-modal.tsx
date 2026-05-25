import { motion } from "framer-motion";
import { X, Truck, Store, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/types";
import type { Dispatch, SetStateAction } from "react";

interface CheckoutModalProps {
  showCheckoutModal: boolean;
  setShowCheckoutModal: (show: boolean) => void;
  formErrors: Record<string, string>;
  setFormErrors: Dispatch<SetStateAction<Record<string, string>>>;
  checkoutForm: {
    customerName: string;
    customerPhone: string;
    notes: string;
    paymentMethod: string;
  };
  setCheckoutForm: React.Dispatch<
    React.SetStateAction<{
      customerName: string;
      customerPhone: string;
      notes: string;
      paymentMethod: string;
    }>
  >;
  handlePlaceOrder: (e: React.FormEvent) => void;
  cart: CartItem[];
  cartTotal: number;
  isSubmitting: boolean;
  t: (en: string, gu: string) => string;
  formatCurrency: (value: number) => string;
}

export function CheckoutModal({
  showCheckoutModal,
  setShowCheckoutModal,
  formErrors,
  setFormErrors,
  checkoutForm,
  setCheckoutForm,
  handlePlaceOrder,
  cart,
  cartTotal,
  isSubmitting,
  t,
  formatCurrency,
}: CheckoutModalProps) {
  if (!showCheckoutModal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => {
        setShowCheckoutModal(false);
        setFormErrors({});
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-2xl text-foreground bg-gradient-to-r from-violet-600 to-indigo-650 bg-clip-text text-transparent">
              {t("Complete Your Order", "તમારો ઓર્ડર પૂર્ણ કરો")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                "Enter your details to finalize the purchase",
                "ખરીદી પૂર્ણ કરવા માટે વિગતો દાખલ કરો"
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setShowCheckoutModal(false);
              setFormErrors({});
            }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("Full Name", "પૂરું નામ")} <span className="text-destructive">*</span>
            </label>
            <Input
              required
              placeholder={t("Enter your name", "તમારું નામ દાખલ કરો")}
              value={checkoutForm.customerName}
              onChange={(e) => {
                setCheckoutForm((prev) => ({ ...prev, customerName: e.target.value }));
                if (formErrors.customerName)
                  setFormErrors((prev) => ({ ...prev, customerName: "" }));
              }}
              className={`h-11 rounded-xl focus-visible:ring-violet-500 ${formErrors.customerName ? "border-destructive" : ""}`}
            />
            {formErrors.customerName && (
              <p className="text-xs text-destructive mt-1">{formErrors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("Phone Number", "ફોન નંબર")} <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              required
              placeholder={t("Enter 10-digit mobile number", "10-અંકનો મોબાઇલ નંબર")}
              value={checkoutForm.customerPhone}
              onChange={(e) => {
                setCheckoutForm((prev) => ({ ...prev, customerPhone: e.target.value }));
                if (formErrors.customerPhone)
                  setFormErrors((prev) => ({ ...prev, customerPhone: "" }));
              }}
              className={`h-11 rounded-xl focus-visible:ring-violet-500 ${formErrors.customerPhone ? "border-destructive" : ""}`}
            />
            {formErrors.customerPhone && (
              <p className="text-xs text-destructive mt-1">{formErrors.customerPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("Delivery Address or Special Notes", "સરનામું અથવા વિશેષ નોંધો")}
            </label>
            <textarea
              rows={3}
              required
              placeholder={t(
                "E.g., Table 4, Home Delivery Address, or special requests...",
                "દા.ત., ટેબલ 4, ડિલિવરી સરનામું..."
              )}
              value={checkoutForm.notes}
              onChange={(e) => setCheckoutForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {t("Payment Method", "ચુકવણી પદ્ધતિ")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCheckoutForm((prev) => ({ ...prev, paymentMethod: "cod" }))}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                  checkoutForm.paymentMethod === "cod"
                    ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-650"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground"
                }`}
              >
                <Truck className="w-5 h-5 mb-1 text-violet-500" />
                {t("Cash on Delivery", "કેશ ઓન ડિલિવરી")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setCheckoutForm((prev) => ({ ...prev, paymentMethod: "pay_at_store" }))
                }
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                  checkoutForm.paymentMethod === "pay_at_store"
                    ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 text-violet-650"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground"
                }`}
              >
                <Store className="w-5 h-5 mb-1 text-violet-500" />
                {t("Pay at Store", "દુકાન પર ચૂકવો")}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-850/50 rounded-2xl p-4 mt-2 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("Total Items", "કુલ આઇટમ")}</span>
              <span className="font-semibold text-foreground">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground border-t border-gray-250/50 dark:border-gray-700/50 pt-2">
              <span>{t("Amount Payable", "ચૂકવવાપાત્ર રકમ")}</span>
              <span className="text-violet-650 dark:text-violet-400">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>

          {formErrors.form && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2">
              {formErrors.form}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="gradient"
            className="w-full h-12 text-base font-bold rounded-2xl shadow-xl shadow-violet-200 dark:shadow-violet-900/30 transition-transform active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("Placing Order...", "ઓર્ડર થઈ રહ્યો છે...")}
              </>
            ) : (
              t(
                `Place Order - ${formatCurrency(cartTotal)}`,
                `ઓર્ડર સબમિટ કરો - ${formatCurrency(cartTotal)}`
              )
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
