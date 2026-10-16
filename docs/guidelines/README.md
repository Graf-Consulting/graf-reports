# Guidelines da plataforma

Regras de design e técnicas que todo report segue, para quem monta estudos e para o agente da esteira.

> **Versão inicial.** Este documento só descreve o que **já está no código** e aponta onde cada regra vive. Ele não toma decisões novas de design: a definição das guidelines continua em aberto no PRD (Q9 e Q14) e deve ser validada com quem responde pela identidade visual. Quando houver decisões, elas entram aqui.
>
> Não confunda com o `guideline.md` de cada estudo, que é o guia de montagem daquele report ([guia de preenchimento](../guia-de-preenchimento.md)).

## Documentos

| Documento | Assunto |
|---|---|
| Este arquivo | Fundamentos: cores, tipografia, layout, números e gráficos, como estão no código |
| [Uso dos blocos](uso-dos-blocos.md) | Quando usar cada bloco, limites de itens, ordem do report e textos de interface |
| [Acessibilidade](acessibilidade.md) | Regras de contraste, texto alternativo, controles e celular, com a situação atual medida |

## Onde cada regra vive

| Assunto | Fonte da verdade |
|---|---|
| Cores | [`lib/report/tokens.ts`](../../lib/report/tokens.ts) |
| Tipografia | [`app/layout.tsx`](../../app/layout.tsx) (fonte) e componentes do kit (tamanhos) |
| Formato de números e rótulos | [`lib/report/format.ts`](../../lib/report/format.ts) |
| Blocos disponíveis e quando usar cada um | [`lib/report/schemas/composicao.schema.json`](../../lib/report/schemas/composicao.schema.json) (catálogo do kit) |
| Aparência de cada bloco | [`components/report/`](../../components/report/) e [`components/charts/`](../../components/charts/) |
| Montagem da página a partir da composição | [`lib/report/renderizador/`](../../lib/report/renderizador/) |
| Regras técnicas e de isolamento | [`CLAUDE.md`](../../CLAUDE.md) |
| Exemplo completo | `impacto-restricoes-ue`: [entradas](../../content/reports/impacto-restricoes-ue/) e [composição](../../app/reports/impacto-restricoes-ue/composicao.json) |

## Cores

Todas as cores vêm de `lib/report/tokens.ts`. Um estudo nunca define cor própria, e a composição não tem campo de cor (ADR-004).

| Token | Uso atual |
|---|---|
| `COLORS.deep` | Fundo do topo (hero), títulos, texto de destaque |
| `COLORS.primary` | Azul de destaque: sobretítulo do topo, primeiro ranking, primeiro cartão de indicador |
| `COLORS.accent` | Verde de destaque: sobretítulo das seções, caixa de destaque, segundo ranking e segundo cartão |
| `COLORS.orange` | Laranja de destaque: mensagem-chave e terceiro cartão |
| `COLORS.secondary` | Texto corrido e texto dos gráficos; quarto cartão |
| `COLORS.text` | Texto secundário: introduções e descrições de gráfico |
| `COLORS.grid` | Linhas de grade e bordas suaves |
| `COLORS.border` | Borda dos controles |
| `COLORS.surface` | Fundo da nota metodológica |
| `COLORS.accentSurface` | Fundo da caixa de destaque |
| `COLORS.onDark`, `COLORS.onDarkMuted` | Texto sobre fundo escuro, no topo |
| `COLORS.dark`, `COLORS.footerText` | Fundo e texto do rodapé |
| `COLORS.linkedin` | Marca do LinkedIn, no botão do cabeçalho |
| `COLORS.shadow` | Sombra do cartão da mensagem-chave |
| `ACCENT_SEQUENCE` | Ordem das cores de destaque aplicada pelo renderizador a cartões e rankings |
| `AREA_PALETTE` | Cores das séries em área empilhada, na ordem |
| `SANKEY_NODE_PALETTES`, `SANKEY_LINK_COLORS`, `SANKEY_NODE_LINE` | Cores dos nós, das ligações e do contorno no fluxo |

O renderizador escolhe as cores pela ordem do bloco; quem monta o estudo não escolhe cor.

### Como usar as cores no código

