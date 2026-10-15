# graf-reports

Site estático de estudos da GRAF Infra Consulting. Cada estudo é uma página independente, publicada na mesma aplicação Next.js e montada com um kit de componentes compartilhado ([ADR-001](docs/adr/ADR-001.md)).

Os estudos novos passam por uma esteira de publicação: o cientista entrega os dados, a metodologia e o guia de montagem, o agente gera a composição do report, e a página é montada por um renderizador a partir dela. O fluxo completo está em [docs/fluxo-da-esteira.md](docs/fluxo-da-esteira.md).

## Comandos

```bash
npm install
npm run dev          # servidor local; o estudo fica em /reports/<slug>
npm run lint
npx tsc --noEmit     # typecheck
npm run build        # export estático em out/
npm run validar      # valida as entradas e a composição de todos os estudos
npm run validar -- impacto-restricoes-ue   # valida um estudo
```

Todo push na `main` publica em produção na Vercel. As mudanças entram por PR, que ganha um preview da Vercel.

## Estrutura

```
app/
  layout.tsx, globals.css    compartilhados por todos os estudos
  reports/<slug>/            página de cada estudo: page.tsx e composicao.json
content/
  reports/<slug>/            entradas de cada estudo: data.json, metodologia.md, guideline.md
components/                  kit compartilhado: layout/, report/, charts/
lib/report/                  tokens, formatadores, schemas/ e renderizador/
docs/                        documentação (índice em docs/README.md)
.claude/skills/              skills do agente de geração
```

## Documentação

- [Índice da documentação](docs/README.md)
- [Guia de preenchimento do estudo](docs/guia-de-preenchimento.md), para quem prepara as entradas
- [Fluxo da esteira](docs/fluxo-da-esteira.md)
- [PRD da publicação automatizada](docs/PRD_publicacao-automatizada-de-estudos_v0.3.md)
- [Decisões de arquitetura (ADRs)](docs/adr/README.md)
- [CLAUDE.md](CLAUDE.md): regras do projeto para quem desenvolve, pessoa ou agente
