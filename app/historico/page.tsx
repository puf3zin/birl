"use client";

import { Barra } from "@/components/Barra";
import { resumoDaSemana, semanasComTreino, treinos } from "@/lib/historico";
import { rotuloDaSemana, rotuloDeData } from "@/lib/semana";
import { useLoja } from "@/lib/store";
import { duracaoCurta } from "@/lib/tempo";

export default function Historico() {
  const { estado } = useLoja();

  if (!estado) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6">
        <div className="h-9 w-40 animate-pulse rounded bg-superficie" />
      </main>
    );
  }

  const hoje = new Date();
  const semanas = semanasComTreino(estado, hoje);
  const lista = treinos(estado);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-32">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Histórico</h1>

      {semanas.length === 0 && lista.length === 0 && (
        <p className="rounded-2xl border border-borda bg-superficie p-5 text-suave">
          Nada aqui ainda. Assim que a semana virar, ela aparece nesta lista.
        </p>
      )}

      {semanas.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-suave">
            Semanas
          </h2>
          <ul className="space-y-3">
            {semanas.map((inicio) => {
              const linhas = resumoDaSemana(estado, inicio);
              // O total é sobre a rotina: séries de grupo que saiu dela ficam
              // visíveis na lista, mas não inflam o placar contra a meta.
              const daRotina = linhas.filter((l) => l.meta !== null);
              const feito = daRotina.reduce((n, l) => n + l.feito, 0);
              const meta = daRotina.reduce((n, l) => n + (l.meta ?? 0), 0);
              return (
                <li
                  key={inicio.getTime()}
                  className="rounded-2xl border border-borda bg-superficie p-4"
                >
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="font-medium">{rotuloDaSemana(inicio)}</span>
                    <span className="tabular text-sm text-suave">
                      {feito}/{meta} séries
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {linhas.map((l) => (
                      <li key={l.id}>
                        <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                          <span
                            className={l.meta === null ? "text-suave" : undefined}
                          >
                            {l.nome}
                          </span>
                          <span className="tabular text-suave">
                            {l.feito}
                            {l.meta !== null && `/${l.meta}`}
                          </span>
                        </div>
                        {l.meta !== null && <Barra feito={l.feito} meta={l.meta} />}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {lista.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs uppercase tracking-widest text-suave">
            Treinos
          </h2>
          <ul className="space-y-2">
            {lista.map((t) => (
              <li
                key={t.sessao.id}
                className="rounded-2xl border border-borda bg-superficie px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{rotuloDeData(t.inicio)}</span>
                  <span className="tabular text-sm text-suave">
                    {duracaoCurta(t.duracao)} · {t.series}{" "}
                    {t.series === 1 ? "série" : "séries"}
                  </span>
                </div>
                {t.grupos.length > 0 && (
                  <p className="mt-0.5 truncate text-sm text-suave">
                    {t.grupos.join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
