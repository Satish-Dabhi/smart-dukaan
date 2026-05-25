"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Search,
  Carrot,
  Milk,
  Coffee,
  Cookie,
  Pill,
  Shirt,
  Scissors,
  Sparkles,
  Package,
  Leaf,
  ShoppingBag,
  Apple,
  Cake,
  Utensils,
  Tv,
  Candy,
  BookOpen,
  Flame,
  Heart,
  Tag,
  Gift,
  Gem,
  Crown,
  Banana,
  Egg,
  Wheat,
  Grape,
  Cherry,
  CupSoda,
  GlassWater,
  Croissant,
  IceCream,
  Pizza,
  Soup,
  ChefHat,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Smile,
  Clock,
  Truck,
} from "lucide-react";

const ICON_CATEGORIES = [
  {
    id: "grocery_bakery",
    name: "Grocery & Bakery",
    icons: [
      { id: "carrot", icon: Carrot, label: "Carrot" },
      { id: "apple", icon: Apple, label: "Apple" },
      { id: "banana", icon: Banana, label: "Banana" },
      { id: "grape", icon: Grape, label: "Grape" },
      { id: "cherry", icon: Cherry, label: "Cherry" },
      { id: "egg", icon: Egg, label: "Egg" },
      { id: "wheat", icon: Wheat, label: "Wheat" },
      { id: "milk", icon: Milk, label: "Milk" },
      { id: "leaf", icon: Leaf, label: "Organic Leaf" },
      { id: "cookie", icon: Cookie, label: "Cookie" },
      { id: "croissant", icon: Croissant, label: "Croissant" },
      { id: "candy", icon: Candy, label: "Candy & Snacks" },
    ],
  },
  {
    id: "food_dining",
    name: "Food & Dining",
    icons: [
      { id: "utensils", icon: Utensils, label: "Utensils" },
      { id: "coffee", icon: Coffee, label: "Coffee / Tea" },
      { id: "cake", icon: Cake, label: "Cake" },
      { id: "iceCream", icon: IceCream, label: "Ice Cream" },
      { id: "pizza", icon: Pizza, label: "Pizza" },
      { id: "soup", icon: Soup, label: "Soup" },
      { id: "chefHat", icon: ChefHat, label: "Chef Hat" },
      { id: "flame", icon: Flame, label: "Hot & Spicy" },
      { id: "cupSoda", icon: CupSoda, label: "Soda & Drinks" },
      { id: "glassWater", icon: GlassWater, label: "Water & Juice" },
    ],
  },
  {
    id: "fashion_luxury",
    name: "Fashion & Luxury",
    icons: [
      { id: "shoppingBag", icon: ShoppingBag, label: "Shopping Bag" },
      { id: "shirt", icon: Shirt, label: "Apparel & Shirt" },
      { id: "scissors", icon: Scissors, label: "Scissors & Grooming" },
      { id: "sparkles", icon: Sparkles, label: "Beauty & Sparkles" },
      { id: "tag", icon: Tag, label: "Price Tag" },
      { id: "gift", icon: Gift, label: "Gift Box" },
      { id: "gem", icon: Gem, label: "Gem & Jewel" },
      { id: "crown", icon: Crown, label: "Crown & Premium" },
    ],
  },
  {
    id: "electronics_home",
    name: "Electronics & Home",
    icons: [
      { id: "smartphone", icon: Smartphone, label: "Smartphone" },
      { id: "laptop", icon: Laptop, label: "Laptop & PC" },
      { id: "headphones", icon: Headphones, label: "Headphones" },
      { id: "tv", icon: Tv, label: "Television" },
      { id: "home", icon: Home, label: "Home Goods" },
      { id: "clock", icon: Clock, label: "Wall Clock" },
      { id: "truck", icon: Truck, label: "Delivery Truck" },
    ],
  },
  {
    id: "health_wellness",
    name: "Health & Wellness",
    icons: [
      { id: "pill", icon: Pill, label: "Medicine / Pill" },
      { id: "heart", icon: Heart, label: "Heart / Health" },
      { id: "smile", icon: Smile, label: "Smile / Selfcare" },
      { id: "package", icon: Package, label: "Standard Box" },
      { id: "bookOpen", icon: BookOpen, label: "Books & Stationery" },
    ],
  },
];
import type { IProduct } from "@/types";
import { useTranslations, useLocale } from "next-intl";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  nameGu: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0).optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]),
  isFeatured: z.boolean().optional(),
  gstPercentage: z.number().min(0).max(28).optional(),
  hsnCode: z.string().optional(),
  unit: z.string().optional(),
  icon: z.string().optional(),
  categoryId: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  product: IProduct | null;
  businessId?: string;
  onSuccess: () => void;
}

