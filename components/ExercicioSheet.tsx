"use client";

import { useEffect, useState } from "react";
import { exerciciosDoGrupo, ultimoExercicioDoGrupo } from "@/lib/estado";
import { useLoja } from "@/lib/store";
import type { Estado, Grupo } from "@/lib/tipos";

export function ExercicioSheet({
  estado,
  grupo,
  feito,
  aoFechar,
}: {
  estado: Estado;
  grupo: Grupo;
  feito: number;
  aoFechar: () => void;
}) {
  const { registrarSerie, adicionarExercicio } = useLoja();
  const [adicionando, setAdicionando] = useState(false);
  const [nome, setNome] = useState("");

  const exercicios = exerciciosDoGrupo(estado, grupo.id);
  const ultimo = ultimoExercicioDoGrupo(estado, grupo.id);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  function confirmarNovo() {
    if (!nome.trim()) return setAdicionando(false);
    adicionarExercicio(grupo.id, nome);
    setNome("");
    setAdicionando(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={aoFechar}
        className="absolute inset-0 bg-black/70"
      />

      <div className="relative mx-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-b-0 border-borda bg-superficie pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-borda bg-superficie px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{grupo.nome}</h2>
            <p className="tabular text-sm text-suave">
              {feito}/{grupo.meta} nesta semana
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="-mr-2 px-3 py-2 text-2xl leading-none text-suave"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <ul className="p-3">
          {exercicios.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => {
                  registrarSerie(grupo.id, ex.id);
                  aoFechar();
                }}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-[17px] active:bg-borda"
              >
                <span>{ex.nome}</span>
                {ex.id === ultimo && (
                  <span className="shrink-0 rounded-full bg-acento-suave px-2 py-0.5 text-xs text-acento">
                    último
                  </span>
                )}
              </button>
            </li>
          ))}

          {exercicios.length === 0 && !adicionando && (
            <li className="px-3 py-4 text-suave">
              Nenhum exercício aqui ainda.
            </li>
          )}

          <li className="mt-1">
            {adicionando ? (
              <div className="flex gap-2 px-3">
                <input
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmarNovo();
                    if (e.key === "Escape") setAdicionando(false);
                  }}
                  placeholder="Nome do exercício"
                  className="min-h-12 flex-1 rounded-xl border border-borda bg-fundo px-3 outline-none focus:border-acento"
                />
                <button
                  type="button"
                  onClick={confirmarNovo}
                  className="min-h-12 rounded-xl bg-acento px-4 font-medium text-fundo"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdicionando(true)}
                className="min-h-14 w-full rounded-xl px-3 text-left text-[17px] text-suave active:bg-borda"
              >
                + adicionar exercício
              </button>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
