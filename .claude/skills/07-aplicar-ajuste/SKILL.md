---
name: 07-aplicar-ajuste
description: Trata um pedido de ajuste da homologação sobre um estudo com PR aberto. Classifica o pedido e, se for de apresentação, propõe a mudança no guideline.md como sugestão de alteração no PR ("suggested change"), que uma pessoa aceita com "Commit suggestion"; a nova geração roda sozinha. O guideline.md só muda quando um desenvolvedor pede explicitamente, e o agente nunca faz commit nas entradas no PR. Use quando um desenvolvedor pedir um ajuste mencionando @claude no PR, ou na sessão local.
---

# 07-aplicar-ajuste

## Objetivo

Transformar o pedido de ajuste numa nova versão do mesmo preview, sem recomeçar o fluxo e sem edição solta na página (PRD, RF-14). O ajuste entra pelo `guideline.md` e pela regeneração (CLAUDE.md, regra 5).

## Regra principal

**O `guideline.md` só muda quando um desenvolvedor pede explicitamente** (ADR-005):

- O agente nunca propõe mudança no guideline por conta própria, nem a partir de um pedido que não venha de um desenvolvedor.
- **No PR (modo A):** o agente responde com **sugestões de alteração**. A mudança só entra quando uma pessoa clica em "Commit suggestion", e o commit sai no nome dela. O agente nunca faz commit em `content/`; o workflow `Validação` reprova o PR se um commit de bot alterar `content/`.
- **Na sessão local (modo C):** o agente só edita o `guideline.md` se o desenvolvedor pedir explicitamente na sessão, mostrando a mudança antes da regeneração.

## Quando usar

- **No PR:** quando um desenvolvedor comenta no PR do estudo mencionando `@claude` com um pedido de ajuste, por exemplo: `@claude ajuste: o ranking de regiões deve mostrar só as 3 maiores`.
- **Na sessão local:** quando o desenvolvedor pede um ajuste de um estudo com PR aberto.

Quem pode acionar o `@claude` são as pessoas com permissão de escrita no repositório. Os stakeholders não usam o GitHub: um desenvolvedor registra o pedido no PR.

## Entrada

- O pedido de ajuste, como foi feito.
- O `slug` do estudo e o PR aberto.
- `content/reports/<slug>/guideline.md`, `metodologia.md` e `data.json`, só para leitura.
- `app/reports/<slug>/composicao.json`, para localizar o bloco ou a seção a que o pedido se refere.
- O diff do PR (`gh pr diff`), para saber em que linhas do guideline é possível sugerir alteração.

## Procedimento

1. **Classifique o pedido.**
   - **Apresentação.** Exemplos: trocar o tipo de gráfico, mudar o top N, reordenar seções, mudar destaque, título, rótulo ou visual. Pertence ao `guideline.md`. Siga para o passo 2.
   - **Análise ou dados.** Exemplos: nova métrica, outra conclusão, outro recorte, número que precisa mudar, texto de leitura ou conclusão. Pertence à `metodologia.md` ou ao `data.json`, que são do cientista. Responda que o pedido precisa voltar ao cientista, diga o que ele precisa mudar e pare (PRD, Q23).
   - **Ambíguo.** Responda com a dúvida e pare. Não suponha.
2. **Encontre o trecho do guideline.** Localize no cabeçalho ou no corpo do `guideline.md` a seção, a análise ou o texto que o pedido muda. Se o pedido citar um bloco, use a composição para chegar à análise e à seção do guideline.
3. **Proponha a mudança.**
   - **No PR:** para cada linha a mudar, crie um comentário em linha no `guideline.md` (ferramenta de comentário em linha), com o bloco de sugestão do GitHub:

     ````
     Pedido: mostrar só as 3 maiores regiões.
     ```suggestion
     Um ranking de `ranking-regioes` com as três maiores regiões por vendas e o volume no detalhe ao passar o mouse.
     ```
     ````

     Mude o mínimo necessário: uma sugestão por trecho, com o texto final da linha. Se a linha não estiver no diff do PR, o GitHub não aceita sugestão nela. Nesse caso, responda no PR com o trecho atual e o texto proposto, para uma pessoa editar.
   - **Na sessão local:** mostre a mudança proposta ao desenvolvedor. Só edite o arquivo se ele pedir explicitamente.
4. **Valide a proposta.** Confira mentalmente, ou com `npm run validar -- <slug>` quando puder aplicar a mudança numa cópia, que o guideline continua válido: ids citados existem, YAML com aspas onde houver dois-pontos e campos do schema.
5. **Responda no PR** com um resumo: o pedido, a classificação, as sugestões feitas e o que acontece depois do "Commit suggestion".

Depois que uma pessoa aceita a sugestão, o commit muda `content/reports/<slug>/` e o workflow `Gerar estudo` regenera o estudo sozinho, com as skills `01` a `06`. O comentário "Preview para homologação" é atualizado com o link da nova versão, e a aprovação anterior do PR é anulada pela proteção da `main`.

## Saída

- **Apresentação:** sugestões de alteração no `guideline.md` e um comentário-resumo no PR.
- **Análise ou dados:** um comentário no PR dizendo o que o cientista precisa mudar.
- **Ambíguo:** um comentário com a dúvida.

## Regras

- Nunca faça commit no `guideline.md`, na `metodologia.md` ou no `data.json` no PR.
- Não edite `page.tsx`, `composicao.json` ou componentes à mão para atender a um pedido. A mudança vem do guideline e da regeneração (ADR-004).
- Não escreva texto de análise na sugestão. Textos de leitura e conclusão são da metodologia.
- Não abra um PR novo. O ajuste é uma nova versão do PR existente.
