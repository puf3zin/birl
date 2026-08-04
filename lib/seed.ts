import type { Estado, Exercicio, Grupo } from "./tipos";

const GRUPOS: Grupo[] = [
  { id: "peito", nome: "Peito", meta: 6, ordem: 0 },
  { id: "escapula", nome: "Escápula", meta: 6, ordem: 1 },
  { id: "ombros", nome: "Ombros", meta: 4, ordem: 2 },
  { id: "dedos", nome: "Dedos", meta: 10, ordem: 3 },
  { id: "quadriceps", nome: "Quadríceps", meta: 4, ordem: 4 },
];

const EXERCICIOS: Record<string, string[]> = {
  peito: [
    "Supino reto",
    "Supino inclinado",
    "Crucifixo",
    "Crossover",
    "Paralelas",
    "Flexão",
  ],
  escapula: [
    "Escápula na barra",
    "Barra fixa",
    "Remada curvada",
    "Puxada frontal",
    "Remada unilateral",
    "Face pull",
  ],
  ombros: [
    "Desenvolvimento",
    "Elevação lateral",
    "Elevação frontal",
    "Crucifixo inverso",
    "Arnold press",
  ],
  dedos: [
    "Hangboard 20mm",
    "Hangboard 10mm",
    "Repeaters",
    "Pinça",
    "Campus board",
    "Barra com toalha",
  ],
  quadriceps: [
    "Agachamento livre",
    "Leg press",
    "Cadeira extensora",
    "Afundo",
    "Búlgaro",
  ],
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
