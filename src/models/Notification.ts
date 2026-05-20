import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "inventory" | "system";
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["order", "inventory", "system"], default: "system" },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ businessId: 1, read: 1 });
NotificationSchema.index({ businessId: 1, createdAt: -1 });

const Notification: Model<INotificationDoc> =
  mongoose.models.Notification || mongoose.model<INotificationDoc>("Notification", NotificationSchema);

export default Notification;
