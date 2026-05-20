import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendOtpEmail } from "@/lib/email";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = RegisterSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "business_owner",
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send plain OTP to user — only the hash is stored in DB
    await sendOtpEmail(user.email, user.name, otp);

    return NextResponse.json(
      { success: true, data: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed" }, { status: 422 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
  }
}
