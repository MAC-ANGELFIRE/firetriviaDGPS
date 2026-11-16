import { bank1, type Raw } from "./bank1";
import { bank2 } from "./bank2";
import { generated } from "./generated";
import { bank3 } from "./bank3";
import { bank4 } from "./bank4";
import type { NewQuestion } from "@/db/schema";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Convierte el formato compacto en filas de la tabla, barajando la posición de la respuesta correcta. */
export function toRows(raw: Raw[]): NewQuestion[] {
  const seen = new Set<string>();
  const rows: NewQuestion[] = [];
  for (const [difficulty, category, text, ok, w1, w2, explanation] of raw) {
    const key = `${text.toLowerCase().trim()}::${ok.toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pos = hash(text) % 3;
    const opts = [w1, w2];
    opts.splice(pos, 0, ok);
    rows.push({
      difficulty,
      category,
      text,
      optionA: opts[0],
      optionB: opts[1],
      optionC: opts[2],
      correct: ["A", "B", "C"][pos],
      explanation: explanation ?? null,
      active: true,
    });
  }
  return rows;
}

export const allRaw: Raw[] = [...bank1, ...bank2, ...generated, ...bank3, ...bank4];
export const allRows = toRows(allRaw);
