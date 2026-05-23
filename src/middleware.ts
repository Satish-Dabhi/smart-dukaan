import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const intlMiddleware = createIntlMiddleware(routing);

const DASHBOARD_PATTERN = /^\/[a-z]{2}\/dashboard/;
const AUTH_PATTERN = /^\/[a-z]{2}\/auth/;
const API_AUTH_PATTERN = /^\/api\/auth/;

export default auth(async function middleware(req: NextRequest & { auth?: unknown }) {
  const { pathname } = req.nextUrl;

  // Let NextAuth's own routes through untouched
  if (API_AUTH_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  // Apply i18n middleware to all non-API routes
  if (!pathname.startsWith("/api/")) {
    const session = (req as { auth?: { user?: { role?: string; businessId?: string } } }).auth;

    // Redirect unauthenticated users away from dashboard at the edge (before SSR)
    if (DASHBOARD_PATTERN.test(pathname) && !session?.user) {
      const locale = pathname.split("/")[1] || "en";
      const loginUrl = new URL(`/${locale}/auth/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (AUTH_PATTERN.test(pathname) && session?.user) {
      const locale = pathname.split("/")[1] || "en";
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }

    return intlMiddleware(req);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files and _next internals
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|og-image.jpg).*)",
  ],
};
