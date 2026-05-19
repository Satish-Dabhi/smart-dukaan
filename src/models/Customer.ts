import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomerDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: Date;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    loyaltyPoints: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    notes: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

CustomerSchema.index({ businessId: 1, phone: 1 }, { unique: true });
CustomerSchema.index({ businessId: 1, email: 1 });
CustomerSchema.index({ name: "text", email: "text", phone: "text" });

const Customer: Model<ICustomerDoc> =
  mongoose.models.Customer || mongoose.model<ICustomerDoc>("Customer", CustomerSchema);

export default Customer;
