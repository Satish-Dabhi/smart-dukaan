import { z } from "zod";

// ─── Product ─────────────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  nameGu: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0).optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]).optional(),
  isFeatured: z.boolean().optional(),
  gstPercentage: z.number().min(0).max(28).optional(),
  hsnCode: z.string().optional(),
  unit: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// ─── Business ────────────────────────────────────────────────────────────────

export const BusinessSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6).max(6),
  gstNumber: z.string().optional(),
  description: z.string().optional(),
  tagline: z.string().optional(),
  taglineGu: z.string().optional(),
  theme: z.string().optional(),
  whatsappNumber: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  banner: z.string().url().optional().or(z.literal("")),
});

export const BusinessUpdateSchema = BusinessSchema.extend({
  "settings.currency": z.string().optional(),
  "settings.invoicePrefix": z.string().optional(),
  "settings.taxRate": z.number().min(0).max(100).optional(),
});

export type BusinessInput = z.infer<typeof BusinessSchema>;
export type BusinessUpdateInput = z.infer<typeof BusinessUpdateSchema>;

// ─── Category ────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameGu: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// ─── Order ───────────────────────────────────────────────────────────────────

export const OrderUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "partial", "paid", "refunded"]).optional(),
  notes: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
});

export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>;
