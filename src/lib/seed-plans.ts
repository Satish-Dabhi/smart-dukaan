import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { DEFAULT_PLANS } from "@/lib/plans";

let seeded = false;

export async function ensurePlansSeeded(): Promise<void> {
  if (seeded) return;
  await connectDB();
  const count = await Plan.countDocuments();
  if (count === 0) {
    await Plan.insertMany(DEFAULT_PLANS);
  }
  seeded = true;
}

export async function getPlanBySlug(slug: string) {
  await connectDB();
  return Plan.findOne({ slug }).lean();
}
