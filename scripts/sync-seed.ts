/* Agrega a la base de datos las preguntas del banco que todavía no existan (no borra ni duplica).
 * Uso: npx tsx scripts/sync-seed.ts
 * Sirve para incorporar nuevos lotes de preguntas sin perder las que el administrador agregó.
 */
import "dotenv/config";
import { db } from "../src/db";
import { questions } from "../src/db/schema";
import { allRows } from "../src/data/bank";
import { sql } from "drizzle-orm";

async function main() {
  const existing = await db.select({ text: questions.text, correct: questions.correct, a: questions.optionA, b: questions.optionB, c: questions.optionC }).from(questions);
  const k = (t: string, c: string, a: string, b: string, o: string) => [t.toLowerCase().trim(), c, a, b, o].join("::");
  const keys = new Set(existing.map((r) => k(r.text, r.correct, r.a, r.b, r.c)));
  const missing = allRows.filter((r) => !keys.has(k(r.text, r.correct, r.optionA, r.optionB, r.optionC)));
  for (let i = 0; i < missing.length; i += 200) {
    await db.insert(questions).values(missing.slice(i, i + 200));
  }
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(questions);
  console.log(`Nuevas insertadas: ${missing.length} · Total en base: ${total}`);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
