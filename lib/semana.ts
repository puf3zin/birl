const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** Segunda-feira 00:00 no horário local da semana que contém `d`. */
export function inicioDaSemana(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const desdeSegunda = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - desdeSegunda);
  return x;
}

/** Segunda-feira 00:00 da semana seguinte — o limite superior exclusivo. */
export function proximaSemana(inicio: Date): Date {
  return new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 7);
}

/** Semana anterior à que começa em `inicio`. */
export function semanaAnterior(inicio: Date): Date {
  return new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() - 7);
}

/**
 * Chave ISO 8601 ordenável, tipo `2026-W32`.
 * A quinta-feira da semana é quem decide a qual ano ela pertence — é o que faz
 * a virada de ano cair na semana certa.
 */
export function chaveDaSemana(d: Date): string {
  const segunda = inicioDaSemana(d);
  const quinta = new Date(
    segunda.getFullYear(),
    segunda.getMonth(),
    segunda.getDate() + 3,
  );
  const primeiroDeJaneiro = new Date(quinta.getFullYear(), 0, 1);
  const diasCorridos = Math.round(
    (quinta.getTime() - primeiroDeJaneiro.getTime()) / 86_400_000,
  );
  const numero = Math.floor(diasCorridos / 7) + 1;
  return `${quinta.getFullYear()}-W${String(numero).padStart(2, "0")}`;
}

/** `3–9 ago`, ou `29 jun – 5 jul` quando a semana atravessa o mês. */
export function rotuloDaSemana(d: Date): string {
  const a = inicioDaSemana(d);
  const b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 6);
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()}–${b.getDate()} ${MESES[b.getMonth()]}`;
  }
  return `${a.getDate()} ${MESES[a.getMonth()]} – ${b.getDate()} ${MESES[b.getMonth()]}`;
}

/** `ter, 4 ago` */
export function rotuloDeData(ts: number): string {
  const d = new Date(ts);
  const dia = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][d.getDay()];
  return `${dia}, ${d.getDate()} ${MESES[d.getMonth()]}`;
}
