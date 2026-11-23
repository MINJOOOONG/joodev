import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API
  if (pathname === "/admin/login" || pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // Protect all /admin and /api/posts, /api/upload routes
  const isProtected =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/api/posts") && request.method !== "GET") ||
    pathname.startsWith("/api/upload");

  if (!isProtected) {
    return NextResponse.next();
  }

  if (await isAdminRequest(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/posts/:path*", "/api/upload/:path*"],
};
