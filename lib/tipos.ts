export type Grupo = {
  id: string;
  nome: string;
  /** Séries-alvo por semana. */
  meta: number;
  ordem: number;
};

export type Exercicio = {
  id: string;
  grupoId: string;
  nome: string;
};

/** Uma série concluída. É o único fato gravado — todo o resto é derivado daqui. */
export type Serie = {
  id: string;
  grupoId: string;
  exercicioId: string;
  sessaoId: string;
  /** epoch ms */
  ts: number;
};

export type Sessao = {
  id: string;
  inicio: number;
  /** null enquanto o treino está em andamento. */
  fim: number | null;
};

export type Estado = {
  versao: 1;
  grupos: Grupo[];
  exercicios: Exercicio[];
  series: Serie[];
  sessoes: Sessao[];
};
