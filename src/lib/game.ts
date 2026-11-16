export const AVATARS = [
  { id: "nena", name: "Nadia R.", kind: "Nena", src: "/avatars/nena.png" },
  { id: "varon", name: "Gustavo M.", kind: "Varón", src: "/avatars/varon.png" },
  { id: "manzana", name: "Manzi", kind: "Manzana", src: "/avatars/manzana.png" },
  { id: "zanahoria", name: "Zana", kind: "Zanahoria", src: "/avatars/zanahoria.png" },
  { id: "brocoli", name: "Broco", kind: "Brócoli", src: "/avatars/brocoli.png" },
  { id: "frutilla", name: "Fresi", kind: "Frutilla", src: "/avatars/frutilla.png" },
  { id: "banana", name: "Bananín", kind: "Banana", src: "/avatars/banana.png" },
  { id: "tomate", name: "Tomy", kind: "Tomate", src: "/avatars/tomate.png" },
  { id: "limon", name: "Limo", kind: "Limón", src: "/avatars/limon.png" },
  { id: "sandia", name: "Sandi", kind: "Sandía", src: "/avatars/sandia.png" },
  { id: "uva", name: "Uvi", kind: "Uva", src: "/avatars/uva.png" },
  { id: "morron", name: "Moro", kind: "Morrón", src: "/avatars/morron.png" },
  { id: "pina", name: "Piñi", kind: "Piña", src: "/avatars/pina.png" },
  { id: "palta", name: "Palti", kind: "Palta", src: "/avatars/palta.png" },
  { id: "cebolla", name: "Ceci", kind: "Cebolla", src: "/avatars/cebolla.png" },
  { id: "mango", name: "Manguito", kind: "Mango", src: "/avatars/mango.png" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export function avatarSrc(id: string) {
  return AVATARS.find((a) => a.id === id)?.src ?? AVATARS[2].src;
}

export const LEVELS = [
  { id: "principiante", label: "Principiante", emoji: "🌱", desc: "Para empezar a jugar" },
  { id: "medio", label: "Medio", emoji: "⚡", desc: "Para quienes ya saben" },
  { id: "avanzado", label: "Avanzado", emoji: "🔥", desc: "Nivel promotor experto" },
] as const;

export type Level = (typeof LEVELS)[number]["id"];

export const CATEGORY_ICON: Record<string, string> = {
  Alimentación: "🥗",
  "Actividad física": "🏃",
  "Salud mental": "🧠",
  "Descanso y sueño": "😴",
  Hidratación: "💧",
  "Promoción de la salud": "🌿",
  "Municipio Saludable": "🏘️",
  "Prevención de enfermedades": "🛡️",
  "Tabaco y alcohol": "🚭",
  "Hábitos saludables": "✨",
  "Mitos y verdades": "🔍",
};

export type PlayerState = {
  name: string;
  avatar: string;
  score: number;
  correct: number;
  timeMs: number;
  streakMax: number;
};

/** Puntaje: base 100 por acierto + bonus por rapidez + bonus por racha */
export function computePoints(remainingSec: number, totalSec: number, streak: number) {
  const speed = Math.round((remainingSec / totalSec) * 50);
  const streakBonus = Math.min(streak, 5) * 10;
  return 100 + speed + streakBonus;
}

/* ---- Sonidos sintetizados con WebAudio (sin archivos) ---- */
let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}
function tone(freq: number, dur: number, type: OscillatorType = "sine", when = 0, vol = 0.12) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime + when);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + when);
  o.stop(c.currentTime + when + dur);
}
export const sfx = {
  correct: () => { tone(660, 0.12, "triangle"); tone(880, 0.15, "triangle", 0.1); tone(1320, 0.25, "triangle", 0.2); },
  wrong: () => { tone(220, 0.25, "sawtooth", 0, 0.08); tone(160, 0.35, "sawtooth", 0.12, 0.08); },
  tick: () => tone(1000, 0.05, "square", 0, 0.04),
  start: () => { tone(523, 0.12, "square", 0, 0.06); tone(659, 0.12, "square", 0.12, 0.06); tone(784, 0.25, "square", 0.24, 0.06); },
  win: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.2, "triangle", i * 0.13)); },
};
