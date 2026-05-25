import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { IInvoice, PaginationMeta } from "@/types";

interface GetInvoicesParams {
  businessId: string;
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getInvoices({
  businessId,
  page = 1,
  limit = 20,
  q,
  status,
  startDate,
  endDate,
}: GetInvoicesParams): Promise<{ data: IInvoice[]; meta: PaginationMeta }> {
  await connectDB();

  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = { businessId, orderId: { $exists: false } };

  if (status) {
    query.status = status;
  }

  if (q) {
    query.$or = [
      { invoiceNumber: { $regex: q, $options: "i" } },
      { customerName: { $regex: q, $options: "i" } },
      { customerPhone: { $regex: q, $options: "i" } },
    ];
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate);
    if (endDate)
      (query.createdAt as Record<string, unknown>).$lte = new Date(endDate + "T23:59:59");
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Invoice.countDocuments(query),
  ]);

  const serializedInvoices = JSON.parse(JSON.stringify(invoices)) as IInvoice[];

  return {
    data: serializedInvoices,
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
