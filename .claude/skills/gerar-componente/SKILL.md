---
name: gerar-componente
description: Cria um componente próprio de um estudo em app/reports/<slug>/components/ quando o estudo precisa de algo que o kit não cobre, seguindo as guidelines da plataforma e os componentes do kit como exemplo, e o registra na composição. A necessidade vem de componentes_novos no guideline.md ou de algo no guideline que nenhum componente do kit cobre.
---

# gerar-componente

## Objetivo

Atender a uma necessidade de apresentação que o kit não cobre, com um componente isolado na pasta do estudo e coerente com o kit e as guidelines (PRD, RF-15).

## Quando usar

Quando o estudo precisa de um componente que não existe no kit:

- o cabeçalho do `guideline.md` tem itens em `componentes_novos`;
- `compor-report` reservou um bloco porque o kit não cobre o que o guideline pede, inclusive depois de uma atualização do guideline para atender a um ajuste.

Roda depois de o bloco estar reservado na composição.

## Entrada

- O que motiva o componente: o item de `componentes_novos` ou o trecho do `guideline.md` que o kit não cobre.
- `app/reports/<slug>/composicao.json`, com o bloco reservado.
- Guidelines da plataforma em `docs/guidelines/`.
- Componentes do kit em `components/report/` e `components/charts/`, como exemplo de padrão.
- `content/reports/<slug>/data.json`, para conhecer as tabelas e os campos que o componente recebe.

## Pré-requisitos

Pare e diga o que falta se:

- as guidelines da plataforma não existem (PRD, Q9 e Q14);
- não existe o registro local de componentes do estudo no renderizador (ADR-004, consumo no build, passo 5).

Se um componente do kit já atende ao pedido, não gere nada. Aponte isso no resultado e deixe a decisão para o desenvolvedor. O ADR-001 exige usar o kit sempre que houver solução adequada.

## Procedimento

1. Leia o pedido do guideline e o bloco reservado na composição.
2. Escolha no kit o componente mais próximo e use-o como modelo de estrutura e de props.
3. Escreva o componente em `app/reports/<slug>/components/`, seguindo as convenções do repositório:
   - recebe linhas de dados e nomes de coluna por props;
   - usa cores de `lib/report/tokens.ts` e nunca hex solto;
   - formata números com `lib/report/format.ts`, em pt-BR;
   - leva `'use client'` se tiver estado ou gráfico;
   - gráficos são montados sobre `PlotlyChart` do kit;
   - faz importações com o alias `@/*`.
4. Registre o componente no registro local do estudo e confirme que o bloco da composição aponta para ele.
5. Se o arquivo do componente já existir, não sobrescreva sem aviso. Mostre a diferença e sinalize um possível ajuste manual (RF-16).

## Saída

- O componente em `app/reports/<slug>/components/`.
- O registro local e o vínculo na composição atualizados.
- Um resumo para o PR: o que o componente faz, por que o kit não cobria e qual componente do kit serviu de modelo.

## Regras

- O componente fica só na pasta do estudo. Não altere `components/`, `lib/report/`, `app/layout.tsx` nem `app/globals.css`.
- O componente não importa nada de outro estudo e não é usado por outro estudo (ADR-001; RF-15).
- O componente não faz cálculos sobre os dados. Ele exibe o que recebe.
- Não promova o componente ao kit. Essa decisão é humana (PRD, Q22).
