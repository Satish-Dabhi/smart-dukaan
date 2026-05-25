import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ProductSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: "No products provided" }, { status: 400 });
    }

    await connectDB();

    // Fetch all categories of this business to map category names to IDs
    const categories = await Category.find({ businessId }).lean();
    const categoryMap = new Map();
    categories.forEach((cat) => {
      categoryMap.set(cat.name.toLowerCase().trim(), cat._id.toString());
      if (cat.nameGu) {
        categoryMap.set(cat.nameGu.toLowerCase().trim(), cat._id.toString());
      }
    });

    const productsToInsert = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const raw = products[i];

      // Clean and normalize fields
      const price = Number(raw.price || raw.Price);
      const stock = Number(raw.stock !== undefined ? raw.stock : raw.Stock || 0);

      const rawOrigPrice = raw.originalPrice || raw["Original Price"];
      const originalPrice = rawOrigPrice ? Number(rawOrigPrice) : undefined;

      const rawDiscount = raw.discount || raw["Discount %"];
      const discount = rawDiscount ? Number(rawDiscount) : undefined;

      const rawMinStock = raw.minStock || raw["Min Stock"];
      const minStock = rawMinStock ? Number(rawMinStock) : undefined;

      const rawGst = raw.gstPercentage || raw["GST %"];
      const gstPercentage = rawGst ? Number(rawGst) : undefined;

      const rawFeatured = raw.isFeatured || raw["Featured (Y/N)"];
      const isFeatured = String(rawFeatured).toLowerCase().startsWith("y") || rawFeatured === true;

      const categoryName = raw.category || raw.Category;
      let categoryId = undefined;
      if (categoryName) {
        const key = String(categoryName).toLowerCase().trim();
        categoryId = categoryMap.get(key);
      }

      const productData = {
        name: raw.name || raw["Product Name"],
        nameGu: raw.nameGu || raw["Name (Gujarati)"] || undefined,
        description: raw.description || raw.Description || undefined,
        price,
        originalPrice,
        discount,
        sku: String(raw.sku || raw.SKU || "").trim() || undefined,
        barcode: String(raw.barcode || raw.Barcode || "").trim() || undefined,
        stock,
        minStock,
        status: raw.status || raw.Status || "active",
        isFeatured,
        gstPercentage,
        hsnCode: String(raw.hsnCode || raw["HSN Code"] || "").trim() || undefined,
        unit: String(raw.unit || raw.Unit || "pcs").trim(),
        categoryId,
      };

      // Validate using Zod ProductSchema
      const result = ProductSchema.safeParse(productData);
      if (!result.success) {
        errors.push({
          row: i + 2, // 1-based index + 1 for header row
          name: productData.name || `Row ${i + 2}`,
          issues: result.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`),
        });
      } else {
        productsToInsert.push({
          ...result.data,
          businessId,
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for some rows",
          details: errors,
        },
        { status: 422 }
      );
    }

    // Bulk insert
    const inserted = await Product.insertMany(productsToInsert);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${inserted.length} products`,
      count: inserted.length,
    });
  } catch (error) {
    console.error("POST /api/products/import:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
