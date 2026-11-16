"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Question, Settings } from "@/db/schema";
import { LEVELS, CATEGORY_ICON } from "@/lib/game";

type Tab = "config" | "nueva" | "importar" | "banco";

const emptyForm = {
  category: "Alimentación",
  difficulty: "principiante",
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  correct: "A",
  explanation: "",
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("config");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [bulk, setBulk] = useState("");
  const [list, setList] = useState<{ rows: Question[]; total: number; page: number; pageSize: number; stats: { difficulty: string; n: number }[] } | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filterLvl, setFilterLvl] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pass, setPass] = useState("");
  const [authError, setAuthError] = useState("");

  const flash = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 4000);
  };

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.ok)))
      .catch(() => setAuthed(false));
  }, []);

  async function login() {
    setAuthError("");
    const r = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    if (r.ok) {
      setAuthed(true);
      setPass("");
    } else {
      setAuthError("Contraseña incorrecta");
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
    setPass("");
  }

  useEffect(() => {
    if (authed) fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, [authed]);

  const loadList = useCallback(async () => {
    const r = await fetch(`/api/questions?mode=admin&page=${page}&q=${encodeURIComponent(q)}&difficulty=${filterLvl}`);
    setList(await r.json());
  }, [page, q, filterLvl]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  async function saveSettings() {
    if (!settings) return;
    const r = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    if (r.ok) {
      setSettings(await r.json());
      flash(true, "Configuración guardada ✔");
    } else flash(false, "Error al guardar");
  }

  async function createQuestion() {
    const r = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    if (r.ok) {
      flash(true, "Pregunta agregada ✔");
      setForm({ ...emptyForm, category: form.category, difficulty: form.difficulty });
      loadList();
    } else flash(false, d.error ?? "Error");
  }

  async function importBulk() {
    // Soporta JSON (array) o líneas separadas por | : nivel|categoría|pregunta|correcta|incorrecta1|incorrecta2|explicación
    let items: unknown[] = [];
    const t = bulk.trim();
    if (!t) return;
    try {
      if (t.startsWith("[")) {
        items = JSON.parse(t);
      } else {
        items = t
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const [difficulty, category, text, ok, w1, w2, explanation] = l.split("|").map((s) => s.trim());
            const pos = Math.floor(Math.random() * 3);
            const opts = [w1, w2];
            opts.splice(pos, 0, ok);
            return { difficulty, category, text, optionA: opts[0], optionB: opts[1], optionC: opts[2], correct: "ABC"[pos], explanation };
          });
      }
    } catch {
      flash(false, "Formato inválido");
      return;
    }
    const r = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    const d = await r.json();
    if (r.ok) {
      flash(true, `${d.inserted} preguntas importadas ✔`);
      setBulk("");
      loadList();
    } else flash(false, d.error ?? "Error");
  }

  async function toggleActive(qu: Question) {
    await fetch(`/api/questions/${qu.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !qu.active }) });
    loadList();
  }
  async function remove(id: number) {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    loadList();
  }

  const total = list?.stats.reduce((a, b) => a + b.n, 0) ?? 0;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-8">
      <div className="flex items-center justify-between pb-6">
        <Link href="/" className="text-sm text-emerald-200/80 hover:text-emerald-200">← Menú</Link>
        <h1 className="neon-text text-3xl font-black">⚙️ Panel de Administración</h1>
        <span className="text-xs text-emerald-200/60">DGPS · MSPBS</span>
      </div>

      {/* Pantalla de acceso con contraseña */}
      {authed === false && (
        <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center slide-in">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[#39ff14]/50 bg-black/40 text-3xl">🔒</div>
          <h2 className="text-2xl font-black text-white">Acceso restringido</h2>
          <p className="mt-1 text-sm text-emerald-200/70">Ingresá la contraseña de administrador para continuar.</p>
          <input
            className="input mt-6 text-center"
            type="password"
            placeholder="Contraseña"
            value={pass}
            autoFocus
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          {authError && <p className="mt-2 text-sm font-bold text-red-300">{authError}</p>}
          <button className="btn-neon mt-5 w-full" onClick={login} disabled={!pass}>
            Entrar
          </button>
          <Link href="/" className="btn-ghost mt-3 w-full">← Volver al menú</Link>
        </div>
      )}

      {authed === null && <p className="pt-16 text-center text-emerald-200/70">Verificando acceso…</p>}

      {/* Contenido protegido */}
      {authed === true && (
      <>
      <button className="btn-ghost !px-3 !py-1 mb-4 text-xs" onClick={logout}>
        🔒 Cerrar sesión
      </button>

      {/* Estadísticas */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Total preguntas" value={total} />
        {LEVELS.map((l) => (
          <Card key={l.id} label={`${l.emoji} ${l.label}`} value={list?.stats.find((s) => s.difficulty === l.id)?.n ?? 0} />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["config", "🎛️ Configuración"],
            ["nueva", "➕ Nueva pregunta"],
            ["importar", "📥 Importar masivo"],
            ["banco", "📚 Banco de preguntas"],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === t ? "bg-[#39ff14] text-black" : "border border-emerald-400/30 text-emerald-200 hover:border-emerald-400"}`}>
            {l}
          </button>
        ))}
      </div>

      {msg && <div className={`mb-4 rounded-xl border p-3 text-sm font-bold ${msg.ok ? "border-[#39ff14]/50 bg-[#39ff14]/10 text-emerald-200" : "border-red-500/50 bg-red-500/10 text-red-200"}`}>{msg.text}</div>}

      {tab === "config" && settings && (
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Reglas del juego</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nivel por defecto">
              <select className="input" value={settings.defaultDifficulty} onChange={(e) => setSettings({ ...settings, defaultDifficulty: e.target.value })}>
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="¿Los jugadores pueden elegir el nivel?">
              <select className="input" value={settings.allowDifficultyChoice ? "1" : "0"} onChange={(e) => setSettings({ ...settings, allowDifficultyChoice: e.target.value === "1" })}>
                <option value="1">Sí, pueden elegir</option>
                <option value="0">No, usar el nivel por defecto</option>
              </select>
            </Field>
            <Field label="Segundos por pregunta (5-60)">
              <input type="number" className="input" min={5} max={60} value={settings.secondsPerQuestion} onChange={(e) => setSettings({ ...settings, secondsPerQuestion: Number(e.target.value) })} />
            </Field>
            <Field label="Segundos por turno de jugador (30-600)">
              <input type="number" className="input" min={30} max={600} value={settings.secondsPerPlayer} onChange={(e) => setSettings({ ...settings, secondsPerPlayer: Number(e.target.value) })} />
            </Field>
            <Field label="Preguntas por turno (3-30)">
              <input type="number" className="input" min={3} max={30} value={settings.questionsPerTurn} onChange={(e) => setSettings({ ...settings, questionsPerTurn: Number(e.target.value) })} />
            </Field>
          </div>
          <button className="btn-neon mt-6" onClick={saveSettings}>💾 Guardar configuración</button>
        </div>
      )}

      {tab === "nueva" && (
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Agregar una pregunta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Categoría">
              <input className="input" list="cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <datalist id="cats">{Object.keys(CATEGORY_ICON).map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Nivel">
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Pregunta">
                <textarea className="input" rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </Field>
            </div>
            {(["A", "B", "C"] as const).map((k) => (
              <Field key={k} label={`Opción ${k}`}>
                <input className="input" value={form[`option${k}`]} onChange={(e) => setForm({ ...form, [`option${k}`]: e.target.value })} />
              </Field>
            ))}
            <Field label="Respuesta correcta">
              <select className="input" value={form.correct} onChange={(e) => setForm({ ...form, correct: e.target.value })}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Explicación (opcional, se muestra tras responder)">
                <input className="input" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
              </Field>
            </div>
          </div>
          <button className="btn-neon mt-6" onClick={createQuestion} disabled={!form.text || !form.optionA || !form.optionB || !form.optionC}>➕ Guardar pregunta</button>
        </div>
      )}

      {tab === "importar" && (
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-2 text-xl font-bold text-white">Importación masiva</h2>
          <p className="mb-4 text-sm text-emerald-200/70">
            Pegá una pregunta por línea con el formato: <code className="rounded bg-black/40 px-1 text-emerald-300">nivel | categoría | pregunta | correcta | incorrecta 1 | incorrecta 2 | explicación</code>
            <br />Niveles: principiante, medio, avanzado. También se acepta un array JSON con los campos text, optionA, optionB, optionC, correct, difficulty, category.
          </p>
          <textarea
            className="input font-mono text-xs"
            rows={10}
            placeholder={"principiante | Alimentación | ¿Cuál es la mejor bebida para hidratarse? | Agua | Gaseosa | Jugo en polvo | El agua no aporta azúcar."}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <button className="btn-neon mt-4" onClick={importBulk} disabled={!bulk.trim()}>📥 Importar</button>
        </div>
      )}

      {tab === "banco" && (
        <div className="glass rounded-3xl p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <input className="input md:max-w-xs" placeholder="Buscar texto o categoría…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            <select className="input md:max-w-[200px]" value={filterLvl} onChange={(e) => { setFilterLvl(e.target.value); setPage(1); }}>
              <option value="">Todos los niveles</option>
              {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <span className="self-center text-sm text-emerald-200/70">{list?.total ?? 0} resultados</span>
          </div>
          <div className="space-y-2">
            {list?.rows.map((qu) => (
              <div key={qu.id} className={`rounded-xl border p-3 text-sm ${qu.active ? "border-emerald-400/20 bg-black/30" : "border-red-400/20 bg-red-950/20 opacity-60"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-300/70">#{qu.id} · {CATEGORY_ICON[qu.category] ?? "❓"} {qu.category} · {qu.difficulty}</p>
                    <p className="font-bold text-white">{qu.text}</p>
                    <p className="mt-1 text-emerald-100/80">
                      {(["A", "B", "C"] as const).map((k) => (
                        <span key={k} className={`mr-3 ${qu.correct === k ? "font-black text-[#39ff14]" : ""}`}>{k}) {k === "A" ? qu.optionA : k === "B" ? qu.optionB : qu.optionC}</span>
                      ))}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn-ghost !px-3 !py-1 text-xs" onClick={() => toggleActive(qu)}>{qu.active ? "Desactivar" : "Activar"}</button>
                    <button className="rounded-xl border border-red-400/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10" onClick={() => remove(qu.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {list && list.total > list.pageSize && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button className="btn-ghost !px-3 !py-1 text-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
              <span className="text-sm text-emerald-200">Página {page} de {Math.ceil(list.total / list.pageSize)}</span>
              <button className="btn-ghost !px-3 !py-1 text-sm" disabled={page >= Math.ceil(list.total / list.pageSize)} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="neon-text text-2xl font-black">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-emerald-200/70">{label}</p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-emerald-300">{label}</span>
      {children}
    </label>
  );
}
