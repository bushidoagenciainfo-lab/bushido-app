import { NextResponse, type NextRequest } from "next/server";

// Protege el panel admin (Next 16 usa "proxy", antes "middleware").
// La cookie `bushido_admin` vale el ADMIN_SESSION_TOKEN cuando el login fue
// correcto (ver /api/admin/login). Comparación directa, compatible con edge.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const COOKIE = "bushido_admin";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // login y logout deben ser accesibles sin sesión
  if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_SESSION_TOKEN;
  const cookie = req.cookies.get(COOKIE)?.value;
  const ok = Boolean(token) && cookie === token;

  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
