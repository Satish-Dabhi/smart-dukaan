import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locales = ["en", "gu"];

  const entries: MetadataRoute.Sitemap = [];

  try {
    await connectDB();
    // Fetch only active businesses and grab slug and updatedAt
    const businesses = await Business.find({ status: "active" }).select("slug updatedAt").lean();

    // 1. Add static marketing and system entry points in all languages
    locales.forEach((locale) => {
      // Home page
      entries.push({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      });
      // Auth portal
      entries.push({
        url: `${baseUrl}/${locale}/auth/login`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      });
      entries.push({
        url: `${baseUrl}/${locale}/auth/signup`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      });
    });

    // 2. Add dynamic business storefront URLs in all locales
    businesses.forEach((business) => {
      locales.forEach((locale) => {
        entries.push({
          url: `${baseUrl}/${locale}/business/${business.slug}`,
          lastModified: business.updatedAt ? new Date(business.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    });
  } catch (error) {
    console.error("[SITEMAP_GENERATION] Failed to construct dynamic sitemap:", error);
    // Return fallback with static homepages on database connection failure
    locales.forEach((locale) => {
      entries.push({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      });
    });
  }

  return entries;
}
