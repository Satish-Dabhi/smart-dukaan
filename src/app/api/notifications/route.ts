import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { redis } from "@/lib/redis";

const CACHE_TTL = 120; // 2 minutes in seconds

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const unreadOnly = searchParams.get("unread") === "true";

    const query: Record<string, unknown> = { businessId };
    if (unreadOnly) {
      query.read = false;
    }

    const cacheKey = `notifications:${businessId}${unreadOnly ? ":unread" : ""}`;
    if (redis) {
      try {
        const cached = await redis.get<unknown[]>(cacheKey);
        if (cached) {
          return NextResponse.json({ success: true, data: cached });
        }
      } catch (cacheError) {
        console.error("Redis read error in notifications:", cacheError);
      }
    }

    await connectDB();
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30).lean();

    if (redis) {
      try {
        await redis.set(cacheKey, notifications, { ex: CACHE_TTL });
      } catch (cacheError) {
        console.error("Redis write error in notifications:", cacheError);
      }
    }

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await Notification.updateMany({ businessId, read: false }, { $set: { read: true } });

    if (redis) {
      try {
        await Promise.all([
          redis.del(`notifications:${businessId}`),
          redis.del(`notifications:${businessId}:unread`),
        ]);
      } catch (cacheError) {
        console.error("Redis cache eviction error on POST:", cacheError);
      }
    }

    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
