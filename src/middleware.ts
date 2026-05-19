import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware(routing);

const publicPatterns = [
  /^\/(en|gu)$/,
  /^\/(en|gu)\/business\/[^/]+/,
  /^\/(en|gu)\/auth\//,
  /^\/api\/auth\//,
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/icons\//,
];

function isPublicPath(pathname: string): boolean {
  return publicPatterns.some((pattern) => pattern.test(pathname));
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for public paths
  if (isPublicPath(pathname)) {
    return intlMiddleware(req);
  }

  // Protected dashboard routes
  if (pathname.includes("/dashboard") || pathname.includes("/pos")) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL("/en/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json).*)"],
};
