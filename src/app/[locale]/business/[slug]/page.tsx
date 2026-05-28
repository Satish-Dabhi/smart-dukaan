import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { StorefrontPage } from "@/components/storefront/storefront-page";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  await connectDB();
  const business = await Business.findOne({ slug, status: "active" }).lean();
  if (!business) return { title: "Store Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/${locale}/business/${slug}`;

  return {
    title: `${business.name} — SmartDukaan`,
    description: business.description ?? `Shop at ${business.name}`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/business/${slug}`,
        gu: `${baseUrl}/gu/business/${slug}`,
      },
    },
    openGraph: {
      title: business.name,
      description: business.description ?? `Shop at ${business.name}`,
      images: business.logo ? [{ url: business.logo }] : [],
      url: canonicalUrl,
    },
    verification: business.googleSiteVerification
      ? {
          google: business.googleSiteVerification,
        }
      : undefined,
  };
}

export default async function BusinessStorefront({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const filters = await searchParams;

  await connectDB();

  const business = await Business.findOne({ slug, status: "active" }).lean();
  if (!business) notFound();

  const page = Math.max(1, parseInt(filters.page || "1", 10));
  const limit = 24;

  const productQuery: Record<string, unknown> = {
    businessId: business._id.toString(),
    status: "active",
  };

  if (filters.category) productQuery.categoryId = filters.category;
  if (filters.q) productQuery.$text = { $search: filters.q };

  // Price & Brand faceted bounds filtering
  if (filters.brand) {
    productQuery.brand = { $in: filters.brand.split(",") };
  }

  if (filters.minPrice || filters.maxPrice) {
    productQuery.price = {
      ...(filters.minPrice ? { $gte: parseFloat(filters.minPrice) } : {}),
      ...(filters.maxPrice ? { $lte: parseFloat(filters.maxPrice) } : {}),
    };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    popular: { totalSold: -1 },
  };
  const sort = sortMap[filters.sort ?? ""] ?? { createdAt: -1 };

  const [products, total, categories, rawBrandsList, highestPriceProduct] = await Promise.all([
    Product.find(productQuery)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(productQuery),
    Category.find({ businessId: business._id.toString(), isActive: true })
      .sort({ sortOrder: 1 })
      .lean(),
    Product.distinct("brand", {
      businessId: business._id.toString(),
      status: "active",
      brand: { $ne: null, $exists: true },
    }),
    Product.findOne({ businessId: business._id.toString(), status: "active" })
      .sort({ price: -1 })
      .select("price")
      .lean(),
  ]);

  const brandsList = (rawBrandsList || []).filter(Boolean) as string[];
  const maxCatalogPrice = highestPriceProduct?.price || 1000;

  const totalPages = Math.ceil(total / limit);
  const pagination = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  // Strip exact stock counts — only expose inStock boolean to the public client.
  const publicProducts = products.map(({ stock, ...rest }) => ({
    ...rest,
    inStock: stock > 0,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const storeUrl = `${baseUrl}/${locale}/business/${slug}`;

  // 1. Determine LocalBusiness Subtype based on the custom tenant template theme
  let businessType = "LocalBusiness";
  if (["cafe", "restaurant"].includes(business.theme || "")) {
    businessType = "FoodEstablishment";
  } else if (["grocery", "retail", "medical", "bakery"].includes(business.theme || "")) {
    businessType = "Store";
  }

  // 2. Build dynamic schemas
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": businessType,
    name: business.name,
    description: business.description || business.tagline || `Shop online at ${business.name}`,
    image: business.logo || business.banner || `${baseUrl}/og-image.jpg`,
    telephone: business.phone,
    url: storeUrl,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.pincode,
      addressCountry: "IN",
    },
    openingHoursSpecification: business.openingHours?.map(
      (oh: { day: string; open: string; close: string; isClosed: boolean }) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: oh.day,
        opens: oh.isClosed ? "00:00" : oh.open || "09:00",
        closes: oh.isClosed ? "00:00" : oh.close || "21:00",
      })
    ),
    sameAs: Object.values(business.socialLinks || {}).filter(Boolean),
  };

  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${business.name} - Product Showcase`,
    numberOfItems: publicProducts.length,
    itemListElement: publicProducts.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.images?.[0] || `${baseUrl}/placeholder.png`,
        description: p.description || `Purchase ${p.name} online from ${business.name}`,
        sku: p.sku || p._id.toString(),
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: p.price,
          availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${storeUrl}?q=${encodeURIComponent(p.name)}`,
        },
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How can I place an order online at ${business.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can select items from our digital storefront catalog, add them to your shopping cart, and complete your order details. If enabled, you can also send your cart list directly to our official business WhatsApp number to coordinate immediate delivery!`,
        },
      },
      {
        "@type": "Question",
        name: `What payment options do you support?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `We accept Cash on Delivery (COD) as well as credit/debit card payments, direct UPI transactions, and custom digital wallet configurations depending on the merchant's setup.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${business.name} located?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${business.name} is located physically at ${business.address}, ${business.city}, ${business.state} - ${business.pincode}.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <StorefrontPage
        business={JSON.parse(JSON.stringify(business))}
        products={JSON.parse(JSON.stringify(publicProducts))}
        categories={JSON.parse(JSON.stringify(categories))}
        locale={locale}
        filters={filters}
        pagination={pagination}
        brandsList={brandsList}
        maxCatalogPrice={maxCatalogPrice}
      />
    </>
  );
}
