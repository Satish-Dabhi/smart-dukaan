import { NextRequest, NextResponse, connection } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";

export async function GET(req: NextRequest) {
  await connection();
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 15;
    const skip = (page - 1) * limit;

    // Find orders and invoices where customerEmail matches the logged-in user
    const [orders, total, invoices] = await Promise.all([
      Order.find({ customerEmail: session.user.email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("businessId", "name slug")
        .lean(),
      Order.countDocuments({ customerEmail: session.user.email }),
      Invoice.find({ customerEmail: session.user.email })
        .sort({ createdAt: -1 })
        .select("_id invoiceNumber businessId total status createdAt")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: { orders: JSON.parse(JSON.stringify(orders)), invoices: JSON.parse(JSON.stringify(invoices)) },
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
    console.error("GET /api/customer/orders:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
