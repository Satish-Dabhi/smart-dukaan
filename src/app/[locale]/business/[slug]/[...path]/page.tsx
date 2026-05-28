import { notFound, permanentRedirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Redirect from "@/models/Redirect";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
    path: string[];
  }>;
}

export default async function BusinessRedirectCatchAll({ params }: Props) {
  const { slug, path } = await params;

  await connectDB();

  // 1. Confirm business exists
  const business = await Business.findOne({ slug, status: "active" }).select("_id").lean();
  if (!business) {
    notFound();
  }

  // 2. Re-compile incoming path components into a relative sub-path e.g. "/products/old-item"
  const sourcePath = `/${path.join("/")}`;

  // 3. Query redirect registry
  const match = await Redirect.findOne({
    businessId: business._id,
    sourcePath: { $regex: new RegExp(`^${sourcePath}$`, "i") },
  }).lean();

  if (match) {
    // Perform standard permanent 308 (modern redirect preserving request method) or 301 redirect
    permanentRedirect(match.targetPath);
  }

  // No redirect match found: render standard next.js 404 page
  notFound();
}
