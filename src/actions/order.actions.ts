"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { OrderStatus } from "@/types";

export async function updateOrderStatus(id: string, status: OrderStatus, locale: string) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId;

    if (!businessId) {
      throw new Error("Unauthorized");
    }

    await connectDB();
    
    const order = await Order.findOneAndUpdate(
      { _id: id, businessId },
      { status },
      { new: true }
    );

    if (!order) {
      throw new Error("Order not found or unauthorized");
    }

    // Revalidate the orders page to refresh the Server Component data
    revalidatePath(`/${locale}/dashboard/orders`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status" };
  }
}
