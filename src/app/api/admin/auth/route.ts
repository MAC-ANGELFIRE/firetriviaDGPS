import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, adminToken, isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** GET: indica si ya hay una sesión de administrador válida. */
export async function GET(req: Request) {
  return NextResponse.json({ ok: isAdmin(req) });
}

/** POST: valida la contraseña y crea la cookie de sesión. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password ?? "");
  if (password !== adminPassword()) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}

/** DELETE: cierra la sesión de administrador. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
