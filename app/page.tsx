"use client";

import Link from "next/link";
import { useState } from "react";
import { ExercicioSheet } from "@/components/ExercicioSheet";
import { GrupoCard } from "@/components/GrupoCard";
import { Masthead } from "@/components/Masthead";
import { PainelDescanso } from "@/components/PainelDescanso";
import { TempoDeTreino } from "@/components/TempoDeTreino";
import {
  ehKm,
  formatarNumero,
  progressoPorGrupo,
  sessaoAberta,
  totalDaSessao,
} from "@/lib/estado";
import { rotuloDaSemana } from "@/lib/semana";
import { useLoja } from "@/lib/store";

export default function Semana() {
  const { estado } = useLoja();
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  if (!estado) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6">
        <Masthead />
        <div className="mt-6 h-8 w-40 animate-pulse bg-soft" />
        <div className="mt-8 space-y-6">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 animate-pulse bg-soft" />
          ))}
        </div>
      </main>
    );
  }

  const hoje = new Date();
  const progresso = progressoPorGrupo(estado, hoje);

  // A sessão aqui é lida sem cronômetro: só precisamos saber se existe uma
  // aberta para somar o que já saiu nela. Quem tica é o TempoDeTreino.
  const sessao = sessaoAberta(estado, hoje.getTime());
  const naSessao = sessao ? totalDaSessao(estado, sessao.id) : null;

  // Séries e quilômetros não somam juntos: cada unidade tem seu placar.
  const emSeries = progresso.filter((p) => !ehKm(p.grupo));
  const emKm = progresso.filter((p) => ehKm(p.grupo));
  const soma = (lista: typeof progresso, campo: "feito" | "meta") =>
    lista.reduce((n, p) => n + (campo === "feito" ? p.feito : p.grupo.meta), 0);

  const aberto = progresso.find((p) => p.grupo.id === grupoAberto);

  return (
    <>
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-40 pt-6">
        <Masthead />

        <header className="flex items-start justify-between gap-4 border-b border-line py-6">
          <div>
            <p className="rotulo">Semana</p>
            <h1 className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.02em]">
              {rotuloDaSemana(hoje)}
            </h1>
            <p className="tabular mt-2 font-mono text-[11.5px] text-muted">
              {soma(emSeries, "feito")} de {soma(emSeries, "meta")} séries
              {emKm.length > 0 && (
                <>
                  {" · "}
                  {formatarNumero(soma(emKm, "feito"), "km")} de{" "}
                  {formatarNumero(soma(emKm, "meta"), "km")} km
                </>
              )}
            </p>
          </div>
          <TempoDeTreino estado={estado} />
        </header>

        {progresso.length === 0 ? (
          <p className="py-8 text-[15.5px] leading-relaxed text-muted">
            Nenhum grupo muscular na sua rotina ainda.{" "}
            <Link href="/rotina" className="text-accent">
              Montar a rotina
            </Link>
            .
          </p>
        ) : (
          <ul>
            {progresso.map(({ grupo, feito }) => (
              <li key={grupo.id}>
                <GrupoCard
                  grupo={grupo}
                  feito={feito}
                  naSessao={naSessao?.get(grupo.id) ?? 0}
                  aoTocar={() => setGrupoAberto(grupo.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <PainelDescanso estado={estado} />

      {aberto && (
        <ExercicioSheet
          estado={estado}
          grupo={aberto.grupo}
          feito={aberto.feito}
          naSessao={naSessao?.get(aberto.grupo.id) ?? 0}
          aoFechar={() => setGrupoAberto(null)}
        />
      )}
    </>
  );
}
