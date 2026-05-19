import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const CategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameGu: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;

    const { searchParams } = req.nextUrl;
    const publicBusinessId = searchParams.get("businessId");
    const targetBusinessId = publicBusinessId || businessId;

    if (!targetBusinessId) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 400 });
    }

    await connectDB();

    const query: Record<string, unknown> = { businessId: targetBusinessId };

    const activeOnly = searchParams.get("active");
    if (activeOnly === "true") query.isActive = true;

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/categories:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = CategorySchema.parse(body);

    await connectDB();

    const slug = slugify(validated.name);

    const existing = await Category.findOne({ businessId, slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await Category.create({ ...validated, businessId, slug });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 422 }
      );
    }
    console.error("POST /api/categories:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
