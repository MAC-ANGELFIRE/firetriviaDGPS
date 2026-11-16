/* Genera SaludAdos como UN SOLO archivo HTML (sin .exe, sin carpetas externas).
 * Uso: npx tsx scripts/build-offline.ts
 * Salida:
 *   public/SaludAdos.html        -> archivo único para subir a cualquier hosting o abrir en el navegador
 *   public/offline/index.html    -> misma versión (ruta /offline/index.html)
 *   public/offline/manifest.webmanifest (para instalarla como app en tablets/PC desde Chrome/Edge)
 * Los personajes y las 951 preguntas van incrustados dentro del HTML.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { allRows } from "../src/data/bank";

const root = process.cwd();
const avatarIds = ["nena", "varon", "manzana", "zanahoria", "brocoli", "frutilla", "banana", "tomate", "limon", "sandia", "uva", "morron", "pina", "palta", "cebolla", "mango"];

// 1) Preguntas
const seed = allRows.map((r) => ({
  category: r.category,
  difficulty: r.difficulty,
  text: r.text,
  optionA: r.optionA,
  optionB: r.optionB,
  optionC: r.optionC,
  correct: r.correct,
  explanation: r.explanation ?? null,
}));
const safeJson = (v: unknown) =>
  JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

// 2) Personajes en base64 (reducidos a 320px para que el archivo sea liviano)
const avatars: Record<string, string> = {};
for (const id of avatarIds) {
  const src = path.join(root, "public", "avatars", `${id}.png`);
  let buf: Buffer;
  try {
    buf = execFileSync("convert", [src, "-resize", "320x320", "-strip", "-quality", "85", "JPEG:-"], {
      maxBuffer: 50 * 1024 * 1024,
    });
    avatars[id] = `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    buf = fs.readFileSync(src);
    avatars[id] = `data:image/png;base64,${buf.toString("base64")}`;
  }
}

// 3) Plantilla -> HTML final
const template = fs.readFileSync(path.join(root, "scripts", "offline-template.html"), "utf8");
const html = template
  .replace("__QUESTIONS__", () => safeJson(seed))
  .replace("__AVATARS__", () => safeJson(avatars));

const outDir = path.join(root, "public", "offline");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(root, "public", "SaludAdos.html"), html, "utf8");
fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

// 4) Manifest (instalable como app desde el navegador). Icono embebido como data URI.
const manifest = {
  name: "SaludAdos · POWERED BY ANGELFIRE (Angel D. B. Palma)",
  short_name: "SaludAdos",
  description: "Trivia de promoción de la salud · Todos los derechos reservados",
  start_url: "./index.html",
  scope: "./",
  display: "standalone",
  background_color: "#050a08",
  theme_color: "#050a08",
  icons: [{ src: avatars["manzana"], sizes: "320x320", type: "image/jpeg" }],
};
fs.writeFileSync(path.join(outDir, "manifest.webmanifest"), JSON.stringify(manifest), "utf8");

console.log(
  `Offline OK: ${seed.length} preguntas · ${avatarIds.length} personajes · ${(html.length / 1024).toFixed(0)} KB -> public/SaludAdos.html`
);
