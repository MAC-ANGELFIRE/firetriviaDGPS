import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  return NextResponse.json(row);
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await ensureSeeded();
  const b = await req.json();
  const clamp = (v: unknown, min: number, max: number, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : d;
  };
  const patch = {
    defaultDifficulty: ["principiante", "medio", "avanzado"].includes(b.defaultDifficulty) ? b.defaultDifficulty : "principiante",
    secondsPerQuestion: clamp(b.secondsPerQuestion, 5, 60, 16),
    secondsPerPlayer: clamp(b.secondsPerPlayer, 30, 600, 120),
    questionsPerTurn: clamp(b.questionsPerTurn, 3, 30, 10),
    allowDifficultyChoice: Boolean(b.allowDifficultyChoice),
    updatedAt: new Date(),
  };
  const [row] = await db.update(settings).set(patch).where(eq(settings.id, 1)).returning();
  return NextResponse.json(row);
}
