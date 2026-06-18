import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { ensurePlansSeeded } from "@/lib/seed-plans";
import { z } from "zod";

async function isSuperAdmin() {
  const session = await auth();
  return session?.user?.role === "super_admin";
}

const PlanFeaturesSchema = z.object({
  products: z.number().int().min(-1),
  staff: z.number().int().min(-1),
  customers: z.number().int().min(-1),
  invoicesPerMonth: z.number().int().min(-1),
  analyticsHistory: z.number().int().min(-1),
  onlineStorefront: z.boolean(),
  whatsappOrders: z.boolean(),
  customDomain: z.boolean(),
  prioritySupport: z.boolean(),
  apiAccess: z.boolean(),
});

const CreatePlanSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(2).max(60),
  description: z.string().min(4).max(200),
  priceMonthly: z.number().min(0),
  priceYearly: z.number().min(0),
  durationDays: z.number().int().positive().nullable(),
  isTrial: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
  features: PlanFeaturesSchema,
});

const UpdatePlanSchema = CreatePlanSchema.partial().extend({
  features: PlanFeaturesSchema.optional(),
});

export async function GET() {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    await ensurePlansSeeded();
    const plans = await Plan.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("GET /api/super-admin/plans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await Plan.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A plan with this slug already exists" },
        { status: 409 }
      );
    }

    const plan = await Plan.create(parsed.data);
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/super-admin/plans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Plan id is required" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = UpdatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    await connectDB();
    const plan = await Plan.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );
    if (!plan) {
      return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error("PATCH /api/super-admin/plans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Plan id is required" }, { status: 400 });
    }

    await connectDB();
    const plan = await Plan.findById(id);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }
    if (plan.isTrial) {
      return NextResponse.json(
        { success: false, error: "The trial plan cannot be deleted" },
        { status: 400 }
      );
    }

    await plan.deleteOne();
    return NextResponse.json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/super-admin/plans:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
