import { db } from "@/db";
import { questions, settings } from "@/db/schema";
import { allRows } from "@/data/bank";
import { sql } from "drizzle-orm";

let seeding: Promise<void> | null = null;

/** Garantiza que existan configuración y el banco inicial de preguntas (idempotente). */
export async function ensureSeeded() {
  if (seeding) return seeding;
  seeding = (async () => {
    await db
      .insert(settings)
      .values({ id: 1 })
      .onConflictDoNothing();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions);
    if (Number(count) === 0) {
      const chunk = 200;
      for (let i = 0; i < allRows.length; i += chunk) {
        await db.insert(questions).values(allRows.slice(i, i + chunk));
      }
      console.log(`Seed: ${allRows.length} preguntas insertadas`);
    }
  })().finally(() => {
    seeding = null;
  });
  return seeding;
}
