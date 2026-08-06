"use client";

import { useEffect, useState } from "react";
import {
  ehKm,
  exerciciosDoGrupo,
  formatarNumero,
  ultimoExercicioDoGrupo,
} from "@/lib/estado";
import { useLoja } from "@/lib/store";
import type { Estado, Grupo } from "@/lib/tipos";

/** Aceita "5,2" e "5.2". Devolve null quando não dá um número positivo. */
function lerDistancia(bruto: string): number | null {
  const n = Number(bruto.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function ExercicioSheet({
  estado,
  grupo,
  feito,
  naSessao,
  aoFechar,
}: {
  estado: Estado;
  grupo: Grupo;
  feito: number;
  naSessao: number;
  aoFechar: () => void;
}) {
  const { registrarSerie, adicionarExercicio } = useLoja();
  const [adicionando, setAdicionando] = useState(false);
  const [nome, setNome] = useState("");
  // Em grupo de km, tocar no exercício não grava: abre o campo de distância.
  const [pedindoKm, setPedindoKm] = useState<string | null>(null);
  const [km, setKm] = useState("");

  const exercicios = exerciciosDoGrupo(estado, grupo.id);
  const ultimo = ultimoExercicioDoGrupo(estado, grupo.id);
  const porDistancia = ehKm(grupo);
  const num = (n: number) => formatarNumero(n, grupo.unidade);

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

  function tocarExercicio(exercicioId: string) {
    if (porDistancia) {
      setPedindoKm(exercicioId);
      setKm("");
      return;
    }
    registrarSerie(grupo.id, exercicioId);
    aoFechar();
  }

  function confirmarDistancia() {
    const valor = lerDistancia(km);
    if (valor === null || !pedindoKm) return;
    registrarSerie(grupo.id, pedindoKm, valor);
    aoFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={aoFechar}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative mx-auto max-h-[85vh] w-full max-w-lg overflow-y-auto border-t border-line bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 flex items-end justify-between gap-3 border-b border-line bg-background px-5 pb-3 pt-5">
          <div>
            <p className="rotulo">{grupo.nome}</p>
            <p className="tabular mt-1 font-mono text-[13px] text-muted">
              {naSessao > 0 && (
                <>
                  <span className="text-foreground">
                    {num(naSessao)}
                    {porDistancia && " km"}
                  </span>{" "}
                  neste treino ·{" "}
                </>
              )}
              {num(feito)}/{num(grupo.meta)}
              {porDistancia && " km"} nesta semana
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="rotulo -mr-1 px-2 py-1"
          >
            Fechar
          </button>
        </div>

        <ul className="px-5">
          {exercicios.map((ex) => (
            <li key={ex.id}>
              {pedindoKm === ex.id ? (
                <div className="flex items-center gap-3 border-b border-line py-3">
                  <span className="min-w-0 flex-1 truncate text-[15.5px]">
                    {ex.nome}
                  </span>
                  <input
                    autoFocus
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmarDistancia();
                      if (e.key === "Escape") setPedindoKm(null);
                    }}
                    inputMode="decimal"
                    placeholder="0,0"
                    aria-label={`Distância em quilômetros de ${ex.nome}`}
                    className="tabular w-20 min-h-11 border-b border-line bg-transparent text-right font-mono text-[15.5px] outline-none placeholder:text-muted focus:border-accent"
                  />
                  <span className="rotulo">km</span>
                  <button
                    type="button"
                    onClick={confirmarDistancia}
                    disabled={lerDistancia(km) === null}
                    className="rotulo min-h-11 text-accent disabled:opacity-30"
                  >
                    Registrar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => tocarExercicio(ex.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 border-b border-line text-left text-[15.5px] transition-colors active:bg-soft"
                >
                  <span>{ex.nome}</span>
                  {ex.id === ultimo && (
                    <span className="rotulo shrink-0 rounded-full bg-soft px-2 py-1">
                      último
                    </span>
                  )}
                </button>
              )}
            </li>
          ))}

          {exercicios.length === 0 && !adicionando && (
            <li className="border-b border-line py-4 text-[15.5px] text-muted">
              Nenhum exercício aqui ainda.
            </li>
          )}

          <li className="py-3">
            {adicionando ? (
              <div className="flex items-center gap-3">
                <input
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmarNovo();
                    if (e.key === "Escape") setAdicionando(false);
                  }}
                  placeholder="Nome do exercício"
                  className="min-h-11 flex-1 border-b border-line bg-transparent text-[15.5px] outline-none placeholder:text-muted focus:border-accent"
                />
                <button
                  type="button"
                  onClick={confirmarNovo}
                  className="rotulo min-h-11 text-accent"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdicionando(true)}
                className="rotulo flex min-h-11 w-full items-center gap-2 text-left"
              >
                <span className="size-[3px] rounded-full bg-accent" aria-hidden />
                adicionar exercício
              </button>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
