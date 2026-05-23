import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    discount: number;
    gst: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  status: "placed" | "delivered";
  paymentMethod?: string;
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  whatsappOrder: boolean;
  tableNumber?: string;
  source: "pos" | "online" | "whatsapp" | "qr";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    orderNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        gst: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "delivered"],
      default: "placed",
    },
    paymentMethod: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    notes: { type: String },
    whatsappOrder: { type: Boolean, default: false },
    tableNumber: { type: String },
    source: { type: String, enum: ["pos", "online", "whatsapp", "qr"], default: "pos" },
  },
  { timestamps: true }
);

OrderSchema.index({ businessId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ businessId: 1, status: 1 });
OrderSchema.index({ businessId: 1, createdAt: -1 });
// Customer-facing lookup by email
OrderSchema.index({ customerEmail: 1 });
// Analytics: orders by business with date filter
OrderSchema.index({ businessId: 1, createdAt: -1, status: 1 });

const Order: Model<IOrderDoc> =
  mongoose.models.Order || mongoose.model<IOrderDoc>("Order", OrderSchema);

export default Order;
