import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";
import { z } from "zod";
import { ProductSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;

    // Allow public access for storefront
    const { searchParams } = req.nextUrl;
    const publicBusinessId = searchParams.get("businessId");
    const targetBusinessId = publicBusinessId || businessId;

    if (!targetBusinessId) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 400 });
    }

    await connectDB();

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { businessId: targetBusinessId };

    const q = searchParams.get("q");
    if (q) {
      query.$text = { $search: q };
    }

    const category = searchParams.get("category");
    if (category) query.categoryId = category;

    const status = searchParams.get("status");
    if (status) query.status = status;

    const featured = searchParams.get("featured");
    if (featured === "true") query.isFeatured = true;

    const lowStock = searchParams.get("lowStock");
    if (lowStock === "true") {
      query.$expr = { $lte: ["$stock", "$minStock"] };
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name nameGu slug")
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/products:", error);
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
    const validated = ProductSchema.parse(body);

    await connectDB();

    const product = await Product.create({ ...validated, businessId });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 422 }
      );
    }
    console.error("POST /api/products:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
