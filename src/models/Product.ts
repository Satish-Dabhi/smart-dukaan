import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  nameGu?: string;
  description?: string;
  descriptionGu?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sku?: string;
  barcode?: string;
  images: string[];
  categoryId?: mongoose.Types.ObjectId;
  stock: number;
  minStock: number;
  status: "active" | "inactive" | "out_of_stock";
  isFeatured: boolean;
  gstPercentage: number;
  hsnCode?: string;
  unit?: string;
  weight?: number;
  tags?: string[];
  totalSold: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameGu: { type: String, trim: true },
    description: { type: String },
    descriptionGu: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },
    images: [{ type: String }],
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    isFeatured: { type: Boolean, default: false },
    gstPercentage: { type: Number, default: 18 },
    hsnCode: { type: String },
    unit: { type: String, default: "pcs" },
    weight: { type: Number },
    tags: [{ type: String }],
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1, status: 1 });
ProductSchema.index({ businessId: 1, categoryId: 1 });
ProductSchema.index({ businessId: 1, isFeatured: 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });

const Product: Model<IProductDoc> =
  mongoose.models.Product || mongoose.model<IProductDoc>("Product", ProductSchema);

export default Product;
