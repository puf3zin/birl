import Image from "next/image";

/**
 * Goltzius, "Farnese Hercules" (1592), recortado nas costas — Met, domínio
 * público. É o mesmo recorte do favicon e do ícone de tela de início.
 */
export function Masthead() {
  return (
    <div className="flex items-center gap-2.5 border-b border-line pb-3">
      <Image
        src="/media/marca.png"
        alt=""
        width={128}
        height={128}
        priority
        className="size-10 border border-line object-cover"
      />
      <span className="rotulo">birl</span>
    </div>
  );
}
