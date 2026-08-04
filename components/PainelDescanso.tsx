"use client";

import {
  nomeDoExercicio,
  nomeDoGrupo,
  progressoPorGrupo,
  sessaoAberta,
  ultimaSerie,
} from "@/lib/estado";
import { useLoja } from "@/lib/store";
import { relogio } from "@/lib/tempo";
import { useAgora } from "@/lib/useAgora";
import type { Estado } from "@/lib/tipos";

export function PainelDescanso({ estado }: { estado: Estado }) {
  const { desfazerUltimaSerie, encerrarSessao } = useLoja();
  const agora = useAgora(true);

  const sessao = sessaoAberta(estado, agora);
  const ultima = ultimaSerie(estado);
  if (!sessao || !ultima || ultima.sessaoId !== sessao.id) return null;

  const feito =
    progressoPorGrupo(estado, new Date(agora)).find(
      (p) => p.grupo.id === ultima.grupoId,
    )?.feito ?? 0;
  const meta = estado.grupos.find((g) => g.id === ultima.grupoId)?.meta ?? 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 pb-[calc(env(safe-area-inset-bottom)+3.5rem)] backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center gap-4 px-5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className="rotulo">Descanso</span>
            <span className="tabular text-[22px] font-semibold tracking-[-0.01em] text-emphasis">
              {relogio(agora - ultima.ts)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12.5px] text-muted">
            {nomeDoExercicio(estado, ultima.exercicioId)} ·{" "}
            {nomeDoGrupo(estado, ultima.grupoId).toLowerCase()}{" "}
            <span className="tabular font-mono">
              {feito}/{meta}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={desfazerUltimaSerie}
            className="rotulo min-h-11 transition-colors active:text-foreground"
          >
            Desfazer
          </button>
          <button
            type="button"
            onClick={encerrarSessao}
            className="rotulo min-h-11 transition-colors active:text-foreground"
          >
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}
