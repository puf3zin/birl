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

**Remover grupo não apaga as séries.** As séries antigas ficam e aparecem no
histórico numa linha "Fora da rotina", sem barra e fora do placar da semana.

**Nada de `window.confirm`/`alert`.** Confirmação destrutiva é em dois toques no
próprio botão (ver `GrupoEditor`). Diálogo nativo é ruim no celular.

## Marca e ícones

Todos saem de **Hendrick Goltzius, _Farnese Hercules_ (ca. 1592)** — gravura do
Metropolitan Museum, domínio público. Dois recortes sobre o original de
2730×3786:

- **Faixa** `crop=2100:800:450:200` — a imagem da interface (`Masthead`).
- **Quadrado** `crop=1300:1300:750:200` — todos os ícones, com a figura
  preenchendo o quadro.

| Arquivo | Uso | Tratamento |
|---|---|---|
| `public/media/faixa.png` | `Masthead`, largura total da coluna | 1200×457, contraste 1.25 |
| `app/icon.png` | favicon | 192px, contraste 1.8 |
| `app/apple-icon.png` | tela de início do iOS | 180px, contraste 1.6 |
| `public/icone-{192,512}.png` | manifest, `purpose: any` | sangra até a borda |
| `public/icone-512-mask.png` | manifest, `purpose: maskable` | figura em 80%, resto no tom do papel |

**Só o `maskable` leva margem.** O Android recorta até 20% da borda *nesse
purpose específico*; apontar o `any` para o arquivo com margem faz a figura
parecer pequena em todo lugar. Já aconteceu uma vez.

**O contraste realçado não é enfeite.** Sem ele a gravura vira um borrão cinza
abaixo de ~48px — hachura fina não sobrevive à redução. Ao trocar o recorte,
renderize no tamanho final de uso (180px para ícone) e compare lado a lado, em
vez de julgar pela versão grande. A 32px nenhum recorte resolve: é limite da
técnica, não do enquadramento.

Gerados com `ffmpeg` num passo avulso (não há dependência de imagem no
projeto). Os comandos exatos estão no commit "Visual do puf3, seed real e
Hercules de Goltzius como marca".

## Dados

Chave única no `localStorage`: `birl.v1`. Um objeto `Estado` inteiro, reescrito
a cada mudança. `lerEstado()` nunca lança: JSON quebrado ou de formato
desconhecido cai no seed. Trocar o formato exige subir `versao` e migrar em
`lerEstado()`.
