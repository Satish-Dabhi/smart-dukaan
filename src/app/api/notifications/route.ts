import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const unreadOnly = searchParams.get("unread") === "true";

    const query: Record<string, any> = { businessId };
    if (unreadOnly) {
      query.read = false;
    }

    await connectDB();
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await Notification.updateMany({ businessId, read: false }, { $set: { read: true } });

    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
