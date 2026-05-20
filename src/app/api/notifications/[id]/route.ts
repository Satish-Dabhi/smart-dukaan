import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const notification = await Notification.findOneAndUpdate(
      { _id: id, businessId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error("PATCH /api/notifications/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
