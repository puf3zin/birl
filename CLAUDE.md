@AGENTS.md

# birl

Contador de volume de treino por semana. O Lucas define quantas séries de cada
grupo muscular quer fazer por semana (6x peito, 6x escápula, 10x dedos…) e o
site conta o que já foi feito, cronometra o descanso e a duração do treino, e
guarda o histórico.

Uso pessoal, um usuário só, sem login. Roda em `birl.puf3.com`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 (config no `@theme` dentro de `app/globals.css`, não em arquivo JS)
- **Sem backend, sem banco, sem API routes.** Tudo é client-side.
- Deploy na Vercel

## Comandos

```bash
npm run dev     # localhost:3000
npm run build   # inclui checagem de tipos — é o portão de verificação
npm run lint
```

Não há suíte de testes. **Verificar significa**: `npm run build` passa, o dev
server sobe, e a tela afetada foi realmente aberta no browser e usada.

## Onde as coisas moram

```
app/
  page.tsx           semana atual — a tela principal
  rotina/            metas, grupos, exercícios, backup
  historico/         semanas fechadas e treinos
  layout.tsx         monta <Provedor> e <NavBar>
  manifest.ts        PWA
  icon.png           gerados por script (ver "Ícones")
  apple-icon.png
components/          UI, todos client components
lib/
  tipos.ts           Grupo, Exercicio, Serie, Sessao, Estado
  estado.ts          seletores e transições PURAS (sem React)
  store.tsx          contexto React + persistência no localStorage
  historico.ts       agregações do histórico
  semana.ts          matemática de semana ISO
  tempo.ts           formatação de cronômetro e duração
  backup.ts          exportar/importar JSON
  seed.ts            rotina e exercícios iniciais
docs/specs/          spec do projeto
docs/planos/         planos de implementação por fatia
```

## Visual

O sistema é portado do puf3 — leia **`../puf3/DESIGN.md`** antes de mexer em
qualquer tela. Resumo do que vale aqui:

- **Duas paletas, do puf3**, trocadas pelo modo do sistema:
  `claro` → Hokusai (índigo `#1e4d70`), `escuro` → Friedrich (carvão `#171815`).
  As duas são fundos escuros; `color-scheme: dark` vale nos dois.
- **Editorial, não "app".** Estrutura vem de fio de 1px (`border-line`) e ar —
  não de card, sombra ou botão preenchido. Não existe `rounded` fora dos pills.
- **O rótulo mono é a assinatura**: classe `.rotulo` (mono, versalete, tracking
  `0.18em`, cor `muted`). Todo título de seção, label e ação secundária usa ele.
- **Tracking é bidirecional**: negativo no texto grande, largo no mono pequeno.
- **Números** sempre `tabular`. O número em destaque usa `emphasis` — é o único
  momento de cor forte da tela, então não espalhe.
- **Escala fracionária** (`10.5px`, `12.5px`, `15.5px`, `22px`, `34px`), não a
  rampa `sm/base/lg`.
- Grão de filme e blobs vivem em `body::before/::after`, decorativos, atrás do
  conteúdo, e respeitam `prefers-reduced-motion`.

**Nunca ponha `background` no `html`.** O CSS propaga o fundo do `body` para o
canvas *só quando o `html` não tem um*. Com `html { background }`, o `body`
passa a pintar o próprio fundo e cobre por inteiro o grão e os blobs, que estão
em `z-index: -1` — eles somem sem erro nenhum no console. Já aconteceu uma vez.

**Tokens em inglês, de propósito.** `background / foreground / muted / soft /
line / accent / accent-soft / emphasis` são o vocabulário do puf3 — mantê-los
idênticos é o que deixa componente portar entre os dois projetos. É a única
exceção à regra do português. **Nunca hex cru em componente.**

## Convenções

**Português no código.** Nomes de tipos, funções, variáveis e comentários em
pt-BR. Siga o que já está lá — a exceção são os tokens de cor, acima.

**`lib/estado.ts` não importa React.** Toda regra de negócio vive lá como função
pura, e é isso que permite verificá-la isolada. `lib/store.tsx` só cuida de
estado do React e de escrever no `localStorage`. Não misture.

**Uma série é o único fato gravado.** Progresso, sessões, histórico e totais são
todos derivados de `Serie[]`. Não crie contador denormalizado.

**Grupo tem unidade; série tem valor.** `Grupo.unidade` é `"series"` (padrão) ou
`"km"`, e `Serie.valor` guarda a distância só nos grupos de km. Os dois campos
são **opcionais de propósito**: `quantidade()` devolve `valor ?? 1`, e é isso
que mantém todo o histórico anterior ao recurso válido sem migração nem bump de
`versao`. Nunca leia `serie.valor` direto — use `quantidade()`.

