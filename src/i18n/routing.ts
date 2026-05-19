import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "gu"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/auth/login": "/auth/login",
    "/auth/register": "/auth/register",
    "/dashboard": "/dashboard",
    "/dashboard/products": "/dashboard/products",
    "/dashboard/categories": "/dashboard/categories",
    "/dashboard/orders": "/dashboard/orders",
    "/dashboard/invoices": "/dashboard/invoices",
    "/dashboard/customers": "/dashboard/customers",
    "/dashboard/inventory": "/dashboard/inventory",
    "/dashboard/analytics": "/dashboard/analytics",
    "/dashboard/settings": "/dashboard/settings",
    "/dashboard/pos": "/dashboard/pos",
    "/business/[slug]": "/business/[slug]",
  },
});
