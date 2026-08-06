/**
 * O que se conta num grupo. `series` conta registros; `km` soma distância.
 * Ausente = `series` — é o que mantém os dados antigos válidos sem migração.
 */
export type Unidade = "series" | "km";

export type Grupo = {
  id: string;
  nome: string;
  /** Alvo por semana, na unidade do grupo. */
  meta: number;
  ordem: number;
  unidade?: Unidade;
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
  /**
   * Quanto essa série vale na unidade do grupo — a distância, em grupos de km.
   * Ausente vale 1, que é o que faz série contada continuar contando um.
   */
  valor?: number;
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
