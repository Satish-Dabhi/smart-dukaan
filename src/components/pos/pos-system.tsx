"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Printer,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, calculateGST, debounce } from "@/lib/utils";
import type { CartItem, IProduct } from "@/types";
import { InvoicePrint } from "@/components/pos/invoice-print";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";

interface POSProps {
  businessId?: string;
}

type PaymentMethod = "cash" | "upi" | "card";

interface CheckoutData {
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  discount: number;
}

export function POSSystem({ businessId }: POSProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<Record<string, unknown> | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customerName: "",
    customerPhone: "",
    paymentMethod: "cash",
    discount: 0,
  });
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const debouncedSearch = useMemo(() => debounce((q: string) => setDebouncedQuery(q), 300), []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const { data: products = [] } = useQuery<IProduct[]>({
    queryKey: ["pos-products", businessId, debouncedQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      params.set("status", "active");
      params.set("limit", "20");
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!businessId,
  });

  const addToCart = (product: IProduct) => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Not enough stock");
          return prev;
        }
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          nameGu: product.nameGu,
          price: product.price,
          quantity: 1,
          discount: product.discount ?? 0,
          gst: product.gstPercentage ?? 0,
          image: product.images?.[0],
          stock: product.stock,
        },
      ];
    });
    toast.success(`${product.name} added to cart`, { duration: 1000 });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => {
    const discounted = item.price * (1 - item.discount / 100);
    return sum + discounted * item.quantity;
  }, 0);

  const additionalDiscount = (subtotal * checkoutData.discount) / 100;
  const afterDiscount = subtotal - additionalDiscount;
  const gstBreakdown = cart.reduce(
    (acc, item) => {
      const discounted = item.price * (1 - item.discount / 100);
      const itemTotal = discounted * item.quantity;
      const { cgst, sgst } = calculateGST(itemTotal, item.gst);
      return { cgst: acc.cgst + cgst, sgst: acc.sgst + sgst };
    },
    { cgst: 0, sgst: 0 }
  );
  const total = afterDiscount + gstBreakdown.cgst + gstBreakdown.sgst;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          items: cart,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          paymentMethod: checkoutData.paymentMethod,
          discount: additionalDiscount,
          subtotal,
          cgst: gstBreakdown.cgst,
          sgst: gstBreakdown.sgst,
          total,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLastInvoice(json.data);
      setShowCheckout(false);
      setShowSuccess(true);
      clearCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full max-h-[calc(100vh-8rem)]">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <Input
            placeholder="Search or scan product..."
            value={searchQuery}
            onChange={handleSearch}
            startIcon={<Search className="w-4 h-4" />}
            className="h-11"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((product) => (
              <motion.button
                key={product._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className={`bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 text-left hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-md transition-all duration-200 ${
                  product.stock === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden">
                  {product.images?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ProductImageFallback
                      name={product.name}
                      className="w-full h-full"
                      iconClassName="w-8 h-8"
                    />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {product.name}
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-bold mt-1">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Stock: {product.stock}</p>
                {product.stock === 0 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Out of Stock
                  </Badge>
                )}
              </motion.button>
            ))}

            {products.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No products found</p>
                <p className="text-sm mt-1">Add products in the Products section</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="lg:w-80 xl:w-96 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-violet-600">
                        {formatCurrency(item.price * (1 - item.discount / 100))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cart.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
                  <p className="text-sm">Cart is empty</p>
                  <p className="text-xs mt-1">Click products to add</p>
                </div>
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>CGST</span>
                  <span>{formatCurrency(gstBreakdown.cgst)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>SGST</span>
                  <span>{formatCurrency(gstBreakdown.sgst)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-violet-600">{formatCurrency(total)}</span>
                </div>

                <Button
                  className="w-full mt-3"
                  variant="gradient"
                  size="lg"
                  onClick={() => setShowCheckout(true)}
                >
                  Checkout {formatCurrency(total)}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Checkout</h2>
                  <button onClick={() => setShowCheckout(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Customer Name (optional)
                    </label>
                    <Input
                      placeholder="Walk-in customer"
                      value={checkoutData.customerName}
                      onChange={(e) =>
                        setCheckoutData((p) => ({ ...p, customerName: e.target.value }))
                      }
                      startIcon={<User className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Phone Number (optional)
                    </label>
                    <Input
                      placeholder="+91 XXXXXXXXXX"
                      value={checkoutData.customerPhone}
                      onChange={(e) =>
                        setCheckoutData((p) => ({ ...p, customerPhone: e.target.value }))
                      }
                      type="tel"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["cash", "upi", "card"] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          onClick={() => setCheckoutData((p) => ({ ...p, paymentMethod: method }))}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                            checkoutData.paymentMethod === method
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {method === "cash" && <Banknote className="w-5 h-5 text-emerald-600" />}
                          {method === "upi" && <Smartphone className="w-5 h-5 text-blue-600" />}
                          {method === "card" && <CreditCard className="w-5 h-5 text-violet-600" />}
                          <span className="text-xs font-medium capitalize">{method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      Additional Discount %
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={checkoutData.discount || ""}
                      onChange={(e) =>
                        setCheckoutData((p) => ({ ...p, discount: Number(e.target.value) }))
                      }
                    />
                  </div>

                  {/* Final total */}
                  <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-1 text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {additionalDiscount > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-emerald-600">
                        <span>Discount ({checkoutData.discount}%)</span>
                        <span>-{formatCurrency(additionalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm mb-1 text-gray-600">
                      <span>GST</span>
                      <span>{formatCurrency(gstBreakdown.cgst + gstBreakdown.sgst)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-violet-700 border-t border-violet-200 dark:border-violet-800 pt-2 mt-2">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCheckout(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    loading={loading}
                    onClick={handleCheckout}
                  >
                    Confirm & Bill
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm text-center p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order Placed!
              </h2>
              <p className="text-gray-500 mb-6">
                Invoice #{(lastInvoice as { invoiceNumber?: string })?.invoiceNumber} created
                successfully
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSuccess(false);
                    setLastInvoice(null);
                  }}
                >
                  New Bill
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1 gap-2"
                  onClick={() => {
                    handlePrint();
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden print component */}
      <div className="hidden">
        <InvoicePrint ref={printRef} invoice={lastInvoice} />
      </div>
    </div>
  );
}
