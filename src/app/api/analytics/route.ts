import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const businessIdStr = session?.user?.businessId;
    if (!businessIdStr) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Session stores businessId as string; MongoDB stores it as ObjectId.
    // Aggregation $match requires ObjectId — string comparison silently returns 0 results.
    const businessId = new mongoose.Types.ObjectId(businessIdStr);

    await connectDB();

    const { searchParams } = req.nextUrl;
    const period = searchParams.get("period") ?? "30"; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      revenueData,
      ordersByStatus,
      topProducts,
      customerGrowth,
      revenueByCategory,
      hourlyOrders,
    ] = await Promise.all([
      // Revenue by day
      Invoice.aggregate([
        {
          $match: {
            businessId,
            status: "paid",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Orders by status
      Order.aggregate([
        { $match: { businessId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Top products
      Order.aggregate([
        { $match: { businessId } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.total" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]),

      // Customer growth by day
      Customer.aggregate([
        { $match: { businessId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Revenue by category
      Order.aggregate([
        { $match: { businessId } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "categories",
            localField: "product.categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $group: {
            _id: { $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Uncategorized"] },
            revenue: { $sum: "$items.total" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),

      // Peak hours
      Order.aggregate([
        { $match: { businessId } },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenueByDay: revenueData.map((d) => ({ date: d._id, value: d.revenue, count: d.count })),
        ordersByStatus: ordersByStatus.map((d) => ({ status: d._id, count: d.count })),
        topProducts: topProducts.map((d) => ({
          id: d._id,
          name: d.product.name,
          image: d.product.images?.[0],
          totalSold: d.totalSold,
          revenue: d.revenue,
        })),
        customerGrowth: customerGrowth.map((d) => ({ date: d._id, count: d.count })),
        revenueByCategory: revenueByCategory.map((d) => ({
          category: d._id,
          revenue: d.revenue,
        })),
        peakHours: hourlyOrders.map((d) => ({ hour: d._id, count: d.count })),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
