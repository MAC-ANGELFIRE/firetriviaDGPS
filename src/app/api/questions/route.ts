import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { and, eq, sql, desc, ilike, or } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const LEVELS = ["principiante", "medio", "avanzado"];

/** GET /api/questions?mode=play&difficulty=medio&count=40  |  mode=admin&page=1&q=texto&difficulty=... */
export async function GET(req: Request) {
  await ensureSeeded();
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "play";

  if (mode === "admin" && !isAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const difficulty = url.searchParams.get("difficulty");

  if (mode === "play") {
    const count = Math.min(Number(url.searchParams.get("count") ?? 40), 200);
    const conds = [eq(questions.active, true)];
    if (difficulty && LEVELS.includes(difficulty)) conds.push(eq(questions.difficulty, difficulty));
    const rows = await db
      .select()
      .from(questions)
      .where(and(...conds))
      .orderBy(sql`random()`)
      .limit(count);
    return NextResponse.json(rows);
  }

  // admin listing
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const q = url.searchParams.get("q")?.trim();
  const pageSize = 25;
  const conds = [];
  if (difficulty && LEVELS.includes(difficulty)) conds.push(eq(questions.difficulty, difficulty));
  if (q) conds.push(or(ilike(questions.text, `%${q}%`), ilike(questions.category, `%${q}%`)));
  const where = conds.length ? and(...conds) : undefined;
  const [rows, [{ total }], stats] = await Promise.all([
    db.select().from(questions).where(where).orderBy(desc(questions.id)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: sql<number>`count(*)::int` }).from(questions).where(where),
    db
      .select({ difficulty: questions.difficulty, n: sql<number>`count(*)::int` })
      .from(questions)
      .groupBy(questions.difficulty),
  ]);
  return NextResponse.json({ rows, total, page, pageSize, stats });
}

type Incoming = {
  category?: string;
  difficulty?: string;
  text?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  correct?: string;
  explanation?: string | null;
};

function validate(i: Incoming) {
  if (!i.text || !i.optionA || !i.optionB || !i.optionC) return "Faltan campos obligatorios";
  if (!["A", "B", "C"].includes(i.correct ?? "")) return "La respuesta correcta debe ser A, B o C";
  if (!LEVELS.includes(i.difficulty ?? "")) return "Dificultad inválida";
  return null;
}

/** POST: una pregunta {..} o varias { items: [...] } */
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await ensureSeeded();
  const body = await req.json();
  const items: Incoming[] = Array.isArray(body?.items) ? body.items : [body];
  const rows = [];
  for (const i of items) {
    const err = validate(i);
    if (err) return NextResponse.json({ error: `${err}: "${(i.text ?? "").slice(0, 40)}"` }, { status: 400 });
    rows.push({
      category: (i.category || "General").trim(),
      difficulty: i.difficulty!,
      text: i.text!.trim(),
      optionA: i.optionA!.trim(),
      optionB: i.optionB!.trim(),
      optionC: i.optionC!.trim(),
      correct: i.correct!,
      explanation: i.explanation?.trim() || null,
    });
  }
  const inserted = await db.insert(questions).values(rows).returning();
  return NextResponse.json({ inserted: inserted.length, rows: inserted });
}
