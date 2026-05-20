import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
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
