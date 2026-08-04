"use client";

import { sessaoAberta } from "@/lib/estado";
import { relogio } from "@/lib/tempo";
import { useAgora } from "@/lib/useAgora";
import type { Estado } from "@/lib/tipos";

export function TempoDeTreino({ estado }: { estado: Estado }) {
  const agora = useAgora(true);
  const sessao = sessaoAberta(estado, agora);
  if (!sessao) return null;

  return (
    <div className="text-right">
      <p className="rotulo">Treino</p>
      <p className="tabular mt-1 text-[22px] font-semibold tracking-[-0.01em] text-emphasis">
        {relogio(agora - sessao.inicio)}
      </p>
    </div>
  );
}
