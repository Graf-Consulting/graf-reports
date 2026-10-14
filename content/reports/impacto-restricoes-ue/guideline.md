---
slug: impacto-restricoes-ue
sobretitulo: Análise de comércio exterior · União Europeia
titulo: Impacto da suspensão das importações de carnes e produtos de origem animal do Brasil pela União Europeia
subtitulo: Um retrato dos fluxos comerciais potencialmente expostos às restrições, conectando a origem da carga, os corredores de saída e os mercados consumidores europeus.
seo:
  titulo: Impacto das restrições da União Europeia | GRAF Infra Consulting
  descricao: Análise de exposição das exportações brasileiras de produtos de origem animal às restrições da União Europeia.
meta:
  - rotulo: Recorte principal
    leitura: recorte-principal
tabelas:
  summary:
    campos: [fob_2026, kg_2026, top_country, top_country_fob, top_state, top_state_fob]
  countries26:
    campos: [pais_destino, vl_fob, kg_liquido]
  states26:
    campos: [uf_origem_carga, vl_fob, kg_liquido]
  monthly_product:
    campos: [periodo, nome_simplificado_antaq, vl_fob, kg_liquido]
  monthly_state:
    campos: [periodo, uf_origem_carga, vl_fob, kg_liquido]
  monthly_rfb:
    campos: [periodo, unidade_rfb, vl_fob, kg_liquido]
  sankey:
    campos: [ano, uf_origem_carga, unidade_rfb, pais_destino, vl_fob, kg_liquido]
rotulos:
  vl_fob: Valor FOB
  kg_liquido: Peso líquido
  nome_simplificado_antaq: Mercadoria
  uf_origem_carga: Estado de origem
  unidade_rfb: Unidade da RFB
  pais_destino: País de destino
  ano: Ano
  fob_2026: Valor FOB · 2026
  kg_2026: Peso líquido · 2026
  top_country: Principal destino
  top_state: Principal origem
secoes:
  - id: mensagem-chave
    analises:
      - id: exposicao-2026
    leituras: [mensagem-chave]
  - id: visao-executiva
    sobretitulo: Visão executiva
    titulo: Onde se concentra a exposição
    intro: Indicadores consolidados para 2026. O objetivo é destacar os pontos de maior dependência na cadeia exportadora antes de detalhar destinos, origens e unidades de despacho.
    analises:
      - id: exposicao-2026
        indicadores:
          - campo: fob_2026
            detalhe: detalhe-fob-2026
          - campo: kg_2026
            detalhe: detalhe-kg-2026
          - campo: top_country
            detalhe: detalhe-principal-destino
          - campo: top_state
            detalhe: detalhe-principal-origem
  - id: mercados-e-origens
    sobretitulo: Mercados e origens
    titulo: Países consumidores e estados de origem
    intro: Rankings por valor FOB em 2026, úteis para identificar os principais mercados expostos e a concentração territorial da produção exportada.
    analises:
      - id: ranking-destinos
        titulo: Países de destino
        descricao: Principais consumidores europeus por valor FOB.
      - id: ranking-origens
        titulo: Estados de origem
        descricao: Unidades federativas com maior valor exportado.
    conclusoes:
      - id: prioridade-mercado-origem
        titulo: Leitura prioritária
        tipo: destaque
  - id: evolucao-dos-fluxos
    sobretitulo: Evolução dos fluxos
    titulo: Mercadorias, origens e unidades da RFB
    intro: A evolução mensal mostra a composição dos fluxos em todo o período disponível. Use os controles para alterar a dimensão de análise e o indicador apresentado.
    analises:
      - id: evolucao-mensal
  - id: rede-logistica
    sobretitulo: Rede logística
    titulo: Da origem ao mercado europeu
    intro: "Fluxos agregados em três camadas: estado de origem, unidade da Receita Federal do Brasil e país de destino. A largura das conexões representa o indicador selecionado."
    analises:
      - id: fluxo-logistico
  - id: como-interpretar
    sobretitulo: Como interpretar
    titulo: Exposição não é previsão de perda
    leituras: [como-interpretar]
    ressalvas: [excecoes-sanitarias, redirecionamento, aproximacao-ncm]
visual:
  rankings: Barras horizontais com os 10 maiores valores, o maior no topo; destinos e origens lado a lado
  serie_mensal: Área empilhada por mês
  fluxo: Diagrama de fluxo em três camadas
componentes_novos: []
---

# Guideline: Impacto da suspensão das importações pela União Europeia

## mensagem-chave
Destaque logo abaixo do topo com o valor FOB de 2026 (`fob_2026`) em evidência e a leitura `mensagem-chave` ao lado.

## visao-executiva
Quatro cartões lado a lado, na ordem de `indicadores`, cada um com uma cor de destaque diferente.

## mercados-e-origens
Dois rankings lado a lado, `ranking-destinos` e `ranking-origens`, com os 10 maiores por valor FOB e o peso líquido no detalhe ao passar o mouse. Abaixo, a conclusão `prioridade-mercado-origem` em destaque.

## evolucao-dos-fluxos
Uma série mensal (`evolucao-mensal`). O leitor alterna a dimensão (mercadoria, estado de origem ou unidade da RFB) e o indicador (valor FOB ou peso líquido). Começa em mercadoria e valor FOB. Os nomes das unidades da RFB aparecem sem o código numérico.

## rede-logistica
Fluxo em três camadas (`fluxo-logistico`): estado de origem, unidade da RFB e país de destino. O leitor alterna o indicador (peso líquido ou valor FOB) e o ano (todo o período ou 2026). Começa em peso líquido e todo o período. Os nomes das unidades da RFB aparecem sem o código numérico.

## como-interpretar
Nota final com a leitura `como-interpretar` e as três ressalvas em lista.
