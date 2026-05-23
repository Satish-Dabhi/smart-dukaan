import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendForgotPasswordEmail } from "@/lib/email";
import { checkOtpLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await checkOtpLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true, message: "If that email is registered, a reset code has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = await bcrypt.hash(otp, 10);
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send plain OTP to user — only the hash is stored in DB
    await sendForgotPasswordEmail(user.email, user.name, otp);

    return NextResponse.json({ success: true, message: "If that email is registered, a reset code has been sent." });
  } catch (error) {
    console.error("POST /api/auth/forgot-password:", error);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}
