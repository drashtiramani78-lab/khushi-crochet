import { NextResponse } from "next/server";

export function proxy(request) {
  const isLoggedIn = request.cookies.get("admin_auth")?.value === "true";

  const { pathname } = request.nextUrl;

  // protect admin pages & API
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    !isLoggedIn
  ) {
    // if API → return JSON
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // if page → redirect
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};