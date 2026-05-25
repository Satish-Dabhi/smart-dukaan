import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendOtpEmail } from "@/lib/email";
import { checkCustomerRegisterLimit, getClientIp } from "@/lib/ratelimit";

const CustomerRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(15).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await checkCustomerRegisterLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const body = await req.json();
    const parsed = CustomerRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });
    }
    const { name, email, password, phone } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      authProvider: "credentials",
    });

    // Send numeric OTP directly to the user's email
    await sendOtpEmail(user.email, user.name, otp);

    return NextResponse.json(
      { success: true, data: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });
    }
    console.error("Customer registration error:", error);
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
  }
}
