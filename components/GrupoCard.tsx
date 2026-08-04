"use client";

import { Barra } from "./Barra";
import type { Grupo } from "@/lib/tipos";

export function GrupoCard({
  grupo,
  feito,
  aoTocar,
}: {
  grupo: Grupo;
  feito: number;
  aoTocar: () => void;
}) {
  const completo = feito >= grupo.meta && grupo.meta > 0;

  return (
    <button
      type="button"
      onClick={aoTocar}
      className="w-full rounded-2xl border border-borda bg-superficie p-4 text-left transition-colors active:bg-borda"
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[17px] font-medium">{grupo.nome}</span>
        <span
          className={`tabular text-[15px] ${completo ? "text-acento" : "text-suave"}`}
        >
          {completo && "✓ "}
          {feito}
          <span className="text-suave">/{grupo.meta}</span>
        </span>
      </div>
      <Barra feito={feito} meta={grupo.meta} />
    </button>
  );
}
