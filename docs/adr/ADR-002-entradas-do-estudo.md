# ADR-002 — Conjunto de entrada do estudo: data.json, metodologia.md e guideline.md

| | |
|---|---|
| **Tipo** | Processo / arquitetura |
| **Status** | Vigente |
| **Data da decisão** | 02/10/2026 |
| **Decidido por** | IA GRAF |
| **Ciente** | A definir |
| **Relacionados** | PRD: Publicação automatizada de estudos, Q1, Q2, Q7, Q8 e Q13 · ADRs: ADR-001, ADR-003, ADR-004 · Templates: `docs/template/` · Guia: [guia-de-preenchimento.md](../guia-de-preenchimento.md) |

## Contexto

Hoje o cientista entrega ao desenvolvedor um dataset e um relatório executivo em Word, e o desenvolvedor interpreta esse material para montar o report. Para automatizar a montagem, a entrada precisa ser padronizada, legível por pessoas e por um agente, e validável antes da geração.

O dataset do estudo atual já chega agregado no nível exibido, com os indicadores-resumo calculados (`summary` e seis tabelas em formato longo no `data.ts` de `impacto-restricoes-ue`).

## Decisão

O cientista sempre entrega o mesmo conjunto, em `content/reports/<slug>/`:

| Arquivo | Responde por | Não responde por |
|---|---|---|
| `data.json` | Os dados do estudo, já com as agregações necessárias para o report, os metadados do estudo (data de referência, período, fontes) e a descrição de cada tabela | Como exibir, o que concluir |
| `metodologia.md` | Como usar os dados corretamente e o que é verdade: análises, métricas, relações, recortes, conclusões, ressalvas e o texto de leitura | Componentes, cores, layout |
| `guideline.md` | Como o report deve ser montado: seções, o que destacar, comparações, visual desejado e componentes novos. Cita análises, leituras e conclusões da metodologia pelo id, sem reescrever o texto. Traz os textos de interface: títulos, introduções de seção, títulos de gráficos e rótulos de campos | Os dados, a análise e os textos de conclusão |

O `guideline.md` tem cabeçalho YAML validado por esquema (slug, título, seções, tabelas do `data.json` usadas, visual, `componentes_novos`) e corpo em Markdown com a intenção de apresentação.

A `metodologia.md` tem cabeçalho YAML (análises, leituras, conclusões e ressalvas) e corpo livre em Markdown (PRD, Q7). O texto de análise exibido no report vem pronto das leituras e conclusões. Todo valor vindo dos dados entra no texto como marcador (`{id}`), declarado em `valores` com tabela, campo, filtro e formato; o report preenche o marcador com o valor do `data.json`, formatado por `lib/report/format.ts`. Os textos de interface vêm do `guideline.md`. Textos curtos que explicam um número, como o detalhe de um cartão de indicador ou uma informação do topo ("Recorte principal: 2026"), também são leituras da metodologia; o guideline só diz onde aparecem (`meta` e `indicadores`). A automação não redige textos (PRD, Q13).

O `data.json` tem dois blocos (PRD, Q8):

- `metadata`: o que vale para o estudo inteiro (data de referência, período e fontes);
- `tabelas`: as tabelas nomeadas. Cada tabela traz a descrição, a chave (obrigatória quando há mais de uma linha), os campos (tipo, unidade, descrição e se aceita nulo) e as `linhas`. Rótulos de texto chegam prontos para exibir; se não chegarem, a composição aplica uma função de limpeza do kit e o PR sinaliza (ADR-003).

Os tipos de campo são `texto`, `numero`, `data` (AAAA-MM-DD), `mes` (AAAA-MM), `ano` (número inteiro), `geo_ponto` e `geo_linhas`. Cada tipo tem um único formato, e `nulo` vale para qualquer tipo.

Cada informação fica num só arquivo: slug e título no `guideline.md`; data de referência, período e fontes no `metadata` do `data.json`. Os templates dos três arquivos estão em `docs/template/`.

O relatório executivo em Word deixa de fazer parte da esteira. A automação não faz cálculos sobre os dados.

## Alternativas consideradas

| Opção | Por que não |
|---|---|
| Relatório executivo em Word como entrada | Formato pensado para leitura humana, difícil de validar e de interpretar sem ambiguidade |
| Só `data.json` e `metodologia.md` | A metodologia ficaria responsável também pela apresentação, misturando o que é verdade com como mostrar |
| Guideline em `.yaml` puro | Bom para campos exatos, ruim para descrever intenção; exigiria que o cientista conhecesse o kit |
| Guideline em `.md` livre | Bom para intenção, mas sem campos validáveis (slug, tabelas usadas, componentes novos) |
| Dados brutos com agregação na automação | Aumenta o risco de números errados e faz a composição virar linguagem de cálculo |

## Consequências

**Positivas**
- Uma entrada única e previsível para todo estudo, validável antes da geração.
- Cada informação vive num só lugar: números nos dados, conclusões na metodologia, apresentação no guideline.

**Negativas / trade-offs**
- O cientista passa a escrever dois documentos além dos dados e precisa seguir padrões.
- Pessoas escrevem todo texto exibido no report: o cientista, as leituras e conclusões na metodologia; quem escreve o guideline, os textos de interface (PRD, Q13).
- Com marcadores, o texto do cabeçalho não é lido exatamente como aparece; o cientista confere a frase final no preview.
- Os esquemas que validam os três arquivos ainda precisam ser escritos a partir dos templates.

**Passa a ser obrigatório**
- Todo estudo novo chega com os três arquivos completos e válidos.
- Nenhuma conclusão escrita no `guideline.md`; ele referencia análises, leituras e conclusões da metodologia pelo id.
- Nenhum número ou nome vindo dos dados é escrito à mão numa leitura ou conclusão; ele entra como marcador declarado em `valores`.
- Percentuais, participações e variações vêm prontos no `data.json`, como campos.
- Toda análise do cabeçalho da `metodologia.md` tem uma subseção no corpo, com o mesmo título, explicando como é feita.
- Toda ressalva da metodologia aparece no report: na seção em que o `guideline.md` a cita; se não for citada, na seção que exibe a análise ligada a ela; se não tiver análise ligada, ao final do report.
- Os textos de interface do `guideline.md` não trazem números, nomes vindos dos dados nem conclusões.

## Revisitar quando

Os três primeiros estudos tiverem passado pela esteira, ou se cientistas relatarem que o conjunto ficou mais trabalhoso que o processo anterior.
