import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register");

  // Redirect authenticated users away from auth pages
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return null;
  }

  // Protect user-specific routes
  if (request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/orders") ||
      request.nextUrl.pathname.startsWith("/checkout")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect admin/owner routes
  if (request.nextUrl.pathname.startsWith("/admin") || 
      request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user is admin or owner (case-insensitive)
    const userRole = (token?.role as string)?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return null;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
}; 