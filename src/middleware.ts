import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export default NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/generate") || pathname.startsWith("/history") || pathname.startsWith("/saved") || pathname.startsWith("/settings");
  const isAdmin = pathname.startsWith("/admin");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if ((isDashboard || isAdmin) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdmin && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/history/:path*",
    "/saved/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
