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
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ businessId: 1 });

const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);

export default User;
