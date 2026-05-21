"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";

export async function adjustInventoryStock(
  productId: string,
  quantity: number,
  notes: string,
  locale: string
) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;
    if (!businessId || !session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!productId || quantity === undefined) {
      throw new Error("Invalid request");
    }

    await connectDB();

    const product = await Product.findOne({ _id: productId, businessId });
    if (!product) {
      throw new Error("Product not found");
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
      type: "adjustment",
      quantity: Number(quantity),
      previousStock,
      newStock: product.stock,
      notes,
      createdBy: session.user.id,
    });

    revalidatePath(`/${locale}/dashboard/inventory`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to adjust stock";
    return { success: false, error: errorMessage };
  }
}
