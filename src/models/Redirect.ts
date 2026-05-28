import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRedirectDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  sourcePath: string; // e.g. "/products/old-item-123"
  targetPath: string; // e.g. "/en/business/fresh-mart?category=grocery"
  statusCode: number; // e.g. 301 or 308
  createdAt: Date;
  updatedAt: Date;
}

const RedirectSchema = new Schema<IRedirectDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    sourcePath: { type: String, required: true, trim: true },
    targetPath: { type: String, required: true, trim: true },
    statusCode: { type: Number, default: 301 },
  },
  { timestamps: true }
);

// Optimize fast lookup for a specific business's old incoming URL path
RedirectSchema.index({ businessId: 1, sourcePath: 1 }, { unique: true });

const Redirect: Model<IRedirectDoc> =
  mongoose.models.Redirect || mongoose.model<IRedirectDoc>("Redirect", RedirectSchema);

export default Redirect;
