import Image from "next/image";

/**
 * Goltzius, "Farnese Hercules" (1592), recortado nas costas — Met, domínio
 * público. É o único momento de imagem do app; o resto é tipografia e fio.
 */
export function Masthead() {
  return (
    <div className="border-b border-line pb-3">
      <Image
        src="/media/faixa.png"
        alt="Detalhe das costas do Hércules Farnese, gravura de Hendrick Goltzius"
        width={1200}
        height={457}
        priority
        className="w-full"
      />
      <p className="rotulo mt-3">birl</p>
    </div>
  );
}
