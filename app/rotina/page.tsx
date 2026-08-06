"use client";

import { useRef, useState } from "react";
import { GrupoEditor } from "@/components/GrupoEditor";
import { Masthead } from "@/components/Masthead";
import { baixarBackup, lerBackup } from "@/lib/backup";
import { ehKm, formatarNumero } from "@/lib/estado";
import { useLoja } from "@/lib/store";

export default function Rotina() {
  const { estado, adicionarGrupo, substituirEstado } = useLoja();
  const [novoGrupo, setNovoGrupo] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const entradaArquivo = useRef<HTMLInputElement>(null);

  if (!estado) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6">
        <Masthead />
        <div className="mt-6 h-8 w-32 animate-pulse bg-soft" />
      </main>
    );
  }

  const grupos = [...estado.grupos].sort((a, b) => a.ordem - b.ordem);
  // Séries e quilômetros não somam juntos.
  const metaSeries = grupos.filter((g) => !ehKm(g)).reduce((n, g) => n + g.meta, 0);
  const metaKm = grupos.filter(ehKm).reduce((n, g) => n + g.meta, 0);

  async function aoEscolherArquivo(arquivo: File | undefined) {
    if (!arquivo) return;
    const novo = await lerBackup(arquivo);
    if (!novo) {
      setAviso("Esse arquivo não é um backup do birl.");
      return;
    }
    substituirEstado(novo);
    setAviso(
      `Importado: ${novo.series.length} séries, ${novo.grupos.length} grupos.`,
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-32 pt-6">
      <Masthead />

      <header className="border-b border-line py-6">
        <p className="rotulo">Rotina</p>
        <h1 className="tabular mt-1 text-[34px] font-semibold leading-none tracking-[-0.02em]">
          {metaSeries}
          <span className="ml-2 font-sans text-[15px] font-normal text-muted">
            séries por semana
          </span>
        </h1>
        {metaKm > 0 && (
          <p className="tabular mt-2 font-mono text-[11.5px] text-muted">
            + {formatarNumero(metaKm, "km")} km
          </p>
        )}
      </header>

      <ul>
        {grupos.map((grupo, i) => (
          <li key={grupo.id}>
            <GrupoEditor
              estado={estado}
              grupo={grupo}
              primeiro={i === 0}
              ultimo={i === grupos.length - 1}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 py-4">
        <input
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            adicionarGrupo(novoGrupo);
            setNovoGrupo("");
          }}
          placeholder="Novo grupo muscular"
          className="min-h-11 min-w-0 flex-1 border-b border-line bg-transparent text-[15.5px] outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="button"
          onClick={() => {
            adicionarGrupo(novoGrupo);
            setNovoGrupo("");
          }}
          className="rotulo min-h-11 text-accent"
        >
          Adicionar
        </button>
      </div>

      <section className="mt-10 border-t border-line pt-6">
        <p className="rotulo">Backup</p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Tudo fica só neste aparelho. Exporte antes de trocar de celular ou de
          limpar os dados do navegador. Importar substitui tudo o que está aqui.
        </p>
        <div className="mt-4 flex gap-6">
          <button
            type="button"
            onClick={() => baixarBackup(estado)}
            className="rotulo min-h-11 text-accent"
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={() => entradaArquivo.current?.click()}
            className="rotulo min-h-11 transition-colors active:text-foreground"
          >
            Importar
          </button>
        </div>
        <input
          ref={entradaArquivo}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void aoEscolherArquivo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {aviso && (
          <p className="mt-3 text-[13px] text-emphasis">{aviso}</p>
        )}
      </section>

      <div className="mt-10 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
        <p>
          Hendrick Goltzius, <span className="italic">Farnese Hercules</span>,
          ca. 1592.
        </p>
        <p className="mt-1">
          Pintor de Loeb, <span className="italic">ânfora nolana</span>, ca.
          440–430 a.C.
        </p>
        <p className="mt-2">
          The Metropolitan Museum of Art, domínio público.
        </p>
      </div>
    </main>
  );
}
