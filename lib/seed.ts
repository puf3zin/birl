import type { Estado, Exercicio, Grupo } from "./tipos";

/**
 * A rotina real do Lucas, capturada do app em 4 ago 2026. O seed só vale para
 * uma instalação nova (aparelho novo, ou depois de limpar o navegador) — quem
 * já tem dados salvos não é tocado por mudanças aqui.
 */
const GRUPOS: Grupo[] = [
  { id: "peito", nome: "Peito", meta: 8, ordem: 0 },
  { id: "escapula", nome: "Escápula", meta: 8, ordem: 1 },
  { id: "ombros", nome: "Ombros", meta: 6, ordem: 2 },
  { id: "dedos", nome: "Dedos", meta: 12, ordem: 3 },
  { id: "quadriceps", nome: "Quadríceps", meta: 4, ordem: 4 },
  { id: "costas", nome: "Costas", meta: 10, ordem: 5 },
  { id: "abdominal", nome: "Abdominal", meta: 4, ordem: 6 },
];

const EXERCICIOS: Record<string, string[]> = {
  peito: ["Paralelas", "Flexão"],
  escapula: ["Escápula na barra", "Escápula unilateral", "Protração"],
  ombros: ["Desenvolvimento", "Elevação lateral", "Manguito", "Black burn"],
  dedos: ["Finger portátil", "Hangboard", "Pinça"],
  quadriceps: ["Agachamento livre", "Búlgaro", "Pistol"],
  costas: [
    "Barra pronada com peso",
    "Barra pronada repetição",
    "One-arm assistido",
    "Archer pullups",
  ],
  abdominal: ["Dragon lever", "Front raise unilateral"],
};

function semAcento(s: string) {
  // Faixa dos diacríticos combinantes que o NFD separa das letras.
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** `escapula:remada-curvada` — estável, então editar a lista não quebra histórico. */
function idDoExercicio(grupoId: string, nome: string) {
  const slug = semAcento(nome)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${grupoId}:${slug}`;
}

export function estadoInicial(): Estado {
  const exercicios: Exercicio[] = GRUPOS.flatMap((g) =>
    (EXERCICIOS[g.id] ?? []).map((nome) => ({
      id: idDoExercicio(g.id, nome),
      grupoId: g.id,
      nome,
    })),
  );

  return {
    versao: 1,
    grupos: GRUPOS.map((g) => ({ ...g })),
    exercicios,
    series: [],
    sessoes: [],
  };
}
