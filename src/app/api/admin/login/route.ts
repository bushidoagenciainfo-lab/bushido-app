import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COOKIE = "bushido_admin";

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const token = process.env.ADMIN_SESSION_TOKEN;
  if (!password || !token) {
    return NextResponse.json(
      { ok: false, error: "Panel sin configurar (falta ADMIN_PASSWORD / ADMIN_SESSION_TOKEN)." },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  if (!body.password || body.password !== password) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  return res;
}
