"use client";

import { useEffect, useState } from "react";

/**
 * Relógio que anda de segundo em segundo enquanto `ativo`.
 *
 * Todo tempo exibido no app é `agora − timestamp`, nunca um contador
 * acumulado: assim recarregar a página, bloquear a tela ou fechar o app no
 * meio do treino não perde tempo nenhum. O navegador estrangula o
 * `setInterval` com a aba em segundo plano, então voltar pro app força uma
 * leitura nova na hora em vez de esperar o próximo tique.
 */
export function useAgora(ativo: boolean): number {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!ativo) return;
    const marcar = () => setAgora(Date.now());
    marcar();
    const id = setInterval(marcar, 1000);
    document.addEventListener("visibilitychange", marcar);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", marcar);
    };
  }, [ativo]);

  return agora;
}
