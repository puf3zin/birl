"use client";

import { Barra } from "@/components/Barra";
import { Masthead } from "@/components/Masthead";
import { formatarNumero } from "@/lib/estado";
import { resumoDaSemana, semanasComTreino, treinos } from "@/lib/historico";
import { rotuloDaSemana, rotuloDeData } from "@/lib/semana";
import { useLoja } from "@/lib/store";
import { duracaoCurta } from "@/lib/tempo";

export default function Historico() {
  const { estado } = useLoja();

  if (!estado) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6">
        <Masthead />
        <div className="mt-6 h-8 w-40 animate-pulse bg-soft" />
      </main>
    );
  }

  const hoje = new Date();
  const semanas = semanasComTreino(estado, hoje);
  const lista = treinos(estado);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-32 pt-6">
      <Masthead />

      <header className="border-b border-line py-6">
        <p className="rotulo">Histórico</p>
        <h1 className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.02em]">
          O que passou
        </h1>
      </header>

      {semanas.length === 0 && lista.length === 0 && (
        <p className="py-8 text-[15.5px] leading-relaxed text-muted">
          Nada aqui ainda. Assim que a semana virar, ela aparece nesta lista.
        </p>
      )}

      {semanas.length > 0 && (
        <section className="pt-8">
          <p className="rotulo">Semanas</p>
          <ul className="mt-4">
            {semanas.map((inicio, i) => {
              const linhas = resumoDaSemana(estado, inicio);
              // O total é sobre a rotina: séries de grupo que saiu dela ficam
              // visíveis na lista, mas não inflam o placar contra a meta. E
              // séries não somam com quilômetros — o placar é só das séries.
              const daRotina = linhas.filter(
                (l) => l.meta !== null && l.unidade !== "km",
              );
              const feito = daRotina.reduce((n, l) => n + l.feito, 0);
              const meta = daRotina.reduce((n, l) => n + (l.meta ?? 0), 0);
              return (
                <li
                  key={inicio.getTime()}
                  className="border-t border-line py-5"
                >
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-2.5">
                      <span className="rotulo">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15.5px]">
                        {rotuloDaSemana(inicio)}
                      </span>
                    </span>
                    <span className="tabular font-mono text-[12.5px] text-muted">
                      {feito}/{meta}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {linhas.map((l) => (
                      <li key={l.id}>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3">
                          <span
                            className={`text-[13px] ${
                              l.meta === null ? "text-muted italic" : ""
                            }`}
                          >
                            {l.nome}
                          </span>
                          <span className="tabular font-mono text-[11.5px] text-muted">
                            {formatarNumero(l.feito, l.unidade)}
                            {l.meta !== null &&
                              `/${formatarNumero(l.meta, l.unidade)}`}
                            {l.unidade === "km" && " km"}
                          </span>
                        </div>
                        {l.meta !== null && (
                          <Barra feito={l.feito} meta={l.meta} />
                        )}
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
        <section className="pt-10">
          <p className="rotulo">Treinos</p>
          <ul className="mt-4">
            {lista.map((t) => (
              <li
                key={t.sessao.id}
                className="flex items-baseline justify-between gap-4 border-t border-line py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-[15px]">{rotuloDeData(t.inicio)}</p>
                  {t.grupos.length > 0 && (
                    <p className="mt-0.5 truncate text-[12.5px] text-muted">
                      {t.grupos.join(" · ")}
                    </p>
                  )}
                </div>
                <p className="tabular shrink-0 font-mono text-[12.5px] text-muted">
                  {duracaoCurta(t.duracao)}
                  {t.series > 0 && (
                    <> · {t.series}{t.series === 1 ? " série" : " séries"}</>
                  )}
                  {t.km > 0 && <> · {formatarNumero(t.km, "km")} km</>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
