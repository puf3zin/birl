import { ImageResponse } from "next/og";

/*
 * O favicon é o ÚNICO ícone que não usa a obra.
 *
 * A 32px — que é o tamanho real da aba — qualquer pintura vira mancha: foram
 * testados o Goltzius, a ânfora panatenaica, Herakles com o leão nemeu e o
 * atleta do Pintor de Loeb, todos renderizados no tamanho final. Nenhum
 * sobrevive. Então a aba leva uma marca tipográfica, e a obra fica na tela de
 * início (app/apple-icon.png) e no manifest, onde tem pixel para respirar.
 *
 * As cores são amostradas do próprio vaso do Loeb, então os dois ícones leem
 * como um conjunto.
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const PRETO_DO_VASO = "#0d0906";
const LARANJA_DA_FIGURA = "#e5891f";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PRETO_DO_VASO,
          color: LARANJA_DA_FIGURA,
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          // Compensa a métrica do glifo: o "b" tem ascendente e nenhuma
          // descendente, então centralizar pela caixa o deixa alto demais.
          paddingTop: 6,
        }}
      >
        b
      </div>
    ),
    size,
  );
}
