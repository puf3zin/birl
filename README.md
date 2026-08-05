# birl

Contador de volume de treino por semana. Você define quantas séries de cada
grupo muscular quer fazer por semana — 8x peito, 8x escápula, 12x dedos — e o
site conta o que já foi feito, cronometra o descanso e a duração do treino, e
guarda o histórico.

No ar em **[birl.puf3.com](https://birl.puf3.com)**.

## O que ele é, e o que não é

Uso pessoal, um usuário só, sem login. Marcar uma série leva dois toques:
grupo muscular → exercício. Não registra peso, repetições nem progressão de
carga — cronometrar treino e descanso importa mais.

**Não há backend, banco nem API routes.** Todo o estado vive num único objeto
no `localStorage` do aparelho, o que significa R$0/mês de custo e
funcionamento sem sinal. O preço é que os dados moram num device só; há
exportação e importação de JSON como rede de segurança.

## Rodando

```bash
npm install
npm run dev     # localhost:3000
npm run build   # inclui checagem de tipos
npm run lint
```

Não há suíte de testes. Verificar significa: o build passa e a tela afetada
foi aberta no browser e usada.

## Como é feito

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4. Deploy na Vercel.

A regra de negócio vive em `lib/estado.ts` como funções puras, sem importar
React — é isso que permite verificá-la isolada. `lib/store.tsx` só cuida de
estado do React e de escrever no `localStorage`.

Duas decisões que explicam boa parte do código:

- **Uma série é o único fato gravado.** Progresso, sessões, histórico e totais
  são todos derivados de `Serie[]`.
- **Cronômetro é sempre `agora − timestamp`**, nunca um contador que
  incrementa. É o que faz o tempo sobreviver a recarregar a página, bloquear a
  tela ou fechar o app no meio do treino.

O `CLAUDE.md` na raiz documenta as armadilhas em detalhe.

## Visual

Sistema portado do [puf3](https://puf3.com): duas paletas trocadas pelo modo do
sistema — Hokusai (índigo) no claro, Friedrich (carvão) no escuro. Estrutura
vem de fio de 1px e ar, não de card ou sombra.

Duas obras, ambas do Metropolitan Museum e em domínio público:

- **Interface** — Hendrick Goltzius, *Farnese Hercules* (ca. 1592), gravura.
- **Ícones** — Auguste Rodin, *Study of a Hand* (modelada ca. 1885), gesso.

A escolha dos ícones foi decidida renderizando cada candidato no tamanho final
de uso e comparando lado a lado. O aprendizado está registrado no `CLAUDE.md`:
contraste de linha morre na redução, contraste de área sobrevive.
