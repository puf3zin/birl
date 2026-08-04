"use client";

import Link from "next/link";
import { useState } from "react";
import { ExercicioSheet } from "@/components/ExercicioSheet";
import { GrupoCard } from "@/components/GrupoCard";
import { PainelDescanso } from "@/components/PainelDescanso";
import { TempoDeTreino } from "@/components/TempoDeTreino";
import { progressoPorGrupo } from "@/lib/estado";
import { rotuloDaSemana } from "@/lib/semana";
import { useLoja } from "@/lib/store";

export default function Semana() {
  const { estado } = useLoja();
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  if (!estado) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6">
        <div className="h-6 w-24 animate-pulse rounded bg-superficie" />
        <div className="mt-3 h-9 w-40 animate-pulse rounded bg-superficie" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[86px] animate-pulse rounded-2xl bg-superficie" />
          ))}
        </div>
      </main>
    );
  }

  const hoje = new Date();
  const progresso = progressoPorGrupo(estado, hoje);
  const feitoTotal = progresso.reduce((n, p) => n + p.feito, 0);
  const metaTotal = progresso.reduce((n, p) => n + p.grupo.meta, 0);
  const aberto = progresso.find((p) => p.grupo.id === grupoAberto);

  return (
    <>
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-40">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-suave">Semana</p>
            <h1 className="text-3xl font-bold tracking-tight">
              {rotuloDaSemana(hoje)}
            </h1>
            <p className="tabular mt-1 text-sm text-suave">
              {feitoTotal} de {metaTotal} séries
            </p>
          </div>
          <TempoDeTreino estado={estado} />
        </header>

        {progresso.length === 0 ? (
          <p className="rounded-2xl border border-borda bg-superficie p-5 text-suave">
            Nenhum grupo muscular na sua rotina ainda.{" "}
            <Link href="/rotina" className="text-acento underline">
              Montar a rotina
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {progresso.map(({ grupo, feito }) => (
              <li key={grupo.id}>
                <GrupoCard
                  grupo={grupo}
                  feito={feito}
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
          aoFechar={() => setGrupoAberto(null)}
        />
      )}
    </>
  );
}
