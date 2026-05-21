import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isOtpValid = user.verificationOtp
      ? await bcrypt.compare(otp, user.verificationOtp)
      : false;
    if (!isOtpValid) {
      return NextResponse.json({ success: false, error: "Invalid OTP code" }, { status: 400 });
    }

    if (!user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
      return NextResponse.json({ success: false, error: "OTP code has expired" }, { status: 400 });
    }

    // Mark as verified
    user.isVerified = true;
    user.emailVerified = new Date();
    // Clear OTP fields
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    // Trigger welcome email asynchronously (errors caught internally or logged)
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
