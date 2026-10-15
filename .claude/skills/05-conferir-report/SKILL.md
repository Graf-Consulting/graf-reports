---
name: 05-conferir-report
description: Confere um estudo gerado antes do PR. Roda lint, typecheck e build, valida a composição e confere números e textos exibidos contra o data.json e a metodologia.md, além do isolamento entre estudos. Produz um relatório de conferência. Use antes de abrir ou atualizar o PR do estudo.
---

# 05-conferir-report

## Objetivo

Garantir que o estudo gerado compila, respeita a arquitetura e mostra só o que os dados e a metodologia sustentam (PRD, RF-09 e RNF-02; CLAUDE.md, regra 7).

## Quando usar

Antes de abrir o PR e a cada nova versão gerada por `07-aplicar-ajuste`.

Esta etapa é candidata a script determinístico (ADR-005; PRD, Q11). Com os marcadores, a conferência de textos também é mecânica: comparar o texto exibido com o texto da fonte, já com os valores preenchidos.

## Entrada

- O estudo gerado em `app/reports/<slug>/`: `page.tsx`, `composicao.json` e `components/`, se houver.
- O conjunto em `content/reports/<slug>/`.
- As mudanças da execução em relação à `main` (`git diff`).

## Procedimento

Execute as checagens em dois grupos e registre cada uma como aprovada ou reprovada, com evidência.

### Checagem técnica

1. **Entradas e composição.** Rode `npm run validar -- <slug>`. Ele valida as entradas e o `composicao.json` contra os schemas e entre si (ADR-004, consumo no build, passo 2). Registre os erros e os avisos.
2. **Código.** Rode `npm run lint`, `npx tsc --noEmit` e `npm run build`. Confira se `out/reports/<slug>.html` foi gerado.
3. **Isolamento.** Confira no diff:
   - nenhum arquivo fora de `app/reports/<slug>/` importa `content/reports/<slug>/` (ADR-003);
   - o estudo não importa nada de outro estudo (ADR-001);
   - a execução não alterou `components/`, `lib/report/`, `app/layout.tsx` nem `app/globals.css`. Se alterou, reprove e liste os estudos publicados que precisam de conferência visual (CLAUDE.md);
   - o agente não alterou `data.json`, `metodologia.md` nem `guideline.md`. Mudanças no `guideline.md` feitas por uma pessoa são esperadas: liste-as no relatório, com o autor do commit.

### Checagem de conteúdo

4. **Números.** Todo número exibido, seja em texto, indicador, destaque ou parâmetro de gráfico, vem do `data.json` como está, sem cálculo (RF-09; ADR-002).
5. **Textos.** Todo texto de análise exibido é o `texto` de uma leitura, conclusão ou ressalva da `metodologia.md`, sem alteração, com cada marcador preenchido pelo valor do `data.json` indicado em `valores` e no formato declarado. Nenhum marcador aparece sem preencher. Todo texto de interface exibido vem do `guideline.md` (RF-09; PRD, Q13).
6. **Ressalvas.** Toda ressalva da metodologia aparece no report, no lugar definido pela regra do ADR-002.
7. **Rastreabilidade.** Todo bloco da composição aponta para uma análise que existe na metodologia (RF-08).

## Saída

Um relatório de conferência com:

- resultado geral: aprovado ou reprovado;
- a checagem técnica e a de conteúdo em seções separadas, cada item com resultado e evidência (comando e trecho de saída, ou o valor exibido e o valor no `data.json`);
- para cada reprovação, a etapa que precisa ser refeita (`02-compor-report`, `03-gerar-componente`, `04-montar-pagina`) ou o erro na entrada que o cientista precisa corrigir;
- as checagens que ainda não fazem parte da conferência: regressão visual e acessibilidade (PRD, Q10 e Q17; backlog V7).

Um relatório reprovado impede a abertura do PR.

## Regras

- A skill só verifica. Não corrige código, composição nem entradas.
- Não marque como aprovado o que não foi executado. Se um comando falhou ou não rodou, o item fica reprovado, com a saída anexada.
