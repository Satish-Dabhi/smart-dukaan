import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "SmartDukaan — Your Business, Smarter",
    template: "%s | SmartDukaan",
  },
  description:
    "The all-in-one platform for Indian local businesses. POS billing, online store, WhatsApp ordering, and powerful analytics.",
  keywords: ["POS", "billing", "inventory", "business", "India", "GST", "WhatsApp ordering"],
  authors: [{ name: "SmartDukaan" }],
  creator: "SmartDukaan",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SmartDukaan",
    title: "SmartDukaan — Your Business, Smarter",
    description: "The all-in-one platform for Indian local businesses.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartDukaan — Your Business, Smarter",
    description: "The all-in-one platform for Indian local businesses.",
  },
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "en";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
