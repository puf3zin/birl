"use client";

import { useState } from "react";
import { ehKm, exerciciosDoGrupo } from "@/lib/estado";
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
  const porDistancia = ehKm(grupo);

  function adicionar() {
    if (!novo.trim()) return;
    adicionarExercicio(grupo.id, novo);
    setNovo("");
  }

  return (
    <div className="border-b border-line py-4">
      <div className="flex items-center gap-3">
        <input
          value={grupo.nome}
          onChange={(e) => atualizarGrupo(grupo.id, { nome: e.target.value })}
          aria-label="Nome do grupo"
          className="min-w-0 flex-1 bg-transparent py-1 text-[15.5px] outline-none focus:text-accent"
        />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Diminuir meta de ${grupo.nome}`}
            onClick={() =>
              atualizarGrupo(grupo.id, { meta: Math.max(0, grupo.meta - 1) })
            }
            className="size-10 text-muted transition-colors active:text-foreground"
          >
            −
          </button>
          <span className="tabular w-8 text-center font-mono text-[15px]">
            {grupo.meta}
          </span>
          <button
            type="button"
            aria-label={`Aumentar meta de ${grupo.nome}`}
            onClick={() => atualizarGrupo(grupo.id, { meta: grupo.meta + 1 })}
            className="size-10 text-muted transition-colors active:text-foreground"
          >
            +
          </button>
          <span className="rotulo w-8 shrink-0">{porDistancia ? "km" : "sér"}</span>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="rotulo min-h-9 transition-colors active:text-foreground"
        >
          {aberto ? "ocultar" : `${exercicios.length} exercícios`}
        </button>
        <button
          type="button"
          aria-label={`Subir ${grupo.nome}`}
          disabled={primeiro}
          onClick={() => moverGrupo(grupo.id, -1)}
          className="rotulo min-h-9 disabled:opacity-25"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`Descer ${grupo.nome}`}
          disabled={ultimo}
          onClick={() => moverGrupo(grupo.id, 1)}
          className="rotulo min-h-9 disabled:opacity-25"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() =>
            atualizarGrupo(grupo.id, {
              unidade: porDistancia ? "series" : "km",
            })
          }
          aria-label={`Contar ${grupo.nome} em ${porDistancia ? "séries" : "quilômetros"}`}
          className={`rotulo min-h-9 ${porDistancia ? "text-accent" : ""}`}
        >
          {porDistancia ? "em km" : "em séries"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirmandoRemocao) removerGrupo(grupo.id);
            else setConfirmandoRemocao(true);
          }}
          onBlur={() => setConfirmandoRemocao(false)}
          className={`rotulo ml-auto min-h-9 ${
            confirmandoRemocao ? "text-emphasis" : ""
          }`}
        >
          {confirmandoRemocao ? "confirmar?" : "remover"}
        </button>
      </div>

      {aberto && (
        <ul className="mt-3 border-t border-line pt-2">
          {exercicios.map((ex) => (
            <li key={ex.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[14px]">
                {ex.nome}
              </span>
              <button
                type="button"
                aria-label={`Remover ${ex.nome}`}
                onClick={() => removerExercicio(ex.id)}
                className="size-9 shrink-0 text-muted transition-colors active:text-foreground"
              >
                ×
              </button>
            </li>
          ))}
          <li className="flex items-center gap-3 pt-1">
            <input
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
              placeholder="Novo exercício"
              className="min-h-10 min-w-0 flex-1 border-b border-line bg-transparent text-[14px] outline-none placeholder:text-muted focus:border-accent"
            />
            <button
              type="button"
              onClick={adicionar}
              className="rotulo min-h-10 text-accent"
            >
              Adicionar
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
