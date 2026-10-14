---
analises:
  - id: exposicao-2026
    titulo: Exposição comercial em 2026
    tabelas:
      summary:
        campos: [fob_2026, kg_2026, top_country, top_country_fob, top_state, top_state_fob]
  - id: ranking-destinos
    titulo: Ranking de países de destino
    tabelas:
      countries26:
        campos: [pais_destino, vl_fob, kg_liquido]
  - id: ranking-origens
    titulo: Ranking de estados de origem
    tabelas:
      states26:
        campos: [uf_origem_carga, vl_fob, kg_liquido]
  - id: evolucao-mensal
    titulo: Evolução mensal dos fluxos
    tabelas:
      monthly_product:
        campos: [periodo, nome_simplificado_antaq, vl_fob, kg_liquido]
      monthly_state:
        campos: [periodo, uf_origem_carga, vl_fob, kg_liquido]
      monthly_rfb:
        campos: [periodo, unidade_rfb, vl_fob, kg_liquido]
  - id: fluxo-logistico
    titulo: Fluxo da origem ao mercado europeu
    tabelas:
      sankey:
        campos: [ano, uf_origem_carga, unidade_rfb, pais_destino, vl_fob, kg_liquido]
leituras:
  - id: mensagem-chave
    analise: exposicao-2026
    texto: "O valor FOB observado em 2026 para os produtos considerados no recorte representa a exposição comercial potencial aos efeitos da restrição. A leitura deve orientar priorização de mercados, corredores logísticos e estratégias de redirecionamento da carga."
  - id: recorte-principal
    texto: "2026"
  - id: detalhe-fob-2026
    analise: exposicao-2026
    texto: "Produtos incluídos no recorte"
  - id: detalhe-kg-2026
    analise: exposicao-2026
    texto: "Volume potencialmente exposto"
  - id: detalhe-principal-destino
    analise: exposicao-2026
    texto: "{fob_pais} em valor FOB"
    valores:
      - id: fob_pais
        tabela: summary
        campo: top_country_fob
        formato: fob
  - id: detalhe-principal-origem
    analise: exposicao-2026
    texto: "{fob_estado} em valor FOB"
    valores:
      - id: fob_estado
        tabela: summary
        campo: top_state_fob
        formato: fob
  - id: como-interpretar
    texto: "Os resultados representam exportações históricas incluídas no recorte de mercadorias potencialmente afetadas. Eles não estimam, por si só, a perda econômica efetiva decorrente das restrições."
conclusoes:
  - id: prioridade-mercado-origem
    analise: exposicao-2026
    texto: "Em 2026, {pais} é o principal mercado no recorte, com {fob_pais}. Entre as origens, {estado} concentra o maior valor FOB, com {fob_estado}. Esses dois pontos devem ser priorizados em cenários de mitigação de impacto."
    valores:
      - id: pais
        tabela: summary
        campo: top_country
        formato: texto
      - id: fob_pais
        tabela: summary
        campo: top_country_fob
        formato: fob
      - id: estado
        tabela: summary
        campo: top_state
        formato: texto
      - id: fob_estado
        tabela: summary
        campo: top_state_fob
        formato: fob
ressalvas:
  - id: excecoes-sanitarias
    texto: "Podem existir exceções sanitárias, contratos vigentes, cargas em trânsito e estoques."
  - id: redirecionamento
    texto: "Os fluxos podem ser redirecionados para outros mercados."
  - id: aproximacao-ncm
    texto: "A classificação por NCM é uma aproximação analítica do escopo regulatório."
---

# Metodologia: Impacto da suspensão das importações de carnes e produtos de origem animal do Brasil pela União Europeia

O estudo mede as exportações brasileiras de carnes e produtos de origem animal para a União Europeia que ficam potencialmente expostas à suspensão das importações. Os dados vêm do Comex Stat e cobrem de janeiro de 2025 a julho de 2026, com 2026 como recorte principal.

<!-- A COMPLETAR pelo cientista: lista de NCMs do recorte e critério de inclusão. -->

## Fontes

Comex Stat, base pública de comércio exterior do Ministério do Desenvolvimento, Indústria, Comércio e Serviços, com exportações por NCM, unidade federativa de origem, unidade da Receita Federal de despacho e país de destino.

<!-- A COMPLETAR pelo cientista: data da extração (no data.json está 2026-09-10, data em que os dados entraram no repositório) e consulta usada. -->

## Análises

### Exposição comercial em 2026
Soma do valor FOB e do peso líquido exportados em 2026 para os produtos do recorte, com o país de destino e a unidade federativa de origem de maior valor FOB. Os totais já vêm calculados na tabela `summary`.

<!-- A COMPLETAR pelo cientista: confirmação das fórmulas. -->

### Ranking de países de destino
Valor FOB e peso líquido de 2026 por país de destino na União Europeia (`countries26`). A ordenação é pelo valor FOB.

### Ranking de estados de origem
Valor FOB e peso líquido de 2026 por unidade federativa de origem da carga (`states26`). A ordenação é pelo valor FOB.

### Evolução mensal dos fluxos
Valor FOB e peso líquido por mês, em todo o período, abertos por mercadoria (`monthly_product`), por unidade federativa de origem (`monthly_state`) e por unidade da Receita Federal de despacho (`monthly_rfb`).

### Fluxo da origem ao mercado europeu
Valor FOB e peso líquido por ano, em três camadas: unidade federativa de origem, unidade da Receita Federal de despacho e país de destino (`sankey`).

## Leituras

A mensagem-chave liga o valor de 2026 à exposição potencial. As leituras curtas dizem o recorte principal do estudo e como ler cada indicador de 2026. O texto de interpretação deixa claro que o estudo descreve fluxos históricos e não estima perda.

## Conclusões

A conclusão aponta o principal mercado e a principal origem de 2026 como prioridades em cenários de mitigação.

## Ressalvas

As ressalvas valem para o estudo inteiro e não estão ligadas a uma análise específica.
