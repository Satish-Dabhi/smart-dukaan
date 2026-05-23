import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendOtpEmail } from "@/lib/email";
import { checkOtpLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await checkOtpLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      // Return success regardless to prevent user enumeration — don't reveal if email is registered
      return NextResponse.json({ success: true, message: "If that email is registered, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = await bcrypt.hash(otp, 10);
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send plain OTP to user — only the hash is stored in DB
    await sendOtpEmail(user.email, user.name, otp);

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("POST /api/auth/send-otp:", error);
    return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
  }
}
