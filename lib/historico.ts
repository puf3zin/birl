import { fimDaSessao, seriesDaSemana, seriesDaSessao } from "./estado";
import { inicioDaSemana } from "./semana";
import type { Estado, Sessao } from "./tipos";

/** Semanas já fechadas que têm alguma série, da mais recente pra mais antiga. */
export function semanasComTreino(estado: Estado, hoje: Date): Date[] {
  const semanaAtual = inicioDaSemana(hoje).getTime();
  const inicios = new Set<number>();
  for (const s of estado.series) {
    const i = inicioDaSemana(new Date(s.ts)).getTime();
    if (i < semanaAtual) inicios.add(i);
  }
  return [...inicios].sort((a, b) => b - a).map((t) => new Date(t));
}

export type LinhaDaSemana = {
  id: string;
  nome: string;
  feito: number;
  /** null para grupo que saiu da rotina depois — não há meta com que comparar. */
  meta: number | null;
};

/**
 * As metas não são fotografadas por semana: o histórico compara com a meta de
 * hoje. Trocar uma meta reescreve a leitura do passado, e isso é aceitável
 * enquanto a rotina muda de vez em quando.
 */
export function resumoDaSemana(estado: Estado, inicio: Date): LinhaDaSemana[] {
  const series = seriesDaSemana(estado, inicio);
  const contagem = new Map<string, number>();
  for (const s of series) {
    contagem.set(s.grupoId, (contagem.get(s.grupoId) ?? 0) + 1);
  }

  const linhas: LinhaDaSemana[] = [...estado.grupos]
    .sort((a, b) => a.ordem - b.ordem)
    .map((g) => ({
      id: g.id,
      nome: g.nome,
      feito: contagem.get(g.id) ?? 0,
      meta: g.meta,
    }));

  // Grupos que saíram da rotina mas deixaram séries naquela semana.
  for (const [grupoId, feito] of contagem) {
    if (estado.grupos.some((g) => g.id === grupoId)) continue;
    linhas.push({ id: grupoId, nome: "Fora da rotina", feito, meta: null });
  }

  return linhas;
}

export type ResumoDeTreino = {
  sessao: Sessao;
  inicio: number;
  duracao: number;
  series: number;
  grupos: string[];
};

/** Treinos encerrados, do mais recente pro mais antigo. */
export function treinos(estado: Estado): ResumoDeTreino[] {
  return estado.sessoes
    .filter((s) => s.fim !== null)
    .sort((a, b) => b.inicio - a.inicio)
    .map((sessao) => {
      const series = seriesDaSessao(estado, sessao.id);
      const vistos: string[] = [];
      for (const s of [...series].sort((a, b) => a.ts - b.ts)) {
        const nome = estado.grupos.find((g) => g.id === s.grupoId)?.nome;
        if (nome && !vistos.includes(nome)) vistos.push(nome);
      }
      return {
        sessao,
        inicio: sessao.inicio,
        duracao: fimDaSessao(estado, sessao) - sessao.inicio,
        series: series.length,
        grupos: vistos,
      };
    });
}
