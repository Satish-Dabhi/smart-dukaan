import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventoryLogDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: "restock" | "sale" | "adjustment" | "damage" | "return" | "import";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLogDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["restock", "sale", "adjustment", "damage", "return", "import"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reference: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryLogSchema.index({ businessId: 1, productId: 1 });
InventoryLogSchema.index({ businessId: 1, createdAt: -1 });

const InventoryLog: Model<IInventoryLogDoc> =
  mongoose.models.InventoryLog ||
  mongoose.model<IInventoryLogDoc>("InventoryLog", InventoryLogSchema);

export default InventoryLog;
