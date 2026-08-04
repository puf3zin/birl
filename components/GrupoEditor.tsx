"use client";

import { useState } from "react";
import { exerciciosDoGrupo } from "@/lib/estado";
import { useLoja } from "@/lib/store";
import type { Estado, Grupo } from "@/lib/tipos";

export function GrupoEditor({
  estado,
  grupo,
  primeiro,
  ultimo,
}: {
  estado: Estado;
  grupo: Grupo;
  primeiro: boolean;
  ultimo: boolean;
}) {
  const {
    atualizarGrupo,
    moverGrupo,
    removerGrupo,
    adicionarExercicio,
    removerExercicio,
  } = useLoja();
  const [aberto, setAberto] = useState(false);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [novo, setNovo] = useState("");

  const exercicios = exerciciosDoGrupo(estado, grupo.id);

  function adicionar() {
    if (!novo.trim()) return;
    adicionarExercicio(grupo.id, novo);
    setNovo("");
  }

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-4">
      <div className="flex items-center gap-3">
        <input
          value={grupo.nome}
          onChange={(e) => atualizarGrupo(grupo.id, { nome: e.target.value })}
          aria-label="Nome do grupo"
          className="min-w-0 flex-1 rounded-lg bg-transparent py-1 text-[17px] font-medium outline-none focus:bg-fundo focus:px-2"
        />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Diminuir meta de ${grupo.nome}`}
            onClick={() =>
              atualizarGrupo(grupo.id, { meta: Math.max(0, grupo.meta - 1) })
            }
            className="size-10 rounded-lg border border-borda text-lg active:bg-borda"
          >
            −
          </button>
          <span className="tabular w-9 text-center text-lg">{grupo.meta}</span>
          <button
            type="button"
            aria-label={`Aumentar meta de ${grupo.nome}`}
            onClick={() => atualizarGrupo(grupo.id, { meta: grupo.meta + 1 })}
            className="size-10 rounded-lg border border-borda text-lg active:bg-borda"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-suave">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="rounded-lg border border-borda px-3 py-1.5 active:bg-borda"
        >
          {aberto ? "ocultar" : `${exercicios.length} exercícios`}
        </button>
        <button
          type="button"
          aria-label={`Subir ${grupo.nome}`}
          disabled={primeiro}
          onClick={() => moverGrupo(grupo.id, -1)}
          className="rounded-lg border border-borda px-3 py-1.5 disabled:opacity-30 active:bg-borda"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`Descer ${grupo.nome}`}
          disabled={ultimo}
          onClick={() => moverGrupo(grupo.id, 1)}
          className="rounded-lg border border-borda px-3 py-1.5 disabled:opacity-30 active:bg-borda"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirmandoRemocao) removerGrupo(grupo.id);
            else setConfirmandoRemocao(true);
          }}
          onBlur={() => setConfirmandoRemocao(false)}
          className={`ml-auto rounded-lg border px-3 py-1.5 ${
            confirmandoRemocao
              ? "border-red-500 text-red-400"
              : "border-borda active:bg-borda"
          }`}
        >
          {confirmandoRemocao ? "confirmar?" : "remover"}
        </button>
      </div>

      {aberto && (
        <ul className="mt-3 space-y-1 border-t border-borda pt-3">
          {exercicios.map((ex) => (
            <li key={ex.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{ex.nome}</span>
              <button
                type="button"
                aria-label={`Remover ${ex.nome}`}
                onClick={() => removerExercicio(ex.id)}
                className="size-9 shrink-0 rounded-lg text-suave active:bg-borda"
              >
                ×
              </button>
            </li>
          ))}
          <li className="flex gap-2 pt-1">
            <input
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
              placeholder="Novo exercício"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-acento"
            />
            <button
              type="button"
              onClick={adicionar}
              className="min-h-11 shrink-0 rounded-xl border border-borda px-4 text-suave active:bg-borda"
            >
              Adicionar
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
