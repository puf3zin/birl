"use client";

import {
  nomeDoGrupo,
  progressoPorGrupo,
  sessaoAberta,
  ultimaSerie,
  nomeDoExercicio,
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
  const meta =
    estado.grupos.find((g) => g.id === ultima.grupoId)?.meta ?? 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie/95 backdrop-blur pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">
      <div className="mx-auto flex max-w-lg items-center gap-4 px-5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-widest text-suave">
              Descanso
            </span>
            <span className="tabular text-2xl font-semibold text-acento">
              {relogio(agora - ultima.ts)}
            </span>
          </div>
          <p className="truncate text-sm text-suave">
            {nomeDoExercicio(estado, ultima.exercicioId)} ·{" "}
            {nomeDoGrupo(estado, ultima.grupoId).toLowerCase()} {feito}/{meta}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={desfazerUltimaSerie}
            className="min-h-11 rounded-xl border border-borda px-3 text-sm text-suave active:bg-borda"
          >
            Desfazer
          </button>
          <button
            type="button"
            onClick={encerrarSessao}
            className="min-h-11 rounded-xl border border-borda px-3 text-sm text-suave active:bg-borda"
          >
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}
