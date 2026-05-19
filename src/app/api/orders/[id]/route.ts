import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { z } from "zod";
import { OrderUpdateSchema } from "@/lib/schemas";

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
    const order = await Order.findOneAndUpdate(
      { _id: id, businessId },
      { $set: validated },
      { new: true, runValidators: true }
    );
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
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
