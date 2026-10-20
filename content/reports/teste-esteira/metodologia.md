---
analises:
  - id: total-semestre
    titulo: Total do semestre
    tabelas:
      resumo:
        campos: [vendas_total, volume_total, maior_regiao, vendas_maior_regiao]
  - id: ranking-regioes
    titulo: Ranking de regiões
    tabelas:
      vendas_regiao:
        campos: [regiao, vendas, volume]
leituras:
  - id: recorte-principal
    texto: "Primeiro semestre de 2026"
  - id: detalhe-vendas
    analise: total-semestre
    texto: "Soma das cinco regiões"
  - id: detalhe-volume
    analise: total-semestre
    texto: "Volume vendido no semestre"
  - id: detalhe-maior-regiao
    analise: total-semestre
    texto: "{valor} em vendas"
    valores:
      - id: valor
        tabela: resumo
        campo: vendas_maior_regiao
        formato: fob
conclusoes:
  - id: lideranca-regional
    analise: ranking-regioes
    texto: "O {regiao} lidera as vendas do semestre, com {valor}."
    valores:
      - id: regiao
        tabela: resumo
        campo: maior_regiao
        formato: texto
      - id: valor
        tabela: resumo
        campo: vendas_maior_regiao
        formato: fob
ressalvas:
  - id: dados-ficticios
    texto: "Os dados deste estudo são fictícios e servem só para testar a esteira de publicação."
---

# Metodologia: Estudo de teste da esteira

Estudo fictício, usado para testar a geração automática no workflow do GitHub. Os dados não representam nenhuma medição real.

## Fontes

Dados fictícios, criados à mão para o teste.

## Análises

### Total do semestre
Valor e volume vendidos no primeiro semestre de 2026, somados nas cinco regiões, e a região com maior valor vendido. Os totais já vêm calculados na tabela `resumo`.

### Ranking de regiões
Valor vendido por região no primeiro semestre de 2026 (`vendas_regiao`), com o volume no detalhe. A ordenação é pelo valor.

## Leituras

Textos curtos que acompanham os indicadores do semestre.

## Conclusões

A região Sudeste concentra a maior parte das vendas.

## Ressalvas

Os dados são fictícios.
