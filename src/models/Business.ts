import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBusinessDoc extends Document {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  fssaiNumber?: string;
  invoiceType?: "tax_invoice" | "bill_of_supply";
  logo?: string;
  favicon?: string;
  banner?: string;
  description?: string;
  descriptionGu?: string;
  tagline?: string;
  taglineGu?: string;
  theme: string;
  productView?: string;
  status: "active" | "inactive" | "suspended";
  whatsappNumber?: string;
  mapUrl?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  openingHours?: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  settings: {
    currency: string;
    currencySymbol: string;
    taxEnabled: boolean;
    defaultGst: number;
    invoicePrefix: string;
    invoiceCounter: number;
    loyaltyEnabled: boolean;
    onlineOrderEnabled: boolean;
    whatsappOrderEnabled: boolean;
    language: string;
    dailySummaryEnabled?: boolean;
  };
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  subscriptionPlan: string;
  subscriptionExpiresAt?: Date;
  trialStartedAt?: Date;
  googleSiteVerification?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusinessDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    gstNumber: { type: String },
    fssaiNumber: { type: String, trim: true },
    invoiceType: {
      type: String,
      enum: ["tax_invoice", "bill_of_supply"],
      default: "tax_invoice",
    },
    logo: { type: String },
    favicon: { type: String },
    banner: { type: String },
    description: { type: String },
    descriptionGu: { type: String },
    tagline: { type: String },
    taglineGu: { type: String },
    theme: {
      type: String,
      enum: ["grocery", "cafe", "bakery", "restaurant", "medical", "salon", "retail", "minimal"],
      default: "minimal",
    },
    productView: {
      type: String,
      enum: ["card", "row", "compact"],
      default: "card",
    },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    whatsappNumber: { type: String },
    mapUrl: { type: String },
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
      website: String,
    },
    openingHours: [
      {
        day: { type: String, required: true },
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
    ],
    settings: {
      currency: { type: String, default: "INR" },
      currencySymbol: { type: String, default: "₹" },
      taxEnabled: { type: Boolean, default: true },
      defaultGst: { type: Number, default: 18 },
      invoicePrefix: { type: String, default: "INV" },
      invoiceCounter: { type: Number, default: 1 },
      loyaltyEnabled: { type: Boolean, default: false },
      onlineOrderEnabled: { type: Boolean, default: true },
      whatsappOrderEnabled: { type: Boolean, default: true },
      language: { type: String, default: "en" },
      dailySummaryEnabled: { type: Boolean, default: false },
    },
    primaryColor: { type: String, default: "#7c3aed" },
    secondaryColor: { type: String, default: "#db2777" },
    fontFamily: { type: String, default: "Inter" },
    subscriptionPlan: {
      type: String,
      default: "trial",
    },
    subscriptionExpiresAt: { type: Date },
    trialStartedAt: { type: Date },
    googleSiteVerification: { type: String },
  },
  { timestamps: true }
);

BusinessSchema.index({ ownerId: 1 });
BusinessSchema.index({ status: 1 });
// Storefront lookup: slug + status (most common public query)
BusinessSchema.index({ slug: 1, status: 1 });
// Admin growth aggregation
BusinessSchema.index({ createdAt: -1 });
// Subscription management + expiry jobs
BusinessSchema.index({ subscriptionPlan: 1, status: 1 });
BusinessSchema.index({ subscriptionExpiresAt: 1 }, { sparse: true });

const Business: Model<IBusinessDoc> =
  mongoose.models.Business || mongoose.model<IBusinessDoc>("Business", BusinessSchema);

export default Business;
