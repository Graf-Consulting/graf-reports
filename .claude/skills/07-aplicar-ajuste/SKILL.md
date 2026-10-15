---
name: 07-aplicar-ajuste
description: Regenera um estudo depois de um pedido de ajuste da homologação, a partir do guideline.md atualizado por uma pessoa, e entrega a nova versão no mesmo PR. O agente nunca altera o guideline.md. Se o pedido exigir mudança no guideline e ela ainda não tiver sido feita, aponta os trechos que uma pessoa precisa atualizar. Use a cada pedido de ajuste de um stakeholder sobre um estudo que já tem PR aberto.
---

# 07-aplicar-ajuste

## Objetivo

Fazer o pedido de ajuste virar uma nova versão no mesmo preview, sem recomeçar o fluxo e sem edição solta na página (PRD, RF-14). O ajuste entra pelo `guideline.md`, alterado por uma pessoa, e pela regeneração (CLAUDE.md, regra 5).

## Quando usar

A cada pedido de ajuste do stakeholder sobre um estudo com PR aberto.

## Entrada

- O pedido de ajuste, como foi feito.
- O `slug` do estudo e o branch do PR aberto.
- `content/reports/<slug>/guideline.md` e as mudanças feitas nele desde a última geração (`git diff` e `git log` do arquivo no branch).
- `app/reports/<slug>/composicao.json`, para localizar o bloco ou a seção a que o pedido se refere.
- `content/reports/<slug>/metodologia.md` e `data.json`, somente para leitura.

## Procedimento

1. **Classifique o pedido.**
   - **Apresentação.** Exemplos: trocar o tipo de gráfico, reordenar seções, mudar destaque, rótulo ou visual. Pertence ao `guideline.md` e segue para o passo 2.
   - **Análise ou dados.** Exemplos: nova métrica, outra conclusão, recorte diferente, número que precisa mudar. Pertence à `metodologia.md` ou ao `data.json`, que são do cientista. Pare e registre que o pedido precisa voltar ao cientista (PRD, Q23).
   - **Ambíguo.** Pare e peça esclarecimento.
2. **Confira se o guideline já foi atualizado.**
   - Se uma pessoa já alterou o `guideline.md` para atender ao pedido, siga para o passo 3.
   - Se não alterou, pare. Aponte os trechos do `guideline.md` que precisam mudar e o que o pedido exige em cada um, para uma pessoa fazer a mudança. Não altere o arquivo.
3. **Regenere.** A nova geração passa pelas skills, nesta ordem: `01-validar-entradas`, `02-compor-report`, `03-gerar-componente` (se o ajuste pedir algo que o kit não cobre) e `05-conferir-report`. Siga as instruções de cada uma e não repita as regras delas aqui.
4. **Nova versão.** Faça um commit no mesmo branch do PR. As versões anteriores ficam consultáveis no histórico do PR (RF-14).

## Saída

- A composição regenerada, e o componente próprio novo quando houver, num novo commit no mesmo PR.
- Um registro para o PR com:
  - o pedido original e a classificação;
  - a mudança feita no guideline e quem a fez;
  - o que mudou na composição;
  - o resultado da conferência.
- Ou, quando a skill para: o motivo e quem precisa agir. Para um guideline ainda não atualizado, a saída traz os trechos a mudar.

## Regras

- Nunca altere o `guideline.md`, a `metodologia.md` ou o `data.json`. Só uma pessoa altera o guideline.
- Não edite `page.tsx`, `composicao.json` ou componentes à mão para atender a um pedido. A mudança vem do guideline atualizado e da regeneração (ADR-004).
- Não abra um PR novo. O ajuste é uma nova versão do PR existente.
