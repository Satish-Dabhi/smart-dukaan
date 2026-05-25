import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { StorefrontPage } from "@/components/storefront/storefront-page";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const business = await Business.findOne({ slug, status: "active" }).lean();
  if (!business) return { title: "Store Not Found" };

  return {
    title: `${business.name} — SmartDukaan`,
    description: business.description ?? `Shop at ${business.name}`,
    openGraph: {
      title: business.name,
      description: business.description ?? `Shop at ${business.name}`,
      images: business.logo ? [{ url: business.logo }] : [],
    },
  };
}

export default async function BusinessStorefront({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const filters = await searchParams;

  await connectDB();

  const business = await Business.findOne({ slug, status: "active" }).lean();
  if (!business) notFound();

  const productQuery: Record<string, unknown> = {
    businessId: business._id.toString(),
    status: "active",
  };

  if (filters.category) productQuery.categoryId = filters.category;
  if (filters.q) productQuery.$text = { $search: filters.q };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    popular: { totalSold: -1 },
  };
  const sort = sortMap[filters.sort ?? ""] ?? { createdAt: -1 };

  const [products, categories] = await Promise.all([
    Product.find(productQuery).sort(sort).limit(50).lean(),
    Category.find({ businessId: business._id.toString(), isActive: true })
      .sort({ sortOrder: 1 })
      .lean(),
  ]);

  // Strip exact stock counts — only expose inStock boolean to the public client.
  const publicProducts = products.map(({ stock, ...rest }) => ({
    ...rest,
    inStock: stock > 0,
  }));

  return (
    <StorefrontPage
      business={JSON.parse(JSON.stringify(business))}
      products={JSON.parse(JSON.stringify(publicProducts))}
      categories={JSON.parse(JSON.stringify(categories))}
      locale={locale}
      filters={filters}
    />
  );
}
