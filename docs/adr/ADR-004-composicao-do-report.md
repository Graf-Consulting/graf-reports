# ADR-004 — Composição do report em composicao.json, gerada pelo agente e validada por esquema

| | |
|---|---|
| **Tipo** | Arquitetura |
| **Status** | Vigente |
| **Data da decisão** | 02/10/2026 |
| **Decidido por** | IA GRAF |
| **Ciente** | A definir |
| **Relacionados** | PRD: Publicação automatizada de estudos, Q3, Q4 e Q10 · ADRs: ADR-002, ADR-003, ADR-005 |

## Contexto

Os reports são compostos a partir de um kit de componentes e das guidelines da plataforma, e cada estudo define quais componentes usa e como eles se ligam aos dados. Sem uma definição estruturada, a única representação da composição é o código que o agente escreve. Isso causa seis problemas:

- **Revisão:** só um desenvolvedor consegue ver quais blocos e dados o report usa.
- **Validação:** componente inexistente ou campo errado só aparece no build ou na tela.
- **Reprodutibilidade:** cada nova geração pode mudar o layout inteiro.
- **Ajustes:** "trocar este gráfico por barras" vira reescrita de código.
- **Evolução do kit:** não há como saber quais estudos usam qual componente.
- **Rastreabilidade:** nada liga um bloco à análise da metodologia que o justifica.

Blocos do estudo atual e o que pode virar kit (base para a Q10 do PRD):

| Bloco | Reutilizável como | Específico do estudo |
|---|---|---|
| Hero | Componente com props de texto | Textos e fonte dos dados |
| Mensagem-chave | Componente | Texto e valor escolhido |
| Cabeçalho de seção (5×) | Componente | Textos |
| Cartões de indicadores | Componente com lista de indicadores | Quais indicadores |
| Ranking (top 10) | Gráfico parametrizado por tabela, dimensão, métrica e N | Colunas usadas |
| Série temporal empilhada | Gráfico parametrizado com filtros | As três dimensões |
| Fluxo (Sankey) | Gráfico parametrizado por camadas | Camadas, cores, filtro de ano |
| Leitura prioritária | Componente de destaque | Frase e campos |
| Como interpretar | Componente | Texto e ressalvas |
| Base técnica | Tokens e utilitários, incluindo a limpeza de rótulos (`cleanLabel`) | — |

## Decisão

A composição de cada estudo é o arquivo `app/reports/<slug>/composicao.json`, gerado pelo agente a partir de `metodologia.md`, `guideline.md`, `data.json` e do catálogo do kit, e validado por JSON Schema antes do build. O desenvolvedor revisa a composição gerada; a edição humana fica no `guideline.md` (modelo "gerada e revisada").

A composição contém: seções em ordem, blocos (tipo de bloco do catálogo e posição), vínculo com dados (tabela, dimensão, métricas, ordenação, top N), interação (controles e padrões), formato de número, referência pelo id às leituras, conclusões e ressalvas da metodologia que o bloco exibe, a análise atendida por cada bloco e componentes próprios do estudo. A composição não traz textos: os de análise ficam na metodologia e os de interface (títulos, introduções, rótulos), no guideline, e o renderizador os lê na origem. Agregações e estilo visual ficam fora dela; cores e estilos vêm de `lib/report/tokens.ts`.

O catálogo do kit é o conjunto de tipos de bloco definidos no schema da composição, em `lib/report/schemas/`. Um bloco agrupa os componentes usados num caso de uso (por exemplo, moldura de gráfico, gráfico de ranking e controles). O comportamento de blocos existentes não muda: um componente pode ganhar props novas, sempre opcionais e com padrão igual ao comportamento atual, e uma necessidade que não cabe nisso vira um bloco novo. Estudos publicados não são regerados, a não ser por pedido explícito (PRD, Q10).

Consumo no build:

1. A página do estudo lê o `composicao.json` de `app/reports/<slug>/` e o `data.json` e os cabeçalhos YAML da `metodologia.md` e do `guideline.md` de `content/reports/<slug>/`.
2. A composição é validada contra o esquema do kit (componentes existem, propriedades corretas) e contra o `data.json` (tabelas e campos existem).
3. Um renderizador percorre seções e blocos e, por um registro de componentes, liga cada tipo ao componente do kit, passando a fatia de dados. Ele busca os textos de interface no guideline e os de análise na metodologia, e preenche os marcadores com os valores do `data.json`, no formato declarado (ADR-002).
4. A página só chama o renderizador; não há layout escrito à mão.
5. Componentes próprios do estudo, em `app/reports/<slug>/components/`, entram num registro local.

O agente atua só antes, ao gerar o `composicao.json`; do arquivo em diante tudo é determinístico.

## Alternativas consideradas

| Opção | Por que não |
|---|---|
| YAML com esquema | A vantagem é a leitura humana, mas ninguém edita a composição à mão; traz tipagem fraca e leitor extra |
| Configuração em TypeScript tipada | Menos acessível a não desenvolvedores e permite código arbitrário se não for restringida |
| Página TSX ou MDX só com componentes do kit | A composição volta a ser código: revisão só por desenvolvedor e menos reprodutível |
| Sem definição explícita | Contraria a decisão de não gerar página arbitrária |
| Híbrido (declarativo + TSX) | Duas formas de compor para manter; componentes próprios já cobrem as exceções |
| Composição como entrada humana | Exigiria que o cientista conhecesse o kit; o `guideline.md` cumpre esse papel em nível de intenção |

## Consequências

**Positivas**
- Composição revisável sem ler código e validada antes do build.
- Ajustes localizados e reprodutibilidade da página.
- Mapa de uso dos componentes do kit por estudo.

**Negativas / trade-offs**
- Esquema, renderizador e registro de componentes passam a ser mantidos.
- Risco técnico: a composição crescer até virar uma linguagem própria. Mitigação: o esquema só permite escolher e ligar componentes; agregação fica no `data.json` e lógica no kit.

**Passa a ser obrigatório**
- Nenhuma página de estudo com layout escrito à mão.
- O comportamento de blocos e componentes existentes do kit não muda. Props novas são opcionais, com padrão igual ao comportamento atual, e entram no schema da composição junto com o componente. O mesmo vale para um bloco novo.
- Estudos publicados não são regerados, a não ser por pedido explícito.

## Revisitar quando

A composição precisar de lógica que o esquema não expressa em mais de um estudo, ou o piloto mostrar composições muito diferentes para a mesma entrada.
