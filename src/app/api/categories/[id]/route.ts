import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameGu: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = UpdateSchema.parse(body);

    await connectDB();

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.name) {
      const slug = slugify(validated.name);
      const conflict = await Category.findOne({ businessId, slug, _id: { $ne: id } });
      if (conflict) {
        return NextResponse.json(
          { success: false, error: "Category with this name already exists" },
          { status: 409 }
        );
      }
      updateData.slug = slug;
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, businessId },
      updateData,
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 422 }
      );
    }
    console.error("PUT /api/categories/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const productCount = await Product.countDocuments({ businessId, categoryId: id });
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete — ${productCount} product(s) use this category` },
        { status: 409 }
      );
    }

    const category = await Category.findOneAndDelete({ _id: id, businessId });
    if (!category) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
