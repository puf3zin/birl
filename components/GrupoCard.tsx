"use client";

import { Barra } from "./Barra";
import { formatarNumero } from "@/lib/estado";
import type { Grupo } from "@/lib/tipos";

export function GrupoCard({
  grupo,
  feito,
  naSessao,
  aoTocar,
}: {
  grupo: Grupo;
  /** Total da semana, na unidade do grupo. */
  feito: number;
  /** Quanto saiu no treino em andamento — 0 quando não há treino aberto. */
  naSessao: number;
  aoTocar: () => void;
}) {
  const completo = feito >= grupo.meta && grupo.meta > 0;
  const num = (n: number) => formatarNumero(n, grupo.unidade);

  return (
    <button
      type="button"
      onClick={aoTocar}
      className="w-full border-b border-line py-4 text-left transition-colors active:bg-soft"
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[15.5px]">{grupo.nome}</span>
        <span className="flex items-baseline gap-2">
          {naSessao > 0 && (
            <>
              {/* O que saiu agora, no treino: mais claro que o total da semana. */}
              <span className="tabular font-mono text-[12.5px] text-foreground">
                {num(naSessao)}
              </span>
              <span className="text-[11px] text-muted" aria-hidden>
                ·
              </span>
            </>
          )}
          {completo && (
            <span className="size-[3px] self-center rounded-full bg-emphasis" aria-hidden />
          )}
          <span
            className={`tabular font-mono text-[12.5px] ${
              completo ? "text-emphasis" : "text-muted"
            }`}
          >
            {num(feito)}/{num(grupo.meta)}
            {grupo.unidade === "km" && " km"}
          </span>
        </span>
      </div>
      <Barra feito={feito} meta={grupo.meta} />
    </button>
  );
}
