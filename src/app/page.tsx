import Link from "next/link";
import Image from "next/image";
import { AVATARS } from "@/lib/game";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#39ff14]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#00ffa3]/10 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
                    <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300/70">MSPBS · Paraguay</p>
            <p className="text-sm font-bold text-emerald-100">Dirección General de Promoción de la Salud</p>
          </div>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href="/ranking" className="btn-ghost !py-2 !px-4">🏆 Ranking</Link>
          <Link href="/admin" className="btn-ghost !py-2 !px-4">⚙️ Admin</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 md:grid-cols-2">
        <div className="slide-in">
          <p className="mb-3 inline-block rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            Trivia de salud · 2 a 10 jugadores
          </p>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#39ff14]" style={{ textShadow: "0 0 6px #39ff14" }}>
            <span className="rounded border border-dashed border-[#39ff14]/60 bg-[#39ff14]/5 px-2 py-1">
              :::POWERED BY ANGELFIRE (Angel D. B. Palma):::
            </span>
          </p>
          <h1 className="text-5xl font-black leading-[1.05] md:text-7xl">
            <span className="neon-text">Salud</span>
            <span className="text-white">Ados</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-emerald-100/80">
            ¡El juego de preguntas donde ganan los que más saben cuidarse! Alimentación, descanso,
            salud mental, prevención y Municipios Saludables. <b className="text-emerald-300">El mejor de 10 gana.</b>
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/jugar" className="btn-neon pulse text-lg">▶ Jugar ahora</Link>
            <Link href="/ranking" className="btn-ghost">Ver campeones</Link>
            <a href="/SaludAdos.html" className="btn-ghost">🌐 Jugar en el navegador (PC / Tablet)</a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 text-center">
            {[
              ["+1000", "preguntas"],
              ["16 s", "por pregunta"],
              ["3", "niveles"],
            ].map(([n, l]) => (
              <div key={l} className="glass rounded-2xl p-3">
                <p className="neon-text text-2xl font-black">{n}</p>
                <p className="text-xs uppercase tracking-wider text-emerald-200/70">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="glass scanline relative rounded-3xl p-6">
            <p className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-emerald-300/80">Elegí tu personaje</p>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((a, i) => (
                <div key={a.id} className="avatar-card float" style={{ animationDelay: `${i * 0.25}s` }}>
                  <Image src={a.src} alt={a.name} width={200} height={200} className="aspect-square w-full object-cover" />
                  <p className="py-1 text-center text-xs font-bold text-emerald-200">{a.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-emerald-100/80 sm:grid-cols-3">
              {["🥗 Alimentación", "🏃 Actividad física", "🧠 Salud mental", "😴 Descanso", "🏘️ Municipio Saludable", "🛡️ Prevención"].map((c) => (
                <span key={c} className="rounded-lg border border-emerald-400/20 bg-black/30 px-2 py-1 text-center">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <p className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-emerald-200/50">
        Vida saludable para todos
      </p>
    </main>
  );
}
