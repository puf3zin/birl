import { estadoInicial } from "./seed";
import { inicioDaSemana, proximaSemana } from "./semana";
import type { Estado, Exercicio, Grupo, Serie, Sessao, Unidade } from "./tipos";

export const CHAVE = "birl.v1";

/** Sem série nova por este tempo, o treino é considerado encerrado. */
export const JANELA_SESSAO = 60 * 60 * 1000;

// ---------------------------------------------------------------- seletores

export function ultimaSerie(estado: Estado): Serie | null {
  let ultima: Serie | null = null;
  for (const s of estado.series) if (!ultima || s.ts > ultima.ts) ultima = s;
  return ultima;
}

export function ultimaAtividade(estado: Estado, sessao: Sessao): number {
  let ts = sessao.inicio;
  for (const s of estado.series) {
    if (s.sessaoId === sessao.id && s.ts > ts) ts = s.ts;
  }
  return ts;
}

/**
 * A sessão em andamento — ou null se a última série já passou da janela.
 * O estado só ganha `fim` de fato na próxima escrita (ver `normalizar`); aqui
 * a sessão vencida já é tratada como fechada, pra tela não mostrar um
 * descanso de seis horas quando o app é aberto no dia seguinte.
 */
export function sessaoAberta(estado: Estado, agora: number): Sessao | null {
  const aberta = estado.sessoes.find((s) => s.fim === null);
  if (!aberta) return null;
  return agora - ultimaAtividade(estado, aberta) < JANELA_SESSAO ? aberta : null;
}

export function fimDaSessao(estado: Estado, sessao: Sessao): number {
  return sessao.fim ?? ultimaAtividade(estado, sessao);
}

export function seriesDaSessao(estado: Estado, sessaoId: string): Serie[] {
  return estado.series.filter((s) => s.sessaoId === sessaoId);
}

export function seriesDaSemana(estado: Estado, data: Date): Serie[] {
  const inicio = inicioDaSemana(data);
  const fim = proximaSemana(inicio).getTime();
  const de = inicio.getTime();
  return estado.series.filter((s) => s.ts >= de && s.ts < fim);
}

// ------------------------------------------------------------------ unidades

export function ehKm(grupo: Grupo): boolean {
  return grupo.unidade === "km";
}

/**
 * Quanto uma série soma. Série de musculação vale 1; corrida vale a distância.
 * O `?? 1` é o que mantém todo o histórico anterior ao campo `valor` válido.
 */
export function quantidade(serie: Serie): number {
  return serie.valor ?? 1;
}

/** `12` para séries, `12,5 km` para distância. */
export function formatarQuantidade(n: number, unidade?: Unidade): string {
  if (unidade === "km") {
    return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
  }
  return String(n);
}

/** Só o número, sem sufixo — para os pares `feito/meta`. */
export function formatarNumero(n: number, unidade?: Unidade): string {
  if (unidade === "km") {
    return n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  }
  return String(n);
}

/** Soma por grupo, respeitando a unidade de cada série. */
export function totalPorGrupo(series: Serie[]): Map<string, number> {
  const total = new Map<string, number>();
  for (const s of series) {
    total.set(s.grupoId, (total.get(s.grupoId) ?? 0) + quantidade(s));
  }
  // Ponto flutuante: somar 0.1 muitas vezes vira 0.30000000000000004 na tela.
  for (const [id, v] of total) total.set(id, Math.round(v * 100) / 100);
  return total;
}

export type Progresso = { grupo: Grupo; feito: number };

export function progressoPorGrupo(estado: Estado, data: Date): Progresso[] {
  return progressoDasSeries(estado.grupos, seriesDaSemana(estado, data));
}

export function progressoDasSeries(
  grupos: Grupo[],
  series: Serie[],
): Progresso[] {
  const total = totalPorGrupo(series);
  return [...grupos]
    .sort((a, b) => a.ordem - b.ordem)
    .map((grupo) => ({ grupo, feito: total.get(grupo.id) ?? 0 }));
}

/** Quanto já foi feito de cada grupo NO treino em andamento. */
export function totalDaSessao(
  estado: Estado,
  sessaoId: string,
): Map<string, number> {
  return totalPorGrupo(seriesDaSessao(estado, sessaoId));
}