**Séries e quilômetros nunca somam juntos.** Todo placar agregado (home,
rotina, histórico) separa as duas unidades. Somar daria "52 séries" incluindo
20 km, que não quer dizer nada.

## Armadilhas

**Hidratação.** `localStorage` não existe no servidor. `estado` é `null` até o
`useEffect` do `Provedor` rodar. **Nunca renderize número ou horário antes de
`estado` existir** — toda tela tem um esqueleto de carregamento para isso. Um
`Date.now()` renderizado no servidor quebra a hidratação.

**Cronômetro é sempre `agora − timestamp`.** Nunca um contador que incrementa.
É isso que faz o tempo sobreviver a recarregar a página, bloquear a tela ou
fechar o app no meio do treino. `useAgora()` (em `lib/useAgora.ts`) também
escuta `visibilitychange`, porque o navegador estrangula `setInterval` com a aba
em segundo plano — sem isso o tempo congela com o celular no bolso.

**A janela de sessão é de 60 minutos** (`JANELA_SESSAO`). Duas coisas separadas
implementam a regra, e as duas precisam existir:
- `normalizar()` fecha a sessão vencida na escrita, datando o `fim` na **última
  série**, não em "agora". Sem isso, abrir o app no dia seguinte grava um treino
  de dezoito horas.
- `sessaoAberta(estado, agora)` já trata a sessão vencida como fechada na
  leitura, pra tela não mostrar um descanso de seis horas.

**Semana é segunda a domingo, horário local.** `chaveDaSemana()` usa a
quinta-feira da semana para decidir o ano ISO — é o que faz a virada de ano cair
na semana certa. Não "simplifique" isso.

**Metas não são fotografadas por semana.** O histórico compara o passado com a
meta de hoje. Mudar uma meta reescreve a leitura das semanas anteriores. É uma
escolha consciente; mudar isso exige versionar as metas.

**Trocar a unidade de um grupo reescreve o passado dele.** Um grupo que vira
`km` passa a somar `valor`, e as séries antigas — que não têm `valor` — valem
1 km cada. É o mesmo compromisso das metas: o histórico é lido com a
configuração de hoje. O botão fica em `GrupoEditor`.

**Remover grupo não apaga as séries.** As séries antigas ficam e aparecem no
histórico numa linha "Fora da rotina", sem barra e fora do placar da semana.

**O contador de sessão só existe com treino aberto.** `totalDaSessao()` soma o
que saiu na sessão em andamento e aparece no `GrupoCard` antes do total da
semana. A página não tica: ela recalcula a cada mudança de estado, que é o que
acontece a cada série registrada. Se o app ficar aberto e parado mais de uma
hora, o número da sessão fica em tela até a próxima interação — não é dado
errado, é só um rótulo velho, e some no próximo render.

**Nada de `window.confirm`/`alert`.** Confirmação destrutiva é em dois toques no
próprio botão (ver `GrupoEditor`). Diálogo nativo é ruim no celular.

## Marca e ícones

**São duas obras, de propósito** — as duas do Metropolitan Museum, domínio
público, e as duas sobre o corpo treinado:

**Interface** — Hendrick Goltzius, _Farnese Hercules_ (ca. 1592), gravura.
Recorte `crop=2100:800:450:200` sobre o original de 2730×3786, contraste 1.25,
gerado em 1200×457 para `public/media/faixa.png`. Usado no `Masthead`, na
largura da coluna.

**Ícones** — Auguste Rodin, _Study of a Hand_ (modelada ca. 1885), gesso, Met
`191852`, foto `DP-12973-001` de 4000×2637. **Em escala de cinza**
(`format=gray`), sem tonalizar. Três recortes, cada um resolvendo um problema:

- `any` — `crop=2637:2637:731:0`. Quadrado tirado direto da foto, altura
  cheia. Sangra até a borda; o punho e as pontas dos dedos ficam cortados.
- `maskable` — `crop=3875:2637:113:0`, depois preenchido na vertical até o
  quadrado com a cor exata de cada borda (`pad=…:0x2e2e2e` em cima,
  `pad=…:0x595959` embaixo). Assim a mão inteira cabe em 80% do quadro **e**
  a margem some dentro do gradiente da própria foto. Preenchimento chapado
  ou gradiente sintético deixa emenda visível — já foi tentado.
- `favicon` — **girado −32°**, depois `crop=2200:2200` no centro. Ver abaixo.

| Arquivo | Uso |
|---|---|
| `app/icon.png` | favicon, 32px — recorte girado |
| `app/icon1.png` | favicon, 192px — mesmo recorte, para contextos maiores |
| `app/apple-icon.png` | tela de início do iOS, 180px |
| `public/icone-{192,512}.png` | manifest, `purpose: any` — sangra até a borda |
| `public/icone-512-mask.png` | manifest, `purpose: maskable` — mão em 80%, margem no gradiente da foto |

