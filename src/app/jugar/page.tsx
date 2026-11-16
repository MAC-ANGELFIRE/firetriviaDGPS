"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Question, Settings } from "@/db/schema";
import { AVATARS, LEVELS, CATEGORY_ICON, avatarSrc, computePoints, sfx, type PlayerState } from "@/lib/game";

type Phase = "setup" | "loading" | "intro" | "playing" | "feedback" | "turnEnd" | "final";

type SetupPlayer = { name: string; avatar: string };

export default function JugarPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [numPlayers, setNumPlayers] = useState(2);
  const [setup, setSetup] = useState<SetupPlayer[]>([
    { name: "", avatar: "nena" },
    { name: "", avatar: "varon" },
  ]);
  const [difficulty, setDifficulty] = useState("principiante");
  const [error, setError] = useState<string | null>(null);

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [deck, setDeck] = useState<Question[][]>([]);
  const [current, setCurrent] = useState(0); // índice de jugador
  const [qIndex, setQIndex] = useState(0);
  const [qTime, setQTime] = useState(12);
  const [turnTime, setTurnTime] = useState(120);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [saved, setSaved] = useState(false);
  const turnStart = useRef(0);
  const muted = useRef(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: Settings) => {
        setSettings(s);
        setDifficulty(s.defaultDifficulty);
      })
      .catch(() => setError("No se pudo cargar la configuración."));
  }, []);

  const secondsPerQuestion = settings?.secondsPerQuestion ?? 12;
  const secondsPerPlayer = settings?.secondsPerPlayer ?? 120;
  const questionsPerTurn = settings?.questionsPerTurn ?? 10;

  /* ---------------- Setup ---------------- */
  function changeNum(n: number) {
    setNumPlayers(n);
    setSetup((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ name: "", avatar: AVATARS[next.length % AVATARS.length].id });
      return next.slice(0, n);
    });
  }

  async function startGame() {
    setError(null);
    const ps: PlayerState[] = setup.map((p, i) => ({
      name: p.name.trim() || `Jugador ${i + 1}`,
      avatar: p.avatar,
      score: 0,
      correct: 0,
      timeMs: 0,
      streakMax: 0,
    }));
    setPhase("loading");
    try {
      const need = ps.length * questionsPerTurn;
      const res = await fetch(`/api/questions?mode=play&difficulty=${difficulty}&count=${need + 10}`);
      const qs: Question[] = await res.json();
      if (!qs.length) throw new Error("No hay preguntas para este nivel.");
      // Repartir preguntas únicas por jugador (si faltan, se reutilizan barajadas)
      const pool = [...qs];
      const decks: Question[][] = ps.map(() => []);
      for (let i = 0; i < ps.length; i++) {
        for (let j = 0; j < questionsPerTurn; j++) {
          if (!pool.length) pool.push(...[...qs].sort(() => Math.random() - 0.5));
          decks[i].push(pool.shift()!);
        }
      }
      setPlayers(ps);
      setDeck(decks);
      setCurrent(0);
      setPhase("intro");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar preguntas");
      setPhase("setup");
    }
  }

  /* ---------------- Turno ---------------- */
  function beginTurn() {
    if (!muted.current) sfx.start();
    setQIndex(0);
    setStreak(0);
    setSelected(null);
    setQTime(secondsPerQuestion);
    setTurnTime(secondsPerPlayer);
    turnStart.current = Date.now();
    setPhase("playing");
  }

  const question = deck[current]?.[qIndex];

  const answer = useCallback(
    (opt: string | null) => {
      if (phase !== "playing" || !question) return;
      const isCorrect = opt === question.correct;
      const pts = isCorrect ? computePoints(qTime, secondsPerQuestion, streak) : 0;
      const newStreak = isCorrect ? streak + 1 : 0;
      setSelected(opt ?? "TIMEOUT");
      setLastPoints(pts);
      setStreak(newStreak);
      setPlayers((prev) =>
        prev.map((p, i) =>
          i === current
            ? { ...p, score: p.score + pts, correct: p.correct + (isCorrect ? 1 : 0), streakMax: Math.max(p.streakMax, newStreak) }
            : p
        )
      );
      if (!muted.current) (isCorrect ? sfx.correct : sfx.wrong)();
      setPhase("feedback");
    },
    [phase, question, qTime, secondsPerQuestion, streak, current]
  );

  // Temporizador por pregunta y por turno
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setQTime((t) => {
        if (t <= 1) return 0;
        if (t <= 4 && !muted.current) sfx.tick();
        return t - 1;
      });
      setTurnTime((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && qTime === 0) answer(null);
  }, [qTime, phase, answer]);

  // Avanzar luego del feedback
  useEffect(() => {
    if (phase !== "feedback") return;
    const id = setTimeout(() => {
      const outOfTime = turnTime <= 0;
      const last = qIndex + 1 >= questionsPerTurn;
      if (last || outOfTime) {
        const elapsed = Date.now() - turnStart.current;
        setPlayers((prev) => prev.map((p, i) => (i === current ? { ...p, timeMs: elapsed } : p)));
        setPhase("turnEnd");
      } else {
        setQIndex((i) => i + 1);
        setSelected(null);
        setQTime(secondsPerQuestion);
        setPhase("playing");
      }
    }, 1800);
    return () => clearTimeout(id);
  }, [phase, qIndex, questionsPerTurn, turnTime, secondsPerQuestion, current]);

  function nextPlayer() {
    if (current + 1 < players.length) {
      setCurrent((c) => c + 1);
      setPhase("intro");
    } else {
      setPhase("final");
    }
  }

  const ranking = useMemo(
    () => [...players].map((p, i) => ({ ...p, idx: i })).sort((a, b) => b.score - a.score || b.correct - a.correct || a.timeMs - b.timeMs),
    [players]
  );

  // Guardar partida al finalizar
  useEffect(() => {
    if (phase !== "final" || saved || !players.length) return;
    setSaved(true);
    if (!muted.current) sfx.win();
    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty, players, winner: ranking[0]?.name }),
    }).catch(() => {});
  }, [phase, saved, players, difficulty, ranking]);

  function restart() {
    setPhase("setup");
    setPlayers([]);
    setDeck([]);
    setSaved(false);
  }

  /* ================= RENDER ================= */
  const levelInfo = LEVELS.find((l) => l.id === difficulty)!;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-emerald-200/80 hover:text-emerald-200">
          ← Menú
        </Link>
        <p className="neon-text text-xl font-black tracking-wide">SaludAdos</p>
        <button
          className="btn-ghost !px-3 !py-1.5 text-xs"
          onClick={() => {
            muted.current = !muted.current;
            setLastPoints((x) => x);
          }}
        >
          🔊 Sonido
        </button>
      </div>

      {error && <p className="mx-auto mb-4 max-w-5xl rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-red-200">{error}</p>}

      {phase === "setup" && (
        <div className="mx-auto max-w-5xl slide-in">
          <div className="glass rounded-3xl p-6 md:p-8">
            <h1 className="text-3xl font-black text-white">Configurar partida</h1>
            <p className="text-emerald-200/70">Cada jugador responde {questionsPerTurn} preguntas ({secondsPerQuestion} s c/u) en un máximo de {Math.round(secondsPerPlayer / 60)} min. ¡El mejor puntaje gana!</p>

            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-emerald-300">Cantidad de jugadores</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                    <button
                      key={n}
                      onClick={() => changeNum(n)}
                      className={`h-11 w-11 rounded-xl border font-black transition ${numPlayers === n ? "neon-border bg-[#39ff14] text-black" : "border-emerald-400/30 bg-black/30 text-emerald-200 hover:border-emerald-400"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <label className="mb-2 mt-6 block text-xs uppercase tracking-widest text-emerald-300">Nivel de dificultad</label>
                <div className="grid gap-2">
                  {LEVELS.map((l) => {
                    const locked = settings ? !settings.allowDifficultyChoice && l.id !== settings.defaultDifficulty : false;
                    return (
                      <button
                        key={l.id}
                        disabled={locked}
                        onClick={() => setDifficulty(l.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-30 ${difficulty === l.id ? "neon-border bg-[#39ff14]/10" : "border-emerald-400/20 bg-black/30 hover:border-emerald-400/60"}`}
                      >
                        <span className="text-2xl">{l.emoji}</span>
                        <span>
                          <span className="block font-bold text-white">{l.label}</span>
                          <span className="text-xs text-emerald-200/70">{l.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-widest text-emerald-300">Jugadores y personajes</label>
                <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
                  {setup.map((p, i) => (
                    <div key={i} className="rounded-2xl border border-emerald-400/20 bg-black/30 p-3">
                      <div className="flex items-center gap-3">
                        <Image src={avatarSrc(p.avatar)} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover neon-border" />
                        <input
                          className="input"
                          placeholder={`Nombre del jugador ${i + 1}`}
                          maxLength={20}
                          value={p.name}
                          onChange={(e) => setSetup((s) => s.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                        />
                      </div>
                      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                        {AVATARS.map((a) => (
                          <button
                            key={a.id}
                            title={`${a.name} (${a.kind})`}
                            onClick={() => setSetup((s) => s.map((x, j) => (j === i ? { ...x, avatar: a.id } : x)))}
                            className={`avatar-card flex-none ${p.avatar === a.id ? "selected" : ""}`}
                          >
                            <Image src={a.src} alt={a.name} width={48} height={48} className="h-12 w-12 object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="btn-neon text-lg" onClick={startGame} disabled={!settings}>
                🚀 ¡Comenzar!
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "loading" && (
        <div className="mx-auto max-w-md pt-24 text-center">
          <div className="neon-text animate-pulse text-3xl font-black">Preparando preguntas…</div>
        </div>
      )}

      {phase === "intro" && players[current] && (
        <div className="mx-auto max-w-xl pt-10 text-center pop">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Turno {current + 1} de {players.length}</p>
          <Image src={avatarSrc(players[current].avatar)} alt="" width={220} height={220} className="mx-auto my-6 h-52 w-52 rounded-3xl object-cover neon-border float" />
          <h2 className="text-4xl font-black text-white">{players[current].name}</h2>
          <p className="mt-2 text-emerald-200/80">
            {levelInfo.emoji} Nivel {levelInfo.label} · {questionsPerTurn} preguntas · {secondsPerQuestion} s cada una
          </p>
          <button className="btn-neon pulse mt-8 text-xl" onClick={beginTurn}>¡Estoy listo!</button>
        </div>
      )}

      {(phase === "playing" || phase === "feedback") && question && players[current] && (
        <div className="mx-auto max-w-3xl">
          {/* Barra superior */}
          <div className="glass mb-4 flex items-center justify-between rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <Image src={avatarSrc(players[current].avatar)} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-white">{players[current].name}</p>
                <p className="text-xs text-emerald-300">{players[current].score} pts {streak >= 2 && <span className="ml-1 text-orange-300">🔥 x{streak}</span>}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-emerald-300/70">Pregunta</p>
              <p className="font-black text-white">{qIndex + 1}/{questionsPerTurn}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-emerald-300/70">Tiempo de turno</p>
              <p className={`font-mono font-black ${turnTime <= 15 ? "text-red-400" : "text-white"}`}>
                {String(Math.floor(turnTime / 60)).padStart(2, "0")}:{String(turnTime % 60).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Temporizador de pregunta */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/50 neon-border">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${(qTime / secondsPerQuestion) * 100}%`,
                  background: qTime <= 4 ? "linear-gradient(90deg,#ff3355,#ff8800)" : "linear-gradient(90deg,#39ff14,#00ffa3)",
                }}
              />
            </div>
            <div className={`grid h-12 w-12 place-items-center rounded-full border-2 font-mono text-xl font-black ${qTime <= 4 ? "border-red-400 text-red-300 shake" : "border-[#39ff14] text-[#39ff14]"}`}>
              {qTime}
            </div>
          </div>

          {/* Pregunta */}
          <div key={question.id} className="glass scanline relative rounded-3xl p-6 slide-in md:p-8">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="rounded-full border border-emerald-400/30 bg-black/30 px-3 py-1 font-bold text-emerald-200">
                {CATEGORY_ICON[question.category] ?? "❓"} {question.category}
              </span>
              <span className="uppercase tracking-widest text-emerald-300/70">{question.difficulty}</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white md:text-2xl">{question.text}</h2>

            <div className="mt-6 grid gap-3">
              {(["A", "B", "C"] as const).map((k) => {
                const label = k === "A" ? question.optionA : k === "B" ? question.optionB : question.optionC;
                let cls = "option-btn";
                if (phase === "feedback") {
                  if (k === question.correct) cls += " correct";
                  else if (selected === k) cls += " wrong";
                  else cls += " dim";
                }
                return (
                  <button key={k} className={cls} disabled={phase !== "playing"} onClick={() => answer(k)}>
                    <span className="tag">{k}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {phase === "feedback" && (
              <div className={`mt-5 rounded-2xl border p-4 pop ${selected === question.correct ? "border-[#39ff14]/60 bg-[#39ff14]/10" : "border-red-400/50 bg-red-500/10"}`}>
                <p className="text-lg font-black">
                  {selected === question.correct ? `✅ ¡Correcto! +${lastPoints} pts` : selected === "TIMEOUT" ? "⏰ ¡Se acabó el tiempo!" : "❌ Incorrecto"}
                </p>
                {question.explanation && <p className="mt-1 text-sm text-emerald-100/85">💡 {question.explanation}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "turnEnd" && players[current] && (
        <div className="mx-auto max-w-xl pt-8 text-center pop">
          <Image src={avatarSrc(players[current].avatar)} alt="" width={160} height={160} className="mx-auto h-40 w-40 rounded-3xl object-cover neon-border" />
          <h2 className="mt-4 text-3xl font-black text-white">¡Turno terminado, {players[current].name}!</h2>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Puntos" value={players[current].score} />
            <Stat label="Aciertos" value={`${players[current].correct}/${questionsPerTurn}`} />
            <Stat label="Mejor racha" value={`🔥 ${players[current].streakMax}`} />
          </div>
          <div className="glass mt-6 rounded-2xl p-4 text-left">
            <p className="mb-2 text-xs uppercase tracking-widest text-emerald-300">Tabla parcial</p>
            {ranking.map((p, i) => (
              <div key={p.idx} className="flex items-center justify-between py-1 text-sm">
                <span className="text-emerald-100">{i + 1}. {p.name}</span>
                <span className="font-bold text-white">{p.score} pts</span>
              </div>
            ))}
          </div>
          <button className="btn-neon mt-6 text-lg" onClick={nextPlayer}>
            {current + 1 < players.length ? `Siguiente: ${players[current + 1].name} →` : "🏆 Ver resultados"}
          </button>
        </div>
      )}

      {phase === "final" && (
        <div className="mx-auto max-w-3xl pt-4 text-center">
          <Confetti />
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Resultado final</p>
          <h2 className="neon-text mt-2 text-4xl font-black md:text-5xl">¡{ranking[0]?.name} es el campeón!</h2>
          <p className="mt-1 text-emerald-200/80">Promotor/a de la salud nivel {levelInfo.label} {levelInfo.emoji}</p>

          {/* Podio */}
          <div className="mt-8 flex items-end justify-center gap-3">
            {[1, 0, 2].map((pos) => {
              const p = ranking[pos];
              if (!p) return <div key={pos} className="w-28" />;
              const h = pos === 0 ? "h-40" : pos === 1 ? "h-28" : "h-20";
              return (
                <div key={p.idx} className="flex w-28 flex-col items-center pop md:w-36" style={{ animationDelay: `${pos * 0.15}s` }}>
                  <Image src={avatarSrc(p.avatar)} alt="" width={110} height={110} className={`mb-2 h-20 w-20 rounded-2xl object-cover md:h-24 md:w-24 ${pos === 0 ? "neon-border float" : "border border-emerald-400/30"}`} />
                  <p className="truncate text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs text-emerald-300">{p.score} pts</p>
                  <div className={`${h} mt-2 w-full rounded-t-xl ${pos === 0 ? "bg-gradient-to-t from-[#39ff14]/30 to-[#39ff14]" : "bg-gradient-to-t from-emerald-900/40 to-emerald-700/60"} grid place-items-start justify-center pt-2 text-2xl font-black text-black`}>
                    {pos === 0 ? "🥇" : pos === 1 ? "🥈" : "🥉"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass mt-6 rounded-2xl p-4 text-left">
            {ranking.map((p, i) => (
              <div key={p.idx} className="flex items-center justify-between border-b border-emerald-400/10 py-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-black text-emerald-300">{i + 1}</span>
                  <Image src={avatarSrc(p.avatar)} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                  <span className="font-bold text-white">{p.name}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-black text-white">{p.score} pts</span>
                  <span className="ml-3 text-emerald-200/70">{p.correct}/{questionsPerTurn} ✓ · {Math.round(p.timeMs / 1000)} s</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="btn-neon" onClick={restart}>🔁 Jugar de nuevo</button>
            <Link href="/ranking" className="btn-ghost">🏆 Ranking general</Link>
            <Link href="/" className="btn-ghost">Menú</Link>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-3">
      <p className="neon-text text-2xl font-black">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-emerald-200/70">{label}</p>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        dur: 2.5 + Math.random() * 2,
        color: ["#39ff14", "#00ffa3", "#ffffff", "#ffd400", "#ff3fa4"][i % 5],
      })),
    []
  );
  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </>
  );
}
