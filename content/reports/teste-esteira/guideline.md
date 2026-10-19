---
slug: teste-esteira
sobretitulo: Estudo de teste · Esteira de publicação
titulo: Estudo de teste da esteira
subtitulo: Um estudo fictício, usado só para testar a geração automática de reports.
seo:
  descricao: Estudo fictício usado para testar a esteira de publicação de estudos.
meta:
  - rotulo: Recorte principal
    leitura: recorte-principal
tabelas:
  resumo:
    campos: [vendas_total, volume_total, maior_regiao, vendas_maior_regiao]
  vendas_regiao:
    campos: [regiao, vendas, volume]
rotulos:
  vendas_total: Vendas · 1º semestre
  volume_total: Volume · 1º semestre
  maior_regiao: Maior região
  regiao: Região
  vendas: Vendas
  volume: Volume
secoes:
  - id: visao-geral
    sobretitulo: Visão geral
    titulo: O semestre em números
    intro: Indicadores consolidados do primeiro semestre de 2026.
    analises:
      - id: total-semestre
        indicadores:
          - campo: vendas_total
            detalhe: detalhe-vendas
          - campo: volume_total
            detalhe: detalhe-volume
          - campo: maior_regiao
            detalhe: detalhe-maior-regiao
  - id: regioes
    sobretitulo: Regiões
    titulo: Onde se concentram as vendas
    intro: Ranking das regiões por valor vendido no semestre.
    analises:
      - id: ranking-regioes
        titulo: Vendas por região
        descricao: As cinco regiões, da maior para a menor.
    conclusoes:
      - id: lideranca-regional
        titulo: Destaque
        tipo: destaque
  - id: como-interpretar
    sobretitulo: Como interpretar
    titulo: Dados de teste
    ressalvas: [dados-ficticios]
visual:
  indicadores: Três cartões lado a lado
  ranking: Barras horizontais com as cinco regiões, a maior no topo
componentes_novos: []
---

# Guideline: Estudo de teste da esteira

## visao-geral
Três cartões de `total-semestre`, na ordem de `indicadores`: vendas, volume e maior região. O volume mostra a unidade.

## regioes
Um ranking de `ranking-regioes` com as cinco regiões por vendas e o volume no detalhe ao passar o mouse. Abaixo, a conclusão `lideranca-regional` em destaque.

## como-interpretar
Nota final com a ressalva `dados-ficticios`.
