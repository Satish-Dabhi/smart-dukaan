import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWASplashScreen } from "@/components/pwa/pwa-splash-screen";
import { PWAInstallBanner } from "@/components/pwa/pwa-install-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SmartDukaan — Your Business, Smarter",
    template: "%s | SmartDukaan",
  },
  description:
    "SmartDukaan is the all-in-one business management platform for Indian retailers. POS billing, GST invoices, online storefront, inventory tracking, WhatsApp ordering, and powerful analytics — free to start.",
  keywords: [
    "POS billing India",
    "GST billing software",
    "inventory management India",
    "online store builder India",
    "WhatsApp ordering system",
    "small business management",
    "retail billing software",
    "free invoice generator India",
    "dukaan management app",
    "smart billing app",
    "business analytics India",
    "QR menu India",
  ],
  authors: [{ name: "SmartDukaan", url: APP_URL }],
  creator: "SmartDukaan",
  publisher: "SmartDukaan",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["gu_IN"],
    url: APP_URL,
    siteName: "SmartDukaan",
    title: "SmartDukaan — Your Business, Smarter",
    description:
      "The all-in-one platform for Indian local businesses. POS billing, GST invoices, online store, WhatsApp ordering, and powerful analytics.",
    images: [
      {
        url: "/icons/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "SmartDukaan — Business Management Platform for Indian Retailers",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SmartDukaan — Your Business, Smarter",
    description:
      "The all-in-one platform for Indian local businesses. POS billing, GST invoices, online store, WhatsApp ordering, and powerful analytics.",
    images: ["/icons/web-app-manifest-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/icons/favicon.ico" }],
  },
  manifest: "/manifest.json",
  category: "business",
  applicationName: "SmartDukaan",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#6d28d9" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SmartDukaan",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "All-in-one business management platform for Indian retailers — POS billing, GST invoices, online store, inventory, WhatsApp ordering, and analytics.",
  url: APP_URL,
  logo: `${APP_URL}/icons/web-app-manifest-512x512.png`,
  author: {
    "@type": "Organization",
    name: "SmartDukaan",
    url: APP_URL,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free to start, premium plans available",
  },
  inLanguage: ["en-IN", "gu-IN"],
  audience: {
    "@type": "Audience",
    audienceType: "Small and medium Indian businesses",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SmartDukaan" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Capture beforeinstallprompt before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwa_prompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwa_prompt = e;
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <PWASplashScreen />
        {children}
        <PWAInstallBanner />
      </body>
    </html>
  );
}
