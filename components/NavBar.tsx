"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", rotulo: "Semana" },
  { href: "/historico", rotulo: "Histórico" },
  { href: "/rotina", rotulo: "Rotina" },
] as const;

export function NavBar() {
  const caminho = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-lg">
        {ITENS.map(({ href, rotulo }) => {
          const ativo = caminho === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`rotulo flex min-h-14 items-center justify-center gap-1.5 transition-colors ${
                  ativo ? "text-foreground" : ""
                }`}
              >
                {ativo && (
                  <span className="size-[3px] rounded-full bg-accent" aria-hidden />
                )}
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
