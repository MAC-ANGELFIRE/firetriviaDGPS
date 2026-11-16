import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "saludados_admin";

/** Contraseña del panel: se puede sobrescribir con la variable ADMIN_PASSWORD. */
export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "Fire,987";
}

/** Token que se guarda en la cookie; cambia si cambia la contraseña. */
export function adminToken() {
  return createHash("sha256").update(`saludados::${adminPassword()}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = createHash("sha256").update(a).digest();
  const bb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ba, bb);
}

/** Lee la cookie de la petición y verifica si la sesión de administrador es válida. */
export function isAdmin(req: Request) {
  const raw = req.headers.get("cookie") ?? "";
  const found = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!found) return false;
  const value = decodeURIComponent(found.slice(ADMIN_COOKIE.length + 1));
  return safeEqual(value, adminToken());
}
