"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type { IProduct } from "@/types";

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
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  product: IProduct | null;
  businessId?: string;
  onSuccess: () => void;
}

const numericFields = new Set(["price", "originalPrice", "discount", "stock", "minStock", "gstPercentage"]);
const wideFields = new Set(["name", "nameGu"]);

export function ProductDialog({ open, onClose, product, businessId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "active",
      stock: 0,
      gstPercentage: 18,
    },
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
      });
    } else {
      reset({ status: "active", stock: 0, gstPercentage: 18 });
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
      toast.success(product ? "Product updated!" : "Product created!");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{ name: keyof FormData; label: string; type: string; placeholder: string }> = [
    { name: "name", label: "Product Name *", type: "text", placeholder: "e.g. Whole Wheat Bread" },
    { name: "nameGu", label: "Name (Gujarati)", type: "text", placeholder: "ગુજરાતી નામ" },
    { name: "price", label: "Price (₹) *", type: "number", placeholder: "0.00" },
    { name: "originalPrice", label: "Original Price (₹)", type: "number", placeholder: "0.00" },
    { name: "discount", label: "Discount %", type: "number", placeholder: "0" },
    { name: "stock", label: "Stock *", type: "number", placeholder: "0" },
    { name: "minStock", label: "Low Stock Alert", type: "number", placeholder: "5" },
    { name: "sku", label: "SKU", type: "text", placeholder: "ABC-001" },
    { name: "barcode", label: "Barcode", type: "text", placeholder: "1234567890" },
    { name: "gstPercentage", label: "GST %", type: "number", placeholder: "18" },
    { name: "hsnCode", label: "HSN Code", type: "text", placeholder: "0401" },
    { name: "unit", label: "Unit", type: "text", placeholder: "pcs / kg / ltr" },
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
              <h2 className="text-xl font-bold">{product ? "Edit Product" : "Add Product"}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
                      {...register(field.name, numericFields.has(field.name) ? { valueAsNumber: true } : {})}
                      className={errors[field.name] ? "border-red-500" : ""}
                    />
                    {errors[field.name] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[field.name]?.message as string}
                      </p>
                    )}
                  </div>
                ))}

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="h-9 w-full px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
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
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Featured Product
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                loading={loading}
                onClick={handleSubmit(onSubmit)}
              >
                {product ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
