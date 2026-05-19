import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoiceDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  orderId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Array<{
    productId?: mongoose.Types.ObjectId;
    name: string;
    nameGu?: string;
    sku?: string;
    quantity: number;
    price: number;
    discount: number;
    gstPercentage: number;
    hsnCode?: string;
    total: number;
  }>;
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: "draft" | "paid" | "unpaid" | "cancelled" | "refunded";
  paymentMethod: string;
  notes?: string;
  dueDate?: Date;
  paidAt?: Date;
  printedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  nameGu: { type: String },
  sku: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  gstPercentage: { type: Number, default: 0 },
  hsnCode: { type: String },
  total: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoiceDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    invoiceNumber: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String },
    customerPhone: { type: String },
    customerAddress: { type: String },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "paid", "unpaid", "cancelled", "refunded"],
      default: "paid",
    },
    paymentMethod: { type: String, default: "cash" },
    notes: { type: String },
    dueDate: { type: Date },
    paidAt: { type: Date },
    printedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });
InvoiceSchema.index({ businessId: 1, customerId: 1 });

const Invoice: Model<IInvoiceDoc> =
  mongoose.models.Invoice || mongoose.model<IInvoiceDoc>("Invoice", InvoiceSchema);

export default Invoice;
