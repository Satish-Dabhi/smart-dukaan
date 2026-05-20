import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ success: false, error: "Email, OTP, and new password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset code" }, { status: 400 });
    }

    const isOtpValid = user.resetPasswordOtp
      ? await bcrypt.compare(otp, user.resetPasswordOtp)
      : false;
    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset code" }, { status: 400 });
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return NextResponse.json({ success: false, error: "Reset code has expired. Please request a new one." }, { status: 400 });
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