const numericFields = new Set([
  "price",
  "originalPrice",
  "discount",
  "stock",
  "minStock",
  "gstPercentage",
]);
const wideFields = new Set(["name", "nameGu"]);

export function ProductDialog({ open, onClose, product, businessId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "active",
      stock: 0,
      gstPercentage: 18,
      icon: "",
      categoryId: "",
    },
  });

  const selectedIcon = useWatch({
    control,
    name: "icon",
    defaultValue: "",
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        nameGu: product.nameGu ?? "",
        description: product.description ?? "",
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount ?? 0,
        sku: product.sku ?? "",
        barcode: product.barcode ?? "",
        stock: product.stock,
        minStock: product.minStock ?? 5,
        status: product.status,
        isFeatured: product.isFeatured,
        gstPercentage: product.gstPercentage ?? 18,
        hsnCode: product.hsnCode ?? "",
        unit: product.unit ?? "pcs",
        icon: product.icon ?? "",
        categoryId:
          typeof product.categoryId === "object" && product.categoryId
            ? (product.categoryId as { _id?: string })._id
            : (product.categoryId ?? ""),
      });
    } else {
      reset({ status: "active", stock: 0, gstPercentage: 18, icon: "", categoryId: "" });
    }
  }, [product, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save product");
      toast.success(product ? t("productUpdatedToast") : t("productCreatedToast"));
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };
  const locale = useLocale();
  const { data: categoriesData } = useQuery({
    queryKey: ["active-categories", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/categories?active=true`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!businessId && open,
  });
  const activeCategories = categoriesData ?? [];
  const fields: Array<{ name: keyof FormData; label: string; type: string; placeholder: string }> =
    [
      {
        name: "name",
        label: t("productNameLabel"),
        type: "text",
        placeholder: "e.g. Whole Wheat Bread",
      },
      { name: "nameGu", label: t("nameGujaratiLabel"), type: "text", placeholder: "ગુજરાતી નામ" },
      { name: "price", label: t("priceLabel"), type: "number", placeholder: "0.00" },
      {
        name: "originalPrice",
        label: t("originalPriceLabel"),
        type: "number",
        placeholder: "0.00",
      },
      { name: "discount", label: t("discountLabel"), type: "number", placeholder: "0" },
      { name: "stock", label: t("stockLabel"), type: "number", placeholder: "0" },
      { name: "minStock", label: t("minStockLabel"), type: "number", placeholder: "5" },
      { name: "sku", label: t("skuLabel"), type: "text", placeholder: "ABC-001" },
      { name: "barcode", label: t("barcodeLabel"), type: "text", placeholder: "1234567890" },
      { name: "gstPercentage", label: t("gstLabel"), type: "number", placeholder: "18" },
      { name: "hsnCode", label: t("hsnLabel"), type: "text", placeholder: "0401" },
      { name: "unit", label: t("unitLabel"), type: "text", placeholder: t("unitPlaceholder") },
    ];

  return (
    <AnimatePresence>
      {open && (
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">{product ? t("editProduct") : t("addProduct")}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={wideFields.has(field.name) ? "sm:col-span-2" : ""}
                  >
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                      {field.label}
                    </label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      step={field.type === "number" ? "0.01" : undefined}
                      {...register(
                        field.name,
                        numericFields.has(field.name) ? { valueAsNumber: true } : {}
                      )}
                      className={errors[field.name] ? "border-red-500" : ""}
                    />
                    {errors[field.name] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[field.name]?.message as string}
                      </p>
                    )}
                  </div>
                ))}

                {/* Icon Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Product Icon (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowIconModal(true)}
                      className="flex-1 flex items-center justify-between px-3 h-10 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-background hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          if (selectedIcon) {
                            const matchedIcon = ICON_CATEGORIES.flatMap((c) => c.icons).find(
                              (i) => i.id === selectedIcon
                            );
                            const IconComp = matchedIcon ? matchedIcon.icon : Package;
                            return (
                              <IconComp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            );
                          }
                          return <Package className="w-5 h-5 text-gray-400" />;
                        })()}
                        <span className="font-medium">
                          {(() => {
                            if (selectedIcon) {
                              const matchedIcon = ICON_CATEGORIES.flatMap((c) => c.icons).find(
                                (i) => i.id === selectedIcon
                              );
                              return matchedIcon ? matchedIcon.label : selectedIcon;
                            }
                            return "None (Use default fallback)";
                          })()}
                        </span>
                      </div>
                      <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                        Choose Icon
                      </span>
                    </Button>
                    {selectedIcon && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setValue("icon", "")}
                        className="h-10 px-3 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Category (Optional)
                  </label>
                  <select
                    {...register("categoryId")}
                    className="h-10 w-full px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-background text-sm cursor-pointer"
                  >
                    <option value="">No Category</option>
                    {activeCategories.map((cat: { _id: string; name: string; nameGu?: string }) => (
                      <option key={cat._id} value={cat._id}>
                        {locale === "gu" && cat.nameGu ? cat.nameGu : cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("statusLabel")}
                  </label>
                  <select
                    {...register("status")}
                    className="h-10 w-full px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-background text-sm cursor-pointer"
                  >
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                    <option value="out_of_stock">{t("outOfStock")}</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    {...register("isFeatured")}
                    className="w-4 h-4 text-violet-600 rounded"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("featuredProductLabel")}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("descriptionLabel")}
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder={t("descriptionPlaceholder")}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {tCommon("cancel")}
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                loading={loading}
                onClick={handleSubmit(onSubmit)}
              >
                {product ? t("saveChanges") : t("addProduct")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Searchable Icon Picker Modal */}
      <AnimatePresence>
        {showIconModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl h-[80vh] sm:h-auto sm:max-h-[80vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Choose Product Icon
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select a matching visual icon for your product fallback
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <Input
                  placeholder="Search icons (e.g. apple, shirt, bread)..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  startIcon={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>

              {/* Icons Grid Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {ICON_CATEGORIES.map((cat) => {
                  const filteredIcons = cat.icons.filter(
                    (item) =>
                      item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                      item.id.toLowerCase().includes(iconSearch.toLowerCase())
                  );

                  if (filteredIcons.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {filteredIcons.map((item) => {
                          const IconComp = item.icon;
                          const isSelected = selectedIcon === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setValue("icon", item.id);
                                setShowIconModal(false);
                              }}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                                isSelected
                                  ? "bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-600 dark:text-violet-400 shadow-md shadow-violet-100 dark:shadow-none scale-105"
                                  : "bg-gray-50/50 hover:bg-white dark:bg-gray-800/40 dark:hover:bg-gray-800 border-gray-100 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              <IconComp
                                className={`w-6 h-6 transition-transform ${isSelected ? "scale-110" : ""}`}
                              />
                              <span className="text-[10px] font-medium leading-tight truncate w-full">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Empty Search State */}
                {ICON_CATEGORIES.every(
                  (cat) =>
                    cat.icons.filter(
                      (item) =>
                        item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                        item.id.toLowerCase().includes(iconSearch.toLowerCase())
                    ).length === 0
                ) && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No matching icons found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
