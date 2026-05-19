import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  nameGu?: string;
  description?: string;
  image?: string;
  slug: string;
  parentId?: mongoose.Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameGu: { type: String, trim: true },
    description: { type: String },
    image: { type: String },
    slug: { type: String, required: true, lowercase: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ businessId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ businessId: 1, isActive: 1 });

const Category: Model<ICategoryDoc> =
  mongoose.models.Category || mongoose.model<ICategoryDoc>("Category", CategorySchema);

export default Category;
