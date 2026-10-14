---
name: validar-entradas
description: Valida o conjunto de entrada de um estudo (data.json, metodologia.md e guideline.md em content/reports/<slug>/) contra os esquemas e entre si, e devolve a lista de erros ou a aprovação. Use sempre, antes de qualquer outra etapa da geração de um estudo.
---

# validar-entradas

## Objetivo

Garantir que o conjunto entregue pelo cientista está completo e coerente antes da geração. Um conjunto incompleto ou inconsistente é recusado com uma mensagem que diz o que falta (PRD, RF-04).

## Quando usar

Sempre, como primeira etapa da geração de um estudo, e de novo a cada regeneração depois de um ajuste (ADR-005).

## Entrada

- O `slug` do estudo.
- A pasta `content/reports/<slug>/` com os três arquivos do ADR-002:

| Arquivo | Responde por |
|---|---|
| `data.json` | `metadata` (data de referência, período opcional, fontes) e `tabelas`, cada uma com descrição, chave, campos tipados e linhas |
| `metodologia.md` | Cabeçalho YAML com análises, leituras, conclusões e ressalvas, e corpo livre em Markdown |
| `guideline.md` | Cabeçalho YAML (slug, título, subtítulo, SEO, tabelas usadas, seções, visual, `componentes_novos`) e corpo em Markdown com a intenção de apresentação |

O formato de cada arquivo segue os templates em `docs/template/` (PRD, Q7 e Q8) e é validado pelos schemas em `lib/report/schemas/`:

| Arquivo | Schema | O que é validado |
|---|---|---|
| `data.json` | `data.schema.json` | O arquivo inteiro |
| `guideline.md` | `guideline.schema.json` | O cabeçalho YAML, convertido para JSON |
| `metodologia.md` | `metodologia.schema.json` | O cabeçalho YAML, convertido para JSON |

Os schemas cobrem a estrutura de cada arquivo isolado. As checagens entre arquivos e as que dependem do conteúdo (marcadores, ids citados, tipo de cada valor, chave única) são feitas pelos passos abaixo.

## Procedimento

1. **Presença.** Confira se os três arquivos existem e não estão vazios.
2. **`data.json`.**
   - Confira se é um JSON válido, com `metadata` (`data_referencia` e `fontes`) e `tabelas`.
   - Cada tabela tem `descricao`, `chave`, `campos` e `linhas`.
   - A `chave` é obrigatória em tabela com mais de uma linha. Os campos dela existem em `campos`, e ela não se repete entre linhas.
   - Campos de texto com valores vazios ou com um código numérico no início (por exemplo `0927800 - ITAJAI`) geram um **aviso**, não um erro: o ideal é que os rótulos cheguem limpos, e `compor-report` aplica a limpeza se for preciso.
   - As linhas só têm campos descritos, e cada valor segue o formato do tipo: `texto` (texto), `numero` (número), `data` (AAAA-MM-DD), `mes` (AAAA-MM), `ano` (número inteiro), `geo_ponto` ([latitude, longitude]) e `geo_linhas` (lista de linhas de [latitude, longitude]).
   - Valor nulo só aparece em campo com `nulo: true`, em qualquer tipo.
3. **`guideline.md`.**
   - Confira se tem cabeçalho YAML com os campos do template.
   - Confira se o slug do cabeçalho é igual ao nome da pasta. O mesmo slug liga `content/` a `app/` (ADR-003).
   - Confira se o guideline não traz texto de conclusão. Ele cita análises, leituras, conclusões e ressalvas da metodologia pelo id (ADR-002).
   - Os textos de interface (sobretítulos, títulos, introduções, títulos e descrições de gráficos, rótulos) não trazem conclusões nem valores que estão nos dados.
4. **`metodologia.md`.**
   - Confira se tem cabeçalho YAML com análises, leituras, conclusões e ressalvas, e se os ids não se repetem.
   - Toda análise do cabeçalho tem, em `## Análises` no corpo, uma subseção `###` com título igual ao `titulo` dela (PRD, RF-02).
5. **Coerência entre os arquivos** (RF-04, ADR-005):
   - Toda tabela e todo campo citados no `guideline.md` (em `tabelas`, `rotulos` e `componentes_novos`) existem no `data.json`.
   - Toda tabela e todo campo citados nas análises da `metodologia.md` existem no `data.json`.
   - Todo id de análise, leitura, conclusão e ressalva citado no `guideline.md` existe na `metodologia.md`.
   - Toda leitura, conclusão e ressalva que cita uma análise cita uma análise existente.
   - Toda leitura citada em `meta` ou no `detalhe` de um indicador existe na metodologia.
   - Todo `campo` de indicador é usado pela análise em que está e tem nome em `rotulos`.
   - Toda ressalva ligada a uma análise e não citada no guideline tem onde aparecer: a análise dela é exibida em alguma seção.
   - Em cada leitura, conclusão e ressalva, todo marcador `{id}` do `texto` tem um item em `valores`, e todo item de `valores` é usado no texto.
   - Em `valores`, a tabela e o campo existem, o `filtro` seleciona exatamente uma linha (sem filtro, a tabela tem uma linha só) e o `formato` é `texto` ou um formatador de `lib/report/format.ts` compatível com o tipo do campo.
   - Nenhum `texto` traz escrito à mão um valor que está nos dados, como um número ou um nome que deveria ser marcador (ADR-002). Números que não vêm dos dados, como o ano de um recorte, são permitidos.

## Saída

Um resultado único, em uma de duas formas:

- **Aprovado.** Diga que o conjunto passou nos schemas e nas checagens entre arquivos.
- **Reprovado.** Liste cada erro com:
  - arquivo;
  - local (campo do cabeçalho, seção, tabela ou campo);
  - o que falta ou está inconsistente;
  - o que o cientista precisa corrigir.

Nos dois casos, liste também os avisos, com tabela e campo. Avisos não reprovam o conjunto, mas vão para o PR para o cientista corrigir na próxima entrega.

Um conjunto reprovado encerra a geração. Nenhuma etapa seguinte roda.

## Regras

- Não altere nenhum dos três arquivos. Se uma entrada estiver errada, aponte o erro; quem corrige é o cientista (CLAUDE.md, regra 6).
- Não faça cálculos sobre os dados e não tente consertar dados fora do padrão.
- Não complete informação faltante por suposição. Se algo falta, é erro.
- Não avalie se a análise está certa. A skill verifica estrutura e coerência, não o mérito do estudo.
