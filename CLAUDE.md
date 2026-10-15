# CLAUDE.md

Site estático de estudos da GRAF Infra Consulting. Cada estudo é uma página independente, publicada na mesma app Next.js e montada com um kit de componentes compartilhado (ADR-001).

Toda a documentação, os comentários, os commits e as mensagens de PR são escritos em português.

## Comandos

```bash
npm run dev          # servidor local
npm run lint         # ESLint (config do Next)
npx tsc --noEmit     # typecheck (não há script próprio)
npm run build        # export estático em out/; precisa passar antes de qualquer PR
npm run validar      # valida entradas e composição de todos os estudos (scripts/validar.mjs)
npm run validar -- <slug>   # valida um estudo
```

Não há testes automatizados. Antes de abrir PR, rode lint, typecheck, build e `npm run validar`.

Para conferir um estudo localmente, use `npm run dev` e acesse `/reports/<slug>`. No build, a rota vira `out/reports/<slug>.html`.

## Stack e restrições

- Next.js 16 (App Router), React 19, TypeScript e Tailwind 4.
- O `next.config.ts` usa `output: 'export'`. Nada pode depender de servidor em produção: não use rotas de API, server actions, cookies, headers, `revalidate` nem renderização dinâmica.
- O Plotly 2.35.2 é carregado por CDN em runtime (`components/charts/plotly.ts`) e não é dependência npm. Não o adicione ao `package.json` sem decisão registrada.
- Use o alias `@/*` a partir da raiz do repo.
- A fonte é Montserrat, carregada em `app/layout.tsx`.

## Estrutura

```
app/
  layout.tsx, globals.css    compartilhados por todos os estudos
  page.tsx                   redireciona para o estudo atual
  reports/<slug>/            um estudo por pasta
components/
  layout/                    Header, Footer
  report/                    blocos de página do kit (Hero, KeyMessage, ReportSection,
                             MetricCards, ChartCard, Callout, MethodNote, Controls)
  charts/                    gráficos do kit sobre PlotlyChart (RankingChart,
                             StackedAreaChart, SankeyChart)
lib/report/
  tokens.ts                  paleta GRAF (COLORS, ACCENT_SEQUENCE, AREA_PALETTE)
  renderizador/              Renderizador (composição + entradas → página), blocos interativos,
                             preenchimento de marcadores e leitura dos cabeçalhos YAML no build
  format.ts                  formatadores (compact, fob) e limpeza de rótulos (cleanLabel)
  schemas/                   JSON Schema (draft-07) do data.json, dos cabeçalhos do guideline.md e da
                             metodologia.md e da composição; o schema da composição é o catálogo de blocos do kit
docs/                        documentação (índice em docs/README.md); ADRs em docs/adr/
```

Hoje existe um único estudo, `impacto-restricoes-ue`, já no formato da esteira: entradas em `content/reports/impacto-restricoes-ue/`, `composicao.json` e `page.tsx` em `app/reports/impacto-restricoes-ue/`. Ele é o estudo de referência para entradas, composição, texto, gráfico e layout.

## Regras de isolamento (ADR-001)

- Um estudo nunca importa nada de outro estudo, e nenhum componente compartilhado lê dados de um estudo.
- Código que serve a um só estudo fica na pasta desse estudo. Um utilitário que pode servir a qualquer estudo, como `cleanLabel`, vai para `lib/report/`.
- Alterar `components/`, `lib/report/`, `app/layout.tsx` ou `app/globals.css` afeta todos os estudos publicados. Nesse caso, faça o build e confira visualmente cada estudo existente antes e depois da mudança, e diga no PR quais estudos foram conferidos.
- Não mude o comportamento de blocos nem de componentes existentes do kit. Um componente pode ganhar props novas, sempre opcionais e com padrão igual ao comportamento atual; o que não couber nisso vira um bloco novo (PRD, Q10). Estudos publicados não são regerados, a não ser por pedido explícito.

## Convenções de código

- Componentes do kit são parametrizados por linhas de dados e nomes de coluna (`rows`, `labelKey`, `valueKey`...). Não conhecem nenhum estudo.
- Cores vêm de `lib/report/tokens.ts`. Não escreva hex solto em componente ou estudo.
- Números exibidos usam os formatadores de `lib/report/format.ts`, em pt-BR.
- Componentes com estado ou gráfico levam `'use client'`. As páginas (`page.tsx`) continuam como server components finos.
- Cada pasta do kit exporta seus componentes por um `index.ts`. Ao criar um componente, registre-o no barrel.
- Comentários curtos em português, só onde o porquê não é óbvio.

