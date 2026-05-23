import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { checkResetPasswordLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = await checkResetPasswordLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: "Password must be between 8 and 128 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    if (!user) {
      // Return generic error to prevent email enumeration
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Check expiry BEFORE bcrypt compare (fail-fast)
    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return NextResponse.json(
        { success: false, error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const isOtpValid = user.resetPasswordOtp
      ? await bcrypt.compare(String(otp), user.resetPasswordOtp)
      : false;
    if (!isOtpValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("POST /api/auth/reset-password:", error);
    return NextResponse.json({ success: false, error: "Failed to reset password" }, { status: 500 });
  }
}
