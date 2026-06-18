import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { ensurePlansSeeded } from "@/lib/seed-plans";

export async function GET() {
  try {
    await connectDB();
    await ensurePlansSeeded();

    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("GET /api/plans error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
