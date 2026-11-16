import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const allowed = ["category", "difficulty", "text", "optionA", "optionB", "optionC", "correct", "explanation", "active"] as const;
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  const [row] = await db.update(questions).set(patch).where(eq(questions.id, Number(id))).returning();
  if (!row) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(questions).where(eq(questions.id, Number(id)));
  return NextResponse.json({ ok: true });
}
