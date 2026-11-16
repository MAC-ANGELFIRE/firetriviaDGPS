import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { games } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc, eq } from "drizzle-orm";
import { avatarSrc } from "@/lib/game";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  await ensureSeeded();
  const rows = await db.select().from(games).where(eq(games.finished, true)).orderBy(desc(games.createdAt)).limit(100);

  // Mejores puntajes individuales
  const best = rows
    .flatMap((g) => g.players.map((p) => ({ ...p, difficulty: g.difficulty, date: g.createdAt })))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Campeones acumulados (victorias)
  const wins = new Map<string, { name: string; avatar: string; wins: number }>();
  for (const g of rows) {
    if (!g.winner) continue;
    const p = g.players.find((x) => x.name === g.winner);
    const k = g.winner.toLowerCase();
    const cur = wins.get(k) ?? { name: g.winner, avatar: p?.avatar ?? "manzana", wins: 0 };
    cur.wins++;
    wins.set(k, cur);
  }
  const champions = [...wins.values()].sort((a, b) => b.wins - a.wins).slice(0, 10);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-8">
      <div className="flex items-center justify-between pb-6">
        <Link href="/" className="text-sm text-emerald-200/80 hover:text-emerald-200">← Menú</Link>
        <h1 className="neon-text text-3xl font-black">🏆 Ranking</h1>
        <Link href="/jugar" className="btn-ghost !py-2 !px-4 text-sm">Jugar</Link>
      </div>

      {rows.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-2xl font-bold text-white">Todavía no hay partidas</p>
          <p className="mt-2 text-emerald-200/70">¡Sé el primero en demostrar cuánto sabés de vida saludable!</p>
          <Link href="/jugar" className="btn-neon mt-6">▶ Jugar ahora</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="glass rounded-3xl p-5">
            <h2 className="mb-4 text-xs uppercase tracking-[0.3em] text-emerald-300">Mejores puntajes</h2>
            {best.map((p, i) => (
              <div key={i} className="flex items-center justify-between border-b border-emerald-400/10 py-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-lg font-black text-emerald-300">{i + 1}</span>
                  <Image src={avatarSrc(p.avatar)} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-[11px] uppercase tracking-wider text-emerald-200/60">{p.difficulty} · {p.correct} aciertos</p>
                  </div>
                </div>
                <span className="neon-text text-xl font-black">{p.score}</span>
              </div>
            ))}
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="mb-4 text-xs uppercase tracking-[0.3em] text-emerald-300">Campeones (victorias)</h2>
            {champions.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between border-b border-emerald-400/10 py-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
                  <Image src={avatarSrc(c.avatar)} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                  <p className="font-bold text-white">{c.name}</p>
                </div>
                <span className="font-black text-white">{c.wins} {c.wins === 1 ? "victoria" : "victorias"}</span>
              </div>
            ))}

            <h2 className="mb-3 mt-8 text-xs uppercase tracking-[0.3em] text-emerald-300">Últimas partidas</h2>
            <div className="space-y-2 text-sm">
              {rows.slice(0, 8).map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2">
                  <span className="text-emerald-100">
                    👑 <b>{g.winner}</b> <span className="text-emerald-200/60">· {g.players.length} jugadores · {g.difficulty}</span>
                  </span>
                  <span className="text-xs text-emerald-200/50">{new Date(g.createdAt).toLocaleDateString("es-PY")}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
