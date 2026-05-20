import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";
import { IProduct, PaginationMeta } from "@/types";

interface GetProductsParams {
  businessId: string;
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  lowStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getProducts({
  businessId,
  page = 1,
  limit = 20,
  q,
  category,
  status,
  featured,
  lowStock,
  minPrice,
  maxPrice,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetProductsParams): Promise<{ data: IProduct[]; meta: PaginationMeta }> {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { businessId };

  if (q) {
    query.$text = { $search: q };
  }

  if (category) query.categoryId = category;
  if (status) query.status = status;
  if (featured !== undefined) query.isFeatured = featured;

  if (lowStock) {
    query.$expr = { $lte: ["$stock", "$minStock"] };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) (query.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (query.price as Record<string, number>).$lte = maxPrice;
  }

  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name nameGu slug")
      .lean(),
    Product.countDocuments(query),
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(products)) as IProduct[];

  return {
    data: serializedProducts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
