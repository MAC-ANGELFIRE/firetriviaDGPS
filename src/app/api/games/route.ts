import { NextResponse } from "next/server";
import { db } from "@/db";
import { games } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** GET: últimas partidas finalizadas (ranking / historial) */
export async function GET() {
  await ensureSeeded();
  const rows = await db.select().from(games).where(eq(games.finished, true)).orderBy(desc(games.createdAt)).limit(50);
  return NextResponse.json(rows);
}

/** POST: guarda una partida finalizada */
export async function POST(req: Request) {
  await ensureSeeded();
  const b = await req.json();
  if (!Array.isArray(b.players) || b.players.length < 1) {
    return NextResponse.json({ error: "Jugadores inválidos" }, { status: 400 });
  }
  const players = b.players.map((p: Record<string, unknown>) => ({
    name: String(p.name ?? "Jugador").slice(0, 30),
    avatar: String(p.avatar ?? "manzana"),
    score: Number(p.score ?? 0),
    correct: Number(p.correct ?? 0),
    timeMs: Number(p.timeMs ?? 0),
  }));
  const [row] = await db
    .insert(games)
    .values({
      difficulty: String(b.difficulty ?? "principiante"),
      players,
      winner: b.winner ? String(b.winner) : null,
      finished: true,
    })
    .returning();
  return NextResponse.json(row);
}
