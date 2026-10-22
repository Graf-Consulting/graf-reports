---
# Responde: como usar os dados corretamente e o que é verdade. Não fala de layout, cor ou componente.
# Slug e título ficam no guideline.md; data de referência, período e fontes ficam no metadata do data.json.
analises:                              # cada análise tem um id que o guideline.md cita
  - id: <id-em-kebab-case>
    titulo: <Nome da análise>
    tabelas:                           # campos do data.json que a análise usa, no mesmo formato de tabelas.<tabela>.campos do data.json
      <tabela>:
        campos: [<campo>, <campo>]
leituras:                              # textos que não são conclusão: apresentação, contexto de um resultado, como interpretar, e também textos curtos como o detalhe de um indicador ou uma informação do topo
  - id: <l1>
    analise: <id-da-analise>           # opcional; omita em textos gerais do estudo
    texto: "<Texto aprovado pelo cientista; todo valor vindo dos dados entra como marcador, por exemplo {v1}>"   # sempre entre aspas
    valores:                           # um item por marcador do texto; mesmo formato das conclusões
      - id: <v1>
        tabela: <tabela>
        campo: <campo>
        filtro: { <campo>: <valor> }
        formato: <formato>
conclusoes:                            # texto que pode aparecer no report, já aprovado pelo cientista
  - id: <c1>
    analise: <id-da-analise>
    texto: "Em 2026, {pais} é o principal mercado, com {valor_pais}."   # sempre entre aspas
    valores:                           # um item por marcador do texto; o report preenche com o valor do data.json
      - id: <v1>                       # nome do marcador, sem as chaves
        tabela: <tabela>
        campo: <campo>
        filtro: { <campo>: <valor> }   # opcional; sem filtro, a tabela deve ter uma linha só
        formato: <formato>             # texto (valor como está) ou um formatador de lib/report/format.ts: compact, inteiro, decimal, fob, cleanLabel
ressalvas:                             # todas aparecem no report: na seção que o guideline indicar, na seção da análise ligada ou, sem análise, ao final
  - id: <r1>
    analise: <id-da-analise>           # opcional; omita em ressalvas gerais do estudo
    texto: "<Limite ou cuidado de leitura que o report deve mostrar>"   # sempre entre aspas
    valores: []                        # opcional; um item por marcador, no mesmo formato das conclusões
# Regras dos textos:
# - O texto vai sempre entre aspas, porque marcadores e dois-pontos quebram o YAML sem elas.
# - Nenhum número ou nome vindo dos dados é escrito à mão no texto; ele entra como marcador.
# - Trechos entre ** saem em negrito no report, por exemplo "**Plano Nacional de Logística**".
# - Percentuais, participações e variações vêm prontos no data.json, como campos. O report não calcula.
# - Números que não vêm dos dados (o ano de um recorte, "os 10 maiores") podem ser escritos no texto.
---

# Metodologia: <Título do estudo>

<Um parágrafo: de onde vêm os dados e o que o estudo mede.>

## Fontes
<Descrição de cada fonte listada em metadata.fontes do data.json: o que é, data, como foi obtida.>

## Análises

### <Nome da análise>
<!-- Uma subseção por análise do cabeçalho, com título igual ao `titulo` dela. -->
<Como a análise é feita, a fórmula de cada indicador, unidades, recortes e filtros. Diga quais campos usar e quais não usar.>

## Leituras
<Contexto das leituras do cabeçalho, se precisar. O report só usa os textos que estiverem lá.>

## Conclusões
<Contexto das conclusões do cabeçalho. O report só afirma o que estiver lá.>

## Ressalvas
<Detalhe das ressalvas do cabeçalho.>