export function exerciciosDoGrupo(estado: Estado, grupoId: string): Exercicio[] {
  return estado.exercicios.filter((e) => e.grupoId === grupoId);
}

/** O último exercício usado naquele grupo, pra destacar na folha. */
export function ultimoExercicioDoGrupo(
  estado: Estado,
  grupoId: string,
): string | null {
  let ultima: Serie | null = null;
  for (const s of estado.series) {
    if (s.grupoId === grupoId && (!ultima || s.ts > ultima.ts)) ultima = s;
  }
  return ultima?.exercicioId ?? null;
}

export function nomeDoExercicio(estado: Estado, id: string): string {
  return estado.exercicios.find((e) => e.id === id)?.nome ?? "Exercício removido";
}

export function nomeDoGrupo(estado: Estado, id: string): string {
  return estado.grupos.find((g) => g.id === id)?.nome ?? "Grupo removido";
}

// ------------------------------------------------------- escrita e migração

/**
 * Fecha sessões vencidas, datando o fim na última série — não no momento em
 * que se percebeu a inatividade. Sem isso, abrir o app no dia seguinte
 * registraria um treino de dezoito horas.
 */
export function normalizar(estado: Estado, agora: number): Estado {
  let mudou = false;
  const sessoes = estado.sessoes.map((s) => {
    if (s.fim !== null) return s;
    const ultima = ultimaAtividade(estado, s);
    if (agora - ultima < JANELA_SESSAO) return s;
    mudou = true;
    return { ...s, fim: ultima };
  });
  return mudou ? { ...estado, sessoes } : estado;
}

/**
 * Registra a série na sessão aberta, ou abre uma nova se a anterior venceu.
 * `valor` só é gravado em grupo de distância — em grupo de séries ele fica
 * ausente, e `quantidade()` devolve 1.
 */
export function comSerieRegistrada(
  estado: Estado,
  grupoId: string,
  exercicioId: string,
  agora: number,
  novoId: () => string,
  valor?: number,
): Estado {
  const e = normalizar(estado, agora);
  const aberta = e.sessoes.find((s) => s.fim === null);
  const sessoes = [...e.sessoes];
  let sessaoId: string;
  if (aberta) {
    sessaoId = aberta.id;
  } else {
    sessaoId = novoId();
    sessoes.push({ id: sessaoId, inicio: agora, fim: null });
  }
  const serie: Serie = { id: novoId(), grupoId, exercicioId, sessaoId, ts: agora };
  if (valor !== undefined && Number.isFinite(valor) && valor > 0) {
    serie.valor = valor;
  }
  return { ...e, sessoes, series: [...e.series, serie] };
}

export function semUltimaSerie(estado: Estado): Estado {
  const ultima = ultimaSerie(estado);
  if (!ultima) return estado;
  const series = estado.series.filter((s) => s.id !== ultima.id);
  // Sessão aberta que ficou sem nenhuma série não tem por que continuar existindo.
  const orfa =
    !series.some((s) => s.sessaoId === ultima.sessaoId) &&
    estado.sessoes.find((s) => s.id === ultima.sessaoId)?.fim === null;
  return {
    ...estado,
    series,
    sessoes: orfa
      ? estado.sessoes.filter((s) => s.id !== ultima.sessaoId)
      : estado.sessoes,
  };
}

function ehEstadoValido(x: unknown): x is Estado {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Partial<Estado>;
  return (
    e.versao === 1 &&
    Array.isArray(e.grupos) &&
    Array.isArray(e.exercicios) &&
    Array.isArray(e.series) &&
    Array.isArray(e.sessoes)
  );
}

/** Nunca joga: JSON quebrado ou de formato desconhecido cai no seed. */
export function lerEstado(bruto: string | null): Estado {
  if (!bruto) return estadoInicial();
  try {
    const dado: unknown = JSON.parse(bruto);
    return ehEstadoValido(dado) ? dado : estadoInicial();
  } catch {
    return estadoInicial();
  }
}

export { ehEstadoValido };
