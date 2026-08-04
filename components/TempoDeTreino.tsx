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
      <p className="text-xs uppercase tracking-widest text-suave">Treino</p>
      <p className="tabular text-2xl font-semibold">
        {relogio(agora - sessao.inicio)}
      </p>
    </div>
  );
}
