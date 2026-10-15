---
name: 06-abrir-pr
description: Cria o branch e o pull request de um estudo gerado, com um resumo do que foi gerado, o resultado da conferência e o link do preview da Vercel. Use ao fim da geração, depois de 05-conferir-report aprovar o estudo.
---

# 06-abrir-pr

## Objetivo

Levar o estudo gerado para revisão do desenvolvedor e homologação no preview da Vercel, que é criado por PR (PRD, RF-11 e Q6). O PR também guarda a rastreabilidade entre o conjunto, a composição e o resultado (RNF-03).

## Quando usar

Ao fim da primeira geração do estudo, depois de `05-conferir-report` aprovar. Ajustes posteriores entram no mesmo PR por `07-aplicar-ajuste`.

Esta etapa é candidata a script determinístico (ADR-005; PRD, Q11).

## Entrada

- O estudo gerado em `app/reports/<slug>/` e o conjunto em `content/reports/<slug>/`.
- O resumo da composição produzido por `02-compor-report`.
- O resumo dos componentes próprios produzido por `03-gerar-componente`, se houver.
- O relatório de conferência aprovado de `05-conferir-report`.

## Pré-requisitos

Pare se o relatório de conferência não estiver aprovado (CLAUDE.md, regra 7).

## Procedimento

1. Crie, a partir da `main`, um branch dedicado ao estudo. Nunca faça commit nem push na `main`, porque todo push nela vai para produção.
2. Faça o commit no padrão Conventional Commits em português, por exemplo `feat: adiciona estudo <slug>`.
3. Abra o PR contra a `main`, com a descrição escrita em português e contendo:
   - slug e título do estudo;
   - os arquivos do conjunto usados e os arquivos gerados;
   - o resumo da composição: seções, blocos, dados de cada bloco e a análise da metodologia que o justifica;
   - os componentes próprios gerados, se houver, e o motivo;
   - o relatório de conferência;
   - os erros encontrados nas entradas do cientista, para correção (CLAUDE.md, regra 6);
   - os pontos que pedem atenção do desenvolvedor, como diferenças sinalizadas sobre ajustes manuais (RF-16).
4. Inclua o link do preview quando a Vercel o publicar no PR.

## Saída

O PR aberto e o link do preview para homologação.

## Regras

- Não faça merge nem aprove o PR. O merge é sempre humano, depois da revisão e da aprovação registrada (PRD, RF-13).
- Não divulgue o link do preview fora do PR (RNF-05).
- Não inclua credenciais nem dados que não sejam destinados à publicação (RNF-09).
