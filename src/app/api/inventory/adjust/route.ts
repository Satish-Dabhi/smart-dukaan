import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId || !session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, notes, type } = await req.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOne({ _id: productId, businessId });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const previousStock = product.stock;
    product.stock = Math.max(0, previousStock + Number(quantity));
    if (product.stock > 0 && product.status === "out_of_stock") {
      product.status = "active";
    }
    await product.save();

    await InventoryLog.create({
      businessId,
      productId,
      type: type ?? "adjustment",
      quantity: Number(quantity),
      previousStock,
      newStock: product.stock,
      notes,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true, data: { stock: product.stock } });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
