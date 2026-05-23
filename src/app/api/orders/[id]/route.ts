import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { z } from "zod";
import { OrderUpdateSchema } from "@/lib/schemas";
import { sendOrderDeliveredEmail } from "@/lib/email";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = OrderUpdateSchema.parse(body);

    await connectDB();

    // Fetch previous status before updating so we can detect transitions
    const previous = await Order.findOne({ _id: id, businessId }).select("status customerEmail customerName orderNumber total").lean();

    const order = await Order.findOneAndUpdate(
      { _id: id, businessId },
      { $set: validated },
      { new: true, runValidators: true }
    );
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Send delivery confirmation email when order transitions to delivered
    if (
      validated.status === "delivered" &&
      previous?.status !== "delivered" &&
      order.customerEmail
    ) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      sendOrderDeliveredEmail(
        order.customerEmail,
        order.customerName ?? "Customer",
        order.orderNumber,
        order.total,
        appUrl ? `${appUrl}/en/account/orders` : undefined
      ).catch((err) => console.error("[EMAIL] Delivery notification failed:", err));
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 422 }
      );
    }
    console.error("PUT /api/orders/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
