import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaludAdos · Trivia de Promoción de la Salud",
  description:
    "Juego de preguntas sobre estilos de vida saludables de la Dirección General de Promoción de la Salud – MSPBS Paraguay.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-grid min-h-screen antialiased flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="mt-auto border-t border-[#39ff14]/25 bg-black/50 px-4 py-4 text-center backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200/60">
            Ministerio de Salud Pública y Bienestar Social · Dirección General de Promoción de la Salud
          </p>
          <p className="neon-text mt-1 text-sm font-black tracking-[0.2em]">
            ::: POWERED BY ANGELFIRE (Angel D. B. Palma) :::
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-100/80">
            Todos los derechos reservados
          </p>
        </footer>
      </body>
    </html>
  );
}
