"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CHAVE,
  comSerieRegistrada,
  lerEstado,
  normalizar,
  semUltimaSerie,
} from "./estado";
import type { Estado, Grupo } from "./tipos";

function novoId() {
  return crypto.randomUUID();
}

type Loja = {
  /** null enquanto o localStorage não foi lido — nenhuma tela mostra número antes disso. */
  estado: Estado | null;
  registrarSerie: (
    grupoId: string,
    exercicioId: string,
    /** Distância, em grupos de km. Ignorado em grupos de séries. */
    valor?: number,
  ) => void;
  desfazerUltimaSerie: () => void;
  encerrarSessao: () => void;
  adicionarGrupo: (nome: string) => void;
  atualizarGrupo: (id: string, patch: Partial<Omit<Grupo, "id">>) => void;
  moverGrupo: (id: string, direcao: -1 | 1) => void;
  removerGrupo: (id: string) => void;
  adicionarExercicio: (grupoId: string, nome: string) => void;
  removerExercicio: (id: string) => void;
  substituirEstado: (novo: Estado) => void;
};

const Contexto = createContext<Loja | null>(null);

export function useLoja(): Loja {
  const loja = useContext(Contexto);
  if (!loja) throw new Error("useLoja precisa estar dentro de <Provedor>");
  return loja;
}

export function Provedor({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado | null>(null);

  // localStorage só existe no cliente, e o HTML do servidor é sempre o estado
  // "carregando". Ler no inicializador do useState faria o primeiro render do
  // cliente divergir do servidor — erro de hidratação. O render extra aqui é
  // proposital: é o preço de hidratar a partir do localStorage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstado(normalizar(lerEstado(localStorage.getItem(CHAVE)), Date.now()));
  }, []);

  useEffect(() => {
    if (estado) localStorage.setItem(CHAVE, JSON.stringify(estado));
  }, [estado]);

  const editar = useCallback((f: (e: Estado) => Estado) => {
    setEstado((atual) => (atual ? f(atual) : atual));
  }, []);

  const acoes = useMemo(
    () => ({
      registrarSerie: (grupoId: string, exercicioId: string, valor?: number) =>
        editar((e) =>
          comSerieRegistrada(e, grupoId, exercicioId, Date.now(), novoId, valor),
        ),

      desfazerUltimaSerie: () => editar(semUltimaSerie),

      encerrarSessao: () =>
        editar((e) => {
          const aberta = e.sessoes.find((s) => s.fim === null);
          if (!aberta) return e;
          return {
            ...e,
            sessoes: e.sessoes.map((s) =>
              s.id === aberta.id ? { ...s, fim: Date.now() } : s,
            ),
          };
        }),

      adicionarGrupo: (nome: string) => {
        const limpo = nome.trim();
        if (!limpo) return;
        editar((e) => ({
          ...e,
          grupos: [
            ...e.grupos,
            {
              id: novoId(),
              nome: limpo,
              meta: 4,
              ordem: Math.max(-1, ...e.grupos.map((g) => g.ordem)) + 1,
            },
          ],
        }));
      },

      atualizarGrupo: (id: string, patch: Partial<Omit<Grupo, "id">>) =>
        editar((e) => ({
          ...e,
          grupos: e.grupos.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      moverGrupo: (id: string, direcao: -1 | 1) =>
        editar((e) => {
          const ordenados = [...e.grupos].sort((a, b) => a.ordem - b.ordem);
          const i = ordenados.findIndex((g) => g.id === id);
          const j = i + direcao;
          if (i < 0 || j < 0 || j >= ordenados.length) return e;
          [ordenados[i], ordenados[j]] = [ordenados[j], ordenados[i]];
          const ordem = new Map(ordenados.map((g, k) => [g.id, k]));
          return {
            ...e,
            grupos: e.grupos.map((g) => ({
              ...g,
              ordem: ordem.get(g.id) ?? g.ordem,
            })),
          };
        }),

      // As séries antigas ficam: o histórico do que já passou continua legível.
      removerGrupo: (id: string) =>
        editar((e) => ({
          ...e,
          grupos: e.grupos.filter((g) => g.id !== id),
          exercicios: e.exercicios.filter((x) => x.grupoId !== id),
        })),

      adicionarExercicio: (grupoId: string, nome: string) => {
        const limpo = nome.trim();
        if (!limpo) return;
        editar((e) => ({
          ...e,
          exercicios: [...e.exercicios, { id: novoId(), grupoId, nome: limpo }],
        }));
      },

      removerExercicio: (id: string) =>
        editar((e) => ({
          ...e,
          exercicios: e.exercicios.filter((x) => x.id !== id),
        })),

      substituirEstado: (novo: Estado) => setEstado(normalizar(novo, Date.now())),
    }),
    [editar],
  );

  const valor = useMemo<Loja>(() => ({ estado, ...acoes }), [estado, acoes]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
