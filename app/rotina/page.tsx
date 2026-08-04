"use client";

import { useRef, useState } from "react";
import { GrupoEditor } from "@/components/GrupoEditor";
import { baixarBackup, lerBackup } from "@/lib/backup";
import { useLoja } from "@/lib/store";

export default function Rotina() {
  const { estado, adicionarGrupo, substituirEstado } = useLoja();
  const [novoGrupo, setNovoGrupo] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const entradaArquivo = useRef<HTMLInputElement>(null);

  if (!estado) {
    return (
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6">
        <div className="h-9 w-32 animate-pulse rounded bg-superficie" />
      </main>
    );
  }

  const grupos = [...estado.grupos].sort((a, b) => a.ordem - b.ordem);
  const metaTotal = grupos.reduce((n, g) => n + g.meta, 0);

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
    <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-32">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Rotina</h1>
        <p className="tabular mt-1 text-sm text-suave">
          {metaTotal} séries por semana
        </p>
      </header>

      <ul className="space-y-3">
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

      <div className="mt-3 flex gap-2">
        <input
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            adicionarGrupo(novoGrupo);
            setNovoGrupo("");
          }}
          placeholder="Novo grupo muscular"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-borda bg-superficie px-4 outline-none focus:border-acento"
        />
        <button
          type="button"
          onClick={() => {
            adicionarGrupo(novoGrupo);
            setNovoGrupo("");
          }}
          className="min-h-12 shrink-0 rounded-xl border border-borda px-4 text-suave active:bg-borda"
        >
          Adicionar
        </button>
      </div>

      <section className="mt-10 rounded-2xl border border-borda bg-superficie p-4">
        <h2 className="font-medium">Backup</h2>
        <p className="mt-1 text-sm text-suave">
          Tudo fica só neste aparelho. Exporte antes de trocar de celular ou de
          limpar os dados do navegador.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => baixarBackup(estado)}
            className="min-h-12 flex-1 rounded-xl bg-acento px-4 font-medium text-fundo"
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={() => entradaArquivo.current?.click()}
            className="min-h-12 flex-1 rounded-xl border border-borda px-4 text-suave active:bg-borda"
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
        <p className="mt-3 text-xs text-suave">
          Importar substitui tudo o que está aqui.
        </p>
        {aviso && <p className="mt-3 text-sm text-acento">{aviso}</p>}
      </section>
    </main>
  );
}
