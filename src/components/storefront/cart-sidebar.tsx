import { motion } from "framer-motion";
import Image from "next/image";
import { X, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

interface AppRouter {
  push: (href: string) => void;
}

interface CartSidebarProps {
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  cartCount: number;
  cart: CartItem[];
  locale: string;
  t: (en: string, gu: string) => string;
  updateQuantity: (productId: string, delta: number) => void;
  cartTotal: number;
  session: Session | null;
  pendingCartKey: string;
  router: AppRouter;
  pathname: string;
  setShowCheckoutModal: (show: boolean) => void;
  setCart: (cart: CartItem[]) => void;
}

export function CartSidebar({
  showCart,
  setShowCart,
  cartCount,
  cart,
  locale,
  t,
  updateQuantity,
  cartTotal,
  session,
  pendingCartKey,
  router,
  pathname,
  setShowCheckoutModal,
  setCart,
}: CartSidebarProps) {
  if (!showCart) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={() => setShowCart(false)}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-lg text-foreground">{t("Your Cart", "તમારો કાર્ટ")}</h2>
            <p className="text-xs text-muted-foreground">
              {cartCount} {t("item(s)", "આઇટમ")}
            </p>
          </div>
          <button
            onClick={() => setShowCart(false)}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item) => (
            <motion.div
              key={item.productId}
              layout
              exit={{ opacity: 0, x: 50 }}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3"
            >
              {item.image ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700 relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <ProductImageFallback
                    name={item.name}
                    className="w-full h-full"
                    iconClassName="w-5 h-5"
                    showOverlay={false}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {locale === "gu" ? (item.nameGu ?? item.name) : item.name}
                </p>
                <p className="text-xs text-violet-650 font-bold">
                  {formatCurrency(item.price * (1 - item.discount / 100))}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">{t("Total", "કુલ")}</span>
            <span className="text-xl font-black text-violet-600">{formatCurrency(cartTotal)}</span>
          </div>
          {cartCount > 0 ? (
            <Button
              variant="gradient"
              className="w-full gap-2 h-12 text-base font-bold shadow-lg shadow-violet-200 dark:shadow-violet-900/30 cursor-pointer"
              onClick={() => {
                if (!session) {
                  localStorage.setItem(pendingCartKey, JSON.stringify(cart));
                  router.push(
                    `/${locale}/auth/customer-auth?callbackUrl=${encodeURIComponent(pathname)}`
                  );
                  return;
                }
                setShowCart(false);
                setShowCheckoutModal(true);
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              {t("Proceed to Checkout", "ચેકઆઉટ કરવા આગળ વધો")}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              {t("Your cart is empty", "તમારો કાર્ટ ખાલી છે")}
            </Button>
          )}
          <button
            onClick={() => setCart([])}
            className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer border-0 bg-transparent"
          >
            {t("Clear cart", "કાર્ટ સાફ કરો")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
