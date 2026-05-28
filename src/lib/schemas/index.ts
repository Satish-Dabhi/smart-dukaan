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
  brand: z.string().optional(),
  icon: z.string().optional(),
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
  productView: z.enum(["card", "row", "compact"]).optional(),
  whatsappNumber: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  logo: z.string().url().optional().or(z.literal("")),
  banner: z.string().url().optional().or(z.literal("")),
  googleSiteVerification: z.string().optional(),
});

// Explicitly allowlist only the fields a business owner may self-update.
// subscriptionPlan, subscriptionExpiresAt, status, ownerId, and slug are
// intentionally absent — those are admin-only or immutable.
export const BusinessUpdateSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    pincode: z.string().min(6).max(6).optional(),
    gstNumber: z.string().optional(),
    description: z.string().optional(),
    descriptionGu: z.string().optional(),
    tagline: z.string().optional(),
    taglineGu: z.string().optional(),
    theme: z.string().optional(),
    productView: z.enum(["card", "row", "compact"]).optional(),
    whatsappNumber: z.string().min(10, "WhatsApp number must be at least 10 digits").optional(),
    mapUrl: z.string().optional(),
    logo: z.string().url().optional().or(z.literal("")),
    banner: z.string().url().optional().or(z.literal("")),
    favicon: z.string().url().optional().or(z.literal("")),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    googleSiteVerification: z.string().optional(),
    fontFamily: z.string().optional(),
    socialLinks: z
      .object({
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        youtube: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
    openingHours: z
      .array(
        z.object({
          day: z.string(),
          open: z.string(),
          close: z.string(),
          isClosed: z.boolean(),
        })
      )
      .optional(),
    // Settings sub-fields via MongoDB dot-notation $set keys
    "settings.currency": z.string().optional(),
    "settings.currencySymbol": z.string().optional(),
    "settings.invoicePrefix": z.string().max(10).optional(),
    "settings.taxEnabled": z.boolean().optional(),
    "settings.defaultGst": z.number().min(0).max(28).optional(),
    "settings.loyaltyEnabled": z.boolean().optional(),
    "settings.onlineOrderEnabled": z.boolean().optional(),
    "settings.whatsappOrderEnabled": z.boolean().optional(),
    "settings.language": z.enum(["en", "gu"]).optional(),
  })
  .strict();

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
  status: z.enum(["placed", "delivered"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
  notes: z.string().max(500).optional(),
});

export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>;

// ─── Demo Connect ───────────────────────────────────────────────────────────

export const ConnectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessType: z.string().min(1, "Please select your business type"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export type ConnectInput = z.infer<typeof ConnectSchema>;
