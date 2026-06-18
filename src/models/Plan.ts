import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlanFeatures {
  products: number; // max products (-1 = unlimited)
  staff: number;
  customers: number;
  invoicesPerMonth: number;
  analyticsHistory: number; // days (-1 = unlimited)
  onlineStorefront: boolean;
  whatsappOrders: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export interface IPlanDoc extends Document {
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  durationDays: number | null;
  isTrial: boolean;
  isActive: boolean;
  sortOrder: number;
  features: IPlanFeatures;
  createdAt: Date;
  updatedAt: Date;
}

const PlanFeaturesSchema = new Schema<IPlanFeatures>(
  {
    products: { type: Number, required: true, default: 50 },
    staff: { type: Number, required: true, default: 2 },
    customers: { type: Number, required: true, default: 100 },
    invoicesPerMonth: { type: Number, required: true, default: 100 },
    analyticsHistory: { type: Number, required: true, default: 30 },
    onlineStorefront: { type: Boolean, default: true },
    whatsappOrders: { type: Boolean, default: true },
    customDomain: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
  },
  { _id: false }
);

const PlanSchema = new Schema<IPlanDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priceMonthly: { type: Number, required: true, default: 0 },
    priceYearly: { type: Number, required: true, default: 0 },
    durationDays: { type: Number, default: null },
    isTrial: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    features: { type: PlanFeaturesSchema, required: true },
  },
  { timestamps: true }
);

PlanSchema.index({ isActive: 1, sortOrder: 1 });

const Plan: Model<IPlanDoc> = mongoose.models.Plan || mongoose.model<IPlanDoc>("Plan", PlanSchema);

export default Plan;
