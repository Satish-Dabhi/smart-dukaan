import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import User from "@/models/User";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { BusinessSchema, BusinessUpdateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, data: null });
    }

    await connectDB();
    const business = await Business.findById(businessId).lean();
    return NextResponse.json({ success: true, data: business });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = BusinessSchema.parse(body);

    await connectDB();

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ ownerId: session.user.id });
    if (existingBusiness) {
      return NextResponse.json(
        { success: false, error: "You already have a business" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(validated.name);
    const existing = await Business.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const business = await Business.create({
      ...validated,
      slug,
      ownerId: session.user.id,
    });

    // Link business to user
    await User.findByIdAndUpdate(session.user.id, { businessId: business._id });

    return NextResponse.json({ success: true, data: business }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = BusinessUpdateSchema.parse(body);

    await connectDB();

    const business = await Business.findByIdAndUpdate(
      businessId,
      { $set: validated },
      { new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 422 }
      );
    }
    console.error("PUT /api/business:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