## Git e publicação

- Todo push na `main` publica em produção na Vercel. Nunca faça push direto na `main`. Toda mudança entra por PR.
- Cada PR ganha um preview da Vercel, que é onde os stakeholders validam o estudo.
- Os PRs passam pelo workflow Claude Code Review (`.github/workflows/`).
- Commits seguem Conventional Commits em português, por exemplo `feat: adiciona estudo <slug>`, `fix:`, `refactor:` e `docs:`.
- O merge é sempre humano.

## Esteira de publicação (decidida, em implementação)

O objetivo é que um estudo saia das entradas do cientista para um PR com preview sem codificação manual. O PRD, os ADRs 002 a 005 (`docs/adr/`) e o fluxo em `docs/fluxo-da-esteira.md` descrevem a esteira. O renderizador fica em `lib/report/renderizador/`, e toda página de estudo segue o modelo da skill `04-montar-pagina`.

### Entradas do cientista: `content/reports/<slug>/` (ADR-002)

| Arquivo | Responde por | Não responde por |
|---|---|---|
| `data.json` | Os dados, já agregados para o report: `metadata` (data de referência, período, fontes) e `tabelas` (cada uma com descrição, chave, campos tipados e linhas) | Como exibir, o que concluir |
| `metodologia.md` | Como usar os dados corretamente e o que é verdade. O cabeçalho YAML lista análises, leituras, conclusões e ressalvas; leituras e conclusões trazem o texto de análise, com marcadores (`{id}`) para os valores vindos dos dados | Componentes, cores, layout |
| `guideline.md` | Como montar o report: slug, título, seções, destaques, visual, componentes novos e textos de interface (títulos, introduções, títulos de gráficos, rótulos). Tem cabeçalho YAML validado e cita análises, leituras e conclusões da metodologia pelo id | Os dados, a análise e os textos de conclusão |

Os templates dos três arquivos estão em `docs/template/` e os schemas que os validam, em `lib/report/schemas/`. Template e schema mudam juntos: ao alterar um, altere o outro no mesmo PR, e atualize também o guia para quem preenche (`docs/guia-de-preenchimento.md`).

### Saída gerada: `app/reports/<slug>/` (ADR-003 e ADR-004)

- `composicao.json`: seções, blocos do catálogo, vínculo com tabelas e campos do `data.json` e a análise da metodologia que justifica cada bloco. Não traz textos nem estilo; o renderizador lê os textos no guideline e na metodologia. É validada por `lib/report/schemas/composicao.schema.json` antes do build e revisada pelo desenvolvedor. Exemplo: `app/reports/impacto-restricoes-ue/composicao.json`.
- `page.tsx`: página fina, com metadados e a chamada ao renderizador.
- `components/`: só quando o `guideline.md` pede um componente próprio. Fica isolado no estudo.

### Regras para quem gera um estudo (pessoa ou agente)

1. Valide as três entradas antes de gerar. Se faltar algo ou houver inconsistência, pare e diga o que falta. Exemplos: tabela ou campo citado que não existe no `data.json`, ou análise citada que não está na metodologia.
2. Não faça cálculos sobre os dados. Todo número exibido vem do `data.json` como está.
3. Não redija textos. O texto de análise vem das leituras e conclusões da `metodologia.md`, e os valores dos marcadores vêm do `data.json`, formatados por `lib/report/format.ts`. Os textos de interface vêm do `guideline.md`.
4. Use só componentes do kit ou componentes próprios declarados no `guideline.md`. Não monte layout arbitrário.
5. Pedidos de ajuste viram mudança no `guideline.md` e nova geração, nunca edição solta na página.
6. Não altere as entradas do cientista. Se uma delas estiver errada, aponte o erro no PR.
7. Antes do PR, rode lint, typecheck, build e `npm run validar -- <slug>` e confira os números exibidos contra o `data.json`.

## Pendências conhecidas

- As questões abertas estão no PRD (Q9 e Q14 a Q23). Entre elas estão as guidelines de design, o acesso ao preview e o registro de aprovação. Não decida nenhuma delas no código sem registrar a decisão no PRD (seção 11) ou em ADR.
- A esteira roda hoje no modo piloto: o desenvolvedor executa as skills numa sessão local do Claude Code. A meta é o workflow no PR (`docs/fluxo-da-esteira.md`).
- A validação (`scripts/validacao.mjs`) e as skills descrevem as mesmas regras. Ao mudar uma regra, mude as duas no mesmo PR, junto com o schema e o template, se for o caso.