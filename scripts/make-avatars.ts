/* Genera personajes de frutas y verduras (SVG) y los rasteriza a PNG 512px en public/avatars.
 * Uso: npx tsx scripts/make-avatars.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "avatars");

type Char = { id: string; body: string; shade: string; accent: string; shape: string; extra?: string; cy?: number };

// Cara común: ojos con brillo, mejillas y sonrisa
function face(cx: number, cy: number, dark = "#1b1b1b") {
  return `
  <g>
    <ellipse cx="${cx - 62}" cy="${cy - 18}" rx="30" ry="34" fill="#fff"/>
    <ellipse cx="${cx + 62}" cy="${cy - 18}" rx="30" ry="34" fill="#fff"/>
    <circle cx="${cx - 58}" cy="${cy - 14}" r="15" fill="${dark}"/>
    <circle cx="${cx + 66}" cy="${cy - 14}" r="15" fill="${dark}"/>
    <circle cx="${cx - 52}" cy="${cy - 22}" r="5" fill="#fff"/>
    <circle cx="${cx + 72}" cy="${cy - 22}" r="5" fill="#fff"/>
    <ellipse cx="${cx - 110}" cy="${cy + 32}" rx="24" ry="16" fill="#ff5c8a" opacity=".55"/>
    <ellipse cx="${cx + 110}" cy="${cy + 32}" rx="24" ry="16" fill="#ff5c8a" opacity=".55"/>
    <path d="M${cx - 48} ${cy + 36} Q${cx} ${cy + 92} ${cx + 48} ${cy + 36} Z" fill="${dark}" stroke="${dark}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M${cx - 30} ${cy + 52} Q${cx} ${cy + 72} ${cx + 30} ${cy + 52} Q${cx} ${cy + 60} ${cx - 30} ${cy + 52} Z" fill="#ff6b8b"/>
  </g>`;
}

function svg(c: Char) {
  const cy = c.cy ?? 262;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#0d2a18"/><stop offset="100%" stop-color="#030806"/>
    </radialGradient>
    <radialGradient id="b" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset="30%" stop-color="${c.body}"/>
      <stop offset="100%" stop-color="${c.shade}"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="72" fill="url(#bg)"/>
  <rect x="6" y="6" width="500" height="500" rx="66" fill="none" stroke="#39ff14" stroke-width="6" opacity=".85"/>
  <ellipse cx="256" cy="452" rx="150" ry="18" fill="#39ff14" opacity=".18"/>
  ${c.extra ?? ""}
  ${c.shape.replace("FILL", "url(#b)")}
  ${face(256, cy)}
</svg>`;
}

const chars: Char[] = [
  {
    id: "limon", body: "#fff27a", shade: "#c9b200", accent: "#3fbf2a",
    shape: `<path d="M256 110 C 370 110 420 190 410 280 C 400 380 330 420 256 420 C 182 420 112 380 102 280 C 92 190 142 110 256 110 Z" fill="FILL"/>
    <path d="M96 258 Q 80 262 92 276 Q 100 268 100 262 Z" fill="#c9b200"/>
    <path d="M416 258 Q 432 262 420 276 Q 412 268 412 262 Z" fill="#c9b200"/>`,
    extra: `<path d="M262 118 Q 300 60 360 70 Q 330 118 262 118 Z" fill="#3fbf2a"/>`,
  },
  {
    id: "sandia", body: "#ff4d6d", shade: "#a3112d", accent: "#2e9e3a",
    shape: `<path d="M70 230 A186 186 0 0 0 442 230 Z" fill="#2e9e3a"/>
    <path d="M90 230 A166 166 0 0 0 422 230 Z" fill="#ff4d6d"/>
    <path d="M70 230 A186 186 0 0 0 442 230" fill="none" stroke="#1b6b28" stroke-width="14"/>`,
    cy: 290,
    extra: `<g fill="#1b1b1b"><ellipse cx="150" cy="330" rx="7" ry="13" transform="rotate(-20 150 330)"/><ellipse cx="362" cy="330" rx="7" ry="13" transform="rotate(20 362 330)"/><ellipse cx="256" cy="400" rx="7" ry="13"/></g>`,
  },
  {
    id: "uva", body: "#9b5de5", shade: "#4b1f8c", accent: "#3fbf2a",
    shape: `<g fill="FILL">
      <circle cx="210" cy="240" r="62"/><circle cx="302" cy="240" r="62"/>
      <circle cx="256" cy="300" r="62"/><circle cx="170" cy="330" r="50"/>
      <circle cx="342" cy="330" r="50"/><circle cx="256" cy="370" r="52"/>
      <circle cx="210" cy="410" r="40"/><circle cx="302" cy="410" r="40"/></g>`,
    cy: 290,
    extra: `<path d="M256 170 Q 250 120 300 105 Q 320 150 256 170 Z" fill="#3fbf2a"/><path d="M256 170 Q 220 130 170 150" stroke="#3fbf2a" stroke-width="12" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: "morron", body: "#ff3b30", shade: "#8e0d08", accent: "#2e9e3a",
    shape: `<path d="M256 150 C 330 140 400 170 410 260 C 420 350 380 420 320 430 C 290 440 275 420 256 420 C 237 420 222 440 192 430 C 132 420 92 350 102 260 C 112 170 182 140 256 150 Z" fill="FILL"/>`,
    cy: 290,
    extra: `<path d="M236 160 Q 250 110 300 118 Q 282 150 262 166 Z" fill="#2e9e3a"/><path d="M256 150 L 256 100" stroke="#1b6b28" stroke-width="16" stroke-linecap="round"/>`,
  },
  {
    id: "pina", body: "#ffd23f", shade: "#b07d00", accent: "#2e9e3a",
    shape: `<ellipse cx="256" cy="310" rx="150" ry="150" fill="FILL"/>
    <g stroke="#b07d00" stroke-width="5" opacity=".55" fill="none">
      <path d="M140 230 L 240 330 M180 200 L 280 300 M220 180 L 330 290 M130 290 L 230 390 M160 350 L 240 430"/>
      <path d="M372 230 L 272 330 M332 200 L 232 300 M292 180 L 182 290 M382 290 L 282 390 M352 350 L 272 430"/>
    </g>`,
    cy: 320,
    extra: `<g fill="#2e9e3a"><path d="M256 170 L 226 40 L 256 150 Z"/><path d="M256 170 L 296 30 L 270 150 Z"/><path d="M256 170 L 180 60 L 240 160 Z"/><path d="M256 170 L 340 70 L 280 165 Z"/><path d="M256 170 L 310 90 L 290 165 Z"/></g>`,
  },
  {
    id: "palta", body: "#3d8b37", shade: "#1d4d1a", accent: "#6b3f1d",
    shape: `<path d="M256 90 C 340 90 380 180 380 280 C 380 380 320 440 256 440 C 192 440 132 380 132 280 C 132 180 172 90 256 90 Z" fill="FILL"/>
    <ellipse cx="256" cy="330" rx="130" ry="115" fill="#e9f7a0" opacity=".9"/>`,
    cy: 260,
    extra: `<ellipse cx="256" cy="350" rx="58" ry="58" fill="#6b3f1d"/><ellipse cx="240" cy="330" rx="14" ry="10" fill="#fff" opacity=".5"/>`,
  },
  {
    id: "cebolla", body: "#c77dff", shade: "#5a1e8c", accent: "#3fbf2a",
    shape: `<path d="M256 150 C 350 150 400 230 390 320 C 380 400 320 440 256 440 C 192 440 132 400 122 320 C 112 230 162 150 256 150 Z" fill="FILL"/>
    <path d="M256 150 C 300 210 310 260 300 300" stroke="#ffffff" stroke-opacity=".35" stroke-width="10" fill="none"/>`,
    cy: 300,
    extra: `<path d="M256 160 Q 230 110 190 100 Q 230 130 246 166 Z" fill="#3fbf2a"/><path d="M256 160 Q 270 100 320 96 Q 290 130 264 166 Z" fill="#3fbf2a"/><path d="M256 160 Q 256 90 256 70 Q 262 120 262 164 Z" fill="#2e9e3a"/>`,
  },
  {
    id: "mango", body: "#ffb703", shade: "#c46a00", accent: "#2e9e3a",
    shape: `<path d="M256 120 C 350 110 410 190 400 290 C 392 380 330 440 256 440 C 180 440 116 380 110 290 C 104 190 162 120 256 120 Z" fill="FILL"/>
    <path d="M300 150 C 370 170 390 230 380 280 C 370 220 340 180 300 150 Z" fill="#ff6b35" opacity=".65"/>`,
    cy: 300,
    extra: `<path d="M262 130 Q 300 60 370 70 Q 330 130 262 130 Z" fill="#2e9e3a"/><path d="M262 130 L 268 104" stroke="#1b6b28" stroke-width="10" stroke-linecap="round"/>`,
  },
];

fs.mkdirSync(outDir, { recursive: true });
async function main() {
  for (const c of chars) {
    const pngPath = path.join(outDir, `${c.id}.png`);
    await sharp(Buffer.from(svg(c)), { density: 192 })
      .resize(512, 512)
      .png({ compressionLevel: 9 })
      .toFile(pngPath);
  }
  console.log(`Personajes PNG creados: ${chars.length}`);
}
main();
