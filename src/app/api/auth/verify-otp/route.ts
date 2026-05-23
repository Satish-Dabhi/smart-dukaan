import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";
import { checkOtpVerifyLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await checkOtpVerifyLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      // Return same error as invalid OTP to prevent enumeration
      return NextResponse.json({ success: false, error: "Invalid or expired OTP code" }, { status: 400 });
    }

    // Check expiry BEFORE bcrypt compare (fail-fast, avoid unnecessary hash computation)
    if (!user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
      return NextResponse.json({ success: false, error: "OTP code has expired" }, { status: 400 });
    }

    const isOtpValid = user.verificationOtp
      ? await bcrypt.compare(String(otp), user.verificationOtp)
      : false;
    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP code" }, { status: 400 });
    }

    user.isVerified = true;
    user.emailVerified = new Date();
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.name || "Store Owner");
    } catch (emailErr) {
      console.error("[VERIFY_OTP] Failed to send welcome email:", emailErr);
    }

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("POST /api/auth/verify-otp:", error);
    return NextResponse.json({ success: false, error: "Failed to verify OTP" }, { status: 500 });
  }
}
