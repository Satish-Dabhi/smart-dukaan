import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { IOrder, PaginationMeta } from "@/types";

interface GetOrdersParams {
  businessId: string;
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export async function getOrders({
  businessId,
  page = 1,
  limit = 15,
  status,
  q,
}: GetOrdersParams): Promise<{ data: IOrder[]; meta: PaginationMeta }> {
  await connectDB();
  
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { businessId };

  if (status) {
    query.status = status;
  }

  if (q) {
    query.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { customerName: { $regex: q, $options: "i" } },
      { customerPhone: { $regex: q, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  // Convert ObjectIds to strings recursively for Next.js Server Components
  const serializedOrders = JSON.parse(JSON.stringify(orders)) as IOrder[];

  return {
    data: serializedOrders,
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
