import { NextResponse, type NextRequest } from "next/server";
import {
  CLIENT_AUTH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/cookies";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/interviews",
  "/users",
  "/profile",
] as const;

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function hasAuthCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.cookies.get(CLIENT_AUTH_COOKIE_NAME)?.value,
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasAuthCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/interviews",
    "/interviews/:path*",
    "/users",
    "/users/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
