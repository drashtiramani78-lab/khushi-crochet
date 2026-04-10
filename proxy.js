import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("admin_auth")?.value;

  // Protect /admin-login (redirect if already auth'd) and /admin/* routes
  const isAdminAuth = adminToken === 'true';
  
  if (pathname === '/admin-login' && isAdminAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }
  
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin-login");

  // Only protect real admin API namespace: /api/admin/*
  // (do NOT block /api/admin-login or /api/admin-logout)
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (isAdminPage || isAdminApi) {
    if (!isAdminAuth) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