**Por que o favicon é girado.** A mão tem proporção ~2:1; enquadrada na
horizontal dentro de um quadrado, sobra fundo em cima e embaixo e a peça fica
pequena justo onde não pode. Girando −32° ela passa a ocupar a **diagonal**,
que é o eixo mais longo do quadrado — cerca de 40% maior. Foi o que fez a mão
continuar legível a 32px. O corte central de 2200 (de 3875) fica dentro do
quadrado inscrito da rotação, então nenhum canto expõe o `fillcolor`.

**São dois arquivos de favicon de propósito.** `icon.png` já sai em 32px com
`flags=lanczos`, em vez de deixar o navegador reduzir de 192 — a redução do
Chrome é mais mole e borra os dedos. `icon1.png` cobre os contextos que pedem
tamanho maior. Next gera um `<link rel="icon">` para cada, com o `sizes`
correto.

Não existe mais marca tipográfica: o "b" via `ImageResponse` foi substituído
pela obra a pedido do Lucas. **Se `app/icon.tsx` voltar a existir, ele conflita
com `app/icon.png`** — só um dos dois pode estar no repositório.

### O que foi aprendido escolhendo esses ícones

Três rodadas de teste, todas renderizando no tamanho final de uso e comparando
lado a lado. Vale a pena não repetir:

1. **Contraste de linha morre; contraste de área sobrevive.** A gravura do
   Goltzius é hachura fina — abaixo de ~48px vira cinza uniforme, e nem recorte
   fechado nem realce de contraste salvam.
2. **A direção do contraste importa mais que o recorte.** Figura escura sobre
   fundo claro (corredores panatenaicos, Herakles e o leão) se fragmenta em
   ruído. Figura clara sobre fundo escuro (o atleta de Loeb) continua legível.
   Essa foi a virada.
3. **Encher o quadro com uma figura piora, quando as figuras são escuras.**
   Recortes de um corredor só (270/330/400px de origem) ficaram piores que o de
   três: some o laranja que separa os corpos, e é ele que dá ritmo.
4. **Girar resolve o que recorte não resolve.** Peça alongada num quadro
   quadrado desperdiça as duas pontas. Alinhar com a diagonal ganha ~40% de
   tamanho sem cortar nada — foi isso que tornou o Rodin viável a 32px, depois
   de duas rodadas concluindo que "nenhuma obra funciona pequena". A conclusão
   anterior estava certa para enquadramento horizontal e errada como regra
   geral.
5. **Escultura fotografada ganha de desenho, sempre.** Na rodada que trouxe o
   Rodin, os concorrentes eram dois estudos de mão a carvão — Ribot
   (Cleveland `2009.120`) e Carletto Caliari (`1929.549.a`). Os dois leem a
   180px e **os dois viram mancha a 32px**, porque desenho é linha por
   definição. O gesso do Rodin é massa branca sólida sobre fundo escuro, e
   sobrevive aos dois tamanhos. Não julgue pelo "parece ter o contraste
   certo": o que decide é linha versus área.

Descartados por contraste baixo, sem chegar a virar recorte: estatueta de
bronze (verde sobre cinza, e vem com suporte de museu numerado), gravura de
sumô (rosa sobre cinza), relevo egípcio (pedra sobre pedra).

**O gesso do Rodin tem um furo de montagem no punho**, que aparece como um
ponto escuro nos dois recortes. Não dá pra cortar fora sem invadir a palma —
foi tentado. Fica: é um soquete do próprio molde. O número de inventário
`12.12.8`, pintado em vermelho na peça, **some na conversão pra cinza** — é
parte do motivo de o ícone ser preto e branco.

**Ao trocar qualquer ícone**: renderize no tamanho final (180px e 32px),
amplie com vizinho-mais-próximo e compare lado a lado. Julgar pela versão
grande engana sempre.

**Só o `maskable` leva margem.** O Android recorta até 20% da borda *nesse
purpose específico*; apontar o `any` para o arquivo com margem faz a figura
parecer pequena em todo lugar. Já aconteceu uma vez.

Os PNGs são gerados com `ffmpeg` num passo avulso — não há dependência de
imagem no projeto. Os comandos exatos de cada asset ficam na mensagem do commit
que o introduziu (`git log --grep=ffmpeg`).

## Dados

Chave única no `localStorage`: `birl.v1`. Um objeto `Estado` inteiro, reescrito
a cada mudança. `lerEstado()` nunca lança: JSON quebrado ou de formato
desconhecido cai no seed. Trocar o formato exige subir `versao` e migrar em
`lerEstado()`.
