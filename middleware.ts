import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("hawkeye_token")?.value;
  const role = request.cookies.get("hawkeye_role")?.value;

  const isAuth = Boolean(token);
  const isAdmin = role === "admin";

  // 1. Admin route protection (/admin and subpaths)
  if (pathname.startsWith("/admin")) {
    if (!isAuth) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Authenticated user trying to access admin dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Customer authenticated routes (/orders, /profile)
  // Note: /cart is protected client-side via ProtectedRoute to ensure seamless
  // transitions from 'Buy Now' and support localStorage auth state.
  if (
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile")
  ) {
    if (!isAuth) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guest-only routes (/login, /register)
  if (pathname === "/login" || pathname === "/register") {
    if (isAuth) {
      const redirectUrl = isAdmin ? "/admin" : "/";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};

