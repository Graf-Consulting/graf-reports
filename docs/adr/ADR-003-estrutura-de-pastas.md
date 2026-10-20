# ADR-003 — Estrutura de pastas: entradas em content/, código em app/

| | |
|---|---|
| **Tipo** | Arquitetura |
| **Status** | Vigente |
| **Data da decisão** | 02/10/2026 |
| **Decidido por** | IA GRAF |
| **Ciente** | A definir |
| **Relacionados** | PRD: Publicação automatizada de estudos, Q5 · ADRs: ADR-001 (atualiza a seção Diagrama), ADR-002, ADR-004 |

## Contexto

Hoje cada estudo vive em `app/reports/<slug>/` com três arquivos: `page.tsx` (metadados de SEO), `report.tsx` (416 linhas com layout, cores e gráficos) e `data.ts` (cerca de 8,6 mil linhas de dados embutidos). Os únicos compartilhados são `Header`, `Footer`, `app/layout.tsx` e `app/globals.css`. O README e o ADR-001 citam uma pasta `report-1` que não existe mais.

Com a esteira, cada estudo passa a ter um conjunto entregue pelo cientista (ADR-002) e um código gerado pelo agente. É preciso definir onde cada parte fica sem ferir o isolamento do ADR-001.

## Decisão

```
content/reports/<slug>/      entregue pelo cientista
  data.json
  metodologia.md
  guideline.md
app/reports/<slug>/          gerado pelo agente
  page.tsx                   página fina: metadados + renderizador
  composicao.json            gerada pelo agente (ADR-004)
  components/                só se o estudo precisar de componente próprio
components/
  layout/                    Header, Footer
  report/                    blocos de página do kit
  charts/                    gráficos do kit
lib/report/                  tokens, formatadores, schemas/ (inclui o catálogo de blocos) e renderizador/
docs/guidelines/             guidelines de design e técnicas da plataforma
```

Cada estudo tem uma pasta por slug em cada lado, sem subpastas separando estudos. A página lê os dados no build com `import data from '@/content/reports/<slug>/data.json'`.

Destino do que hoje está no estudo atual:

| Hoje | Destino |
|---|---|
| Paleta e cores fixas no `report.tsx` | Tokens de design no tema global |
| Layout base, configuração e carregamento do Plotly | Componente base de gráfico no kit |
| Ranking, série empilhada e Sankey | Gráficos parametrizados no kit |
| Hero, mensagem-chave, cabeçalho de seção, indicadores, destaque, nota metodológica | Blocos de página no kit |
| Formatadores de número | Utilitários do kit |
| `cleanRfb` | Utilitário do kit `cleanLabel` em `lib/report/format.ts`, aplicado como formato pela composição só quando os rótulos não chegam limpos no `data.json`; o ideal é que cheguem limpos |
| Nomes de colunas | Composição do estudo |
| `data.ts` | `content/reports/<slug>/data.json` |
| Metadados de SEO no `page.tsx` | Cabeçalho do `guideline.md`, repassado à composição |

## Alternativas consideradas

| Opção | Por que não |
|---|---|
| Tudo em `app/reports/<slug>/` (entradas numa subpasta) | Mistura entradas com código; dono por pasta e gatilho da geração ficam menos claros; arquivos não-código dentro de `app/` |
| Composição em código (`report.tsx` só com componentes do kit) | A composição não fica revisável sem ler código e enfraquece a reprodutibilidade |
| Pasta `db/<slug>/` para as entradas | O nome sugere banco de dados; são arquivos versionados |

## Consequências

**Positivas**
- Dono claro por pasta: cientista em `content/`, agente em `app/`.
- Uma mudança em `content/reports/<slug>/` pode disparar a geração.
- `app/` fica só com código e rotas.

**Negativas / trade-offs**
- O estudo fica em duas pastas; o mesmo slug nas duas mantém a ligação.

**Passa a ser obrigatório**
- Nenhum arquivo fora de `app/reports/<slug>/` importa `content/reports/<slug>/`. Exceção (20/10/2026): a página raiz (`app/page.tsx`) lê só o `metadata` do `data.json` de cada estudo, no build, para redirecionar ao estudo mais recente (maior `data_referencia`; empate pelo slug). O site continua sem menu ou índice de estudos (ADR-001).
- README e seção Diagrama do ADR-001 atualizados com esta estrutura.

## Revisitar quando

A validação técnica mostrar que importar arquivos de `content/` quebra a exportação estática, ou um estudo precisar de mais de uma página. A raiz que abre o estudo mais recente é provisória: o ideal é que a entrada dos estudos seja a página de cards de estudos da outra plataforma da GRAF, e a raiz deve ser revista quando isso acontecer.
