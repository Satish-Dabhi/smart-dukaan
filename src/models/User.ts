import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role: "super_admin" | "business_owner" | "staff" | "customer";
  businessId?: mongoose.Types.ObjectId;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  authProvider: "google" | "credentials";
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["super_admin", "business_owner", "staff", "customer"],
      default: "business_owner",
    },
    businessId: { type: Schema.Types.ObjectId, ref: "Business" },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationOtp: { type: String },
    verificationOtpExpires: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    lastLoginAt: { type: Date },
    authProvider: { type: String, enum: ["google", "credentials"], default: "credentials" },
  },
  { timestamps: true }
);

UserSchema.index({ businessId: 1 });
// Auth lookups
UserSchema.index({ email: 1 }); // already unique but explicit for clarity
// Admin growth aggregations
UserSchema.index({ createdAt: -1 });
// OTP expiry — TTL-style cleanup possible, but index helps expiry queries
UserSchema.index({ verificationOtpExpires: 1 }, { sparse: true });
UserSchema.index({ resetPasswordOtpExpires: 1 }, { sparse: true });

const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);

export default User;
