import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { ICustomer, PaginationMeta } from "@/types";

interface GetCustomersParams {
  businessId: string;
  page?: number;
  limit?: number;
  q?: string;
}

export async function getCustomers({
  businessId,
  page = 1,
  limit = 15,
  q,
}: GetCustomersParams): Promise<{ data: ICustomer[]; meta: PaginationMeta }> {
  await connectDB();
  
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { businessId };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(query).sort({ totalSpent: -1 }).skip(skip).limit(limit).lean(),
    Customer.countDocuments(query),
  ]);

  const serializedCustomers = JSON.parse(JSON.stringify(customers)) as ICustomer[];

  return {
    data: serializedCustomers,
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