- **Em classes Tailwind:** use as classes `graf-*`, que vêm dos tokens: `bg-graf-deep`, `text-graf-secondary`, `border-graf-accent`, `border-graf-primary/20`. Nunca `bg-[#001E1D]`.
- **Em JavaScript** (por exemplo, nos gráficos do Plotly): importe de `lib/report/tokens.ts`, por exemplo `COLORS.deep`.
- **Como funciona:** o `app/layout.tsx` publica cada cor de `COLORS` como variável CSS (`--graf-deep`), e o `app/globals.css` registra essas variáveis no tema do Tailwind. O `tokens.ts` continua sendo a única fonte dos valores.
- **Para criar uma cor:** acrescente em `COLORS` e registre a variável correspondente no bloco `@theme` do `globals.css`. Não mude o valor de uma cor existente sem decisão de design: todos os estudos publicados mudam junto.

## Tipografia

- Fonte única: **Montserrat**, pesos 400, 500 e 600, carregada em `app/layout.tsx`. Os gráficos usam a mesma fonte.
- Hierarquia, como está nos componentes do kit:

| Elemento | Tamanho | Onde |
|---|---|---|
| Título do report | 33 a 58 px, conforme a tela, seminegrito | `Hero` |
| Título de seção | 26 a 36 px, seminegrito | `SectionHeading` |
| Título de gráfico | 19 px, seminegrito | `ChartCard` |
| Valor de indicador | 28 px, seminegrito | `MetricCards` |
| Sobretítulo e rótulo de indicador | 11 px, caixa alta, espaçado | `SectionHeading`, `MetricCards` |
| Descrição de gráfico e controles | 13 px | `ChartCard`, `Controls` |

## Layout

- Conteúdo com largura máxima de 1180 px e margem lateral de 24 px em telas pequenas.
- Seções separadas por 60 px.
- Blocos lado a lado (bloco `grupo`) empilham em telas pequenas.
- Cabeçalho e rodapé são os mesmos para todos os estudos (`components/layout/`).

## Números e textos

- Números em pt-BR, no formato compacto: `compact` (`271,3 mi`) e `fob` (`US$ 1,1 bi`).
- Rótulos com código no início são limpos com `cleanLabel` só quando os dados não chegam limpos (ADR-003).
- Unidade junto do valor: moedas antes (`US$ 637,6 mi`), as demais depois (`271,3 mi kg`). Nos títulos de eixo, a unidade vai entre parênteses: "Valor FOB (US$)".
- Nenhum texto é escrito pelo agente: textos de análise vêm da metodologia e textos de interface, do guideline do estudo (ADR-002; PRD, Q13).

## Gráficos

- Todos os gráficos usam o Plotly 2.35.2, carregado por CDN em tempo de execução, sobre a base comum de `components/charts/plotly.ts`: fundo branco, grade suave e caixa de detalhe escura.
- **Ranking** (`RankingChart`): barras horizontais com os maiores valores, o maior no topo; por padrão, os 10 maiores.
- **Série empilhada** (`StackedAreaChart`): área empilhada por período, com as séries de maior total; por padrão, 10 séries.
- **Fluxo** (`SankeyChart`): até três camadas, da esquerda para a direita, com os maiores caminhos; por padrão, 100.
- Eixos numéricos com notação compacta.

## Componentes próprios de um estudo

Quando nenhum bloco do kit atende, o estudo pode ter um componente próprio (skill `03-gerar-componente`). Ele segue as mesmas regras:

- cores de `lib/report/tokens.ts`, nunca hexadecimal solto;
- números formatados com `lib/report/format.ts`;
- gráficos sobre o `PlotlyChart` do kit;
- fica isolado em `app/reports/<slug>/components/` e não altera nada do kit.

## Pendências conhecidas

- **Contraste e texto alternativo:** cinco combinações de cor do kit ficam abaixo do mínimo da WCAG, e os gráficos não têm texto alternativo. Detalhes e propostas em [acessibilidade](acessibilidade.md).
- **Rodapé com texto de um estudo:** o rodapé compartilhado (`components/layout/Footer.tsx`) traz "Fonte: Comex Stat · Elaboração analítica: 10 set. 2026", que é do `impacto-restricoes-ue`. Todo estudo novo herdaria esse texto, o que fere o isolamento do ADR-001. A fonte e a data deveriam vir do `metadata` de cada estudo.
- **Validação com o design:** as regras de [uso dos blocos](uso-dos-blocos.md) e de [acessibilidade](acessibilidade.md) são propostas e precisam ser validadas por quem responde pela identidade visual (PRD, Q9).
