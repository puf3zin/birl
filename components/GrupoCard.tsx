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
      className="w-full border-b border-line py-4 text-left transition-colors active:bg-soft"
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[15.5px]">{grupo.nome}</span>
        <span className="flex items-center gap-1.5">
          {completo && (
            <span className="size-[3px] rounded-full bg-emphasis" aria-hidden />
          )}
          <span
            className={`tabular font-mono text-[12.5px] ${
              completo ? "text-emphasis" : "text-muted"
            }`}
          >
            {feito}/{grupo.meta}
          </span>
        </span>
      </div>
      <Barra feito={feito} meta={grupo.meta} />
    </button>
  );
}
