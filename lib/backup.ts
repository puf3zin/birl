import { ehEstadoValido } from "./estado";
import type { Estado } from "./tipos";

export function nomeDoArquivo(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `birl-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

export function serializar(estado: Estado): string {
  return JSON.stringify(estado, null, 2);
}

export function baixarBackup(estado: Estado) {
  const blob = new Blob([serializar(estado)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeDoArquivo();
  a.click();
  URL.revokeObjectURL(url);
}

/** null quando o arquivo não é um backup do birl — quem chama avisa o usuário. */
export async function lerBackup(arquivo: File): Promise<Estado | null> {
  try {
    const dado: unknown = JSON.parse(await arquivo.text());
    return ehEstadoValido(dado) ? dado : null;
  } catch {
    return null;
  }
}
