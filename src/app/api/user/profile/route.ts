import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(15).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = ProfileSchema.parse(body);

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { name, ...(phone ? { phone } : {}) } },
      { new: true, select: "-password -verificationOtp -resetPasswordOtp" }
    );

    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: { name: user.name, phone: user.phone } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });
    }
    console.error("PUT /api/user/profile:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
