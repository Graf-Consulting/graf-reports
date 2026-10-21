---
name: 02-compor-report
description: Traduz a metodologia.md e o guideline.md de um estudo numa composição explícita (app/reports/<slug>/composicao.json) que só usa componentes do kit ou componentes próprios do estudo, ligada aos dados do data.json e às análises da metodologia, validada por JSON Schema. Use depois de 01-validar-entradas aprovar o conjunto.
---

# 02-compor-report

## Objetivo

Produzir o `composicao.json` do estudo: quais blocos o report usa, em que ordem, ligados a quais dados e a qual análise da metodologia (ADR-004). É a única etapa da geração em que o agente decide a forma do report. Do arquivo em diante, tudo é determinístico (renderizador).

## Quando usar

Depois de `01-validar-entradas` aprovar o conjunto na mesma execução. Também roda de novo quando as entradas mudam, inclusive quando uma pessoa atualiza o `guideline.md` para atender a um pedido de ajuste (`07-aplicar-ajuste`).

## Entrada

- `content/reports/<slug>/data.json`, `metodologia.md` e `guideline.md`, já validados.
- Catálogo do kit e schema da composição: `lib/report/schemas/composicao.schema.json`. Cada tipo de bloco em `definitions` é um item do catálogo, com a descrição do caso de uso e dos componentes que usa.
- Guidelines da plataforma em `docs/guidelines/`, em especial [uso dos blocos](../../../docs/guidelines/uso-dos-blocos.md): quando usar cada bloco, limites de itens e ordem do report.
- Estudo de referência, como exemplo de composição: `app/reports/impacto-restricoes-ue/composicao.json` (PRD, RF-17).

## Pré-requisitos

Pare e diga o que falta se:

- `01-validar-entradas` não aprovou o conjunto;
- as guidelines da plataforma não existem (PRD, Q9 e Q14).

## Procedimento

A composição não traz textos nem estilo (ADR-004). Topo, títulos, introduções e rótulos o renderizador lê no `guideline.md`; textos de análise, na `metodologia.md`; cores, em `lib/report/tokens.ts`. A composição só escolhe blocos e faz as ligações.

1. **Identidade.** Preencha o `slug`, igual ao do guideline. O topo do report sai do guideline e do `metadata` do `data.json`, sem nada na composição.
2. **Seções.** Crie uma seção por seção do `guideline.md`, com o mesmo `id` e na mesma ordem.
3. **Blocos.** Para cada análise, leitura, conclusão e ressalva que a seção do guideline cita, escolha o bloco do catálogo que atende à intenção descrita no corpo do guideline e registre:
   - o tipo do bloco e a posição na seção (blocos lado a lado entram num `grupo`);
   - a análise da metodologia que o bloco atende (RF-08);
   - o vínculo com os dados: tabela e campos, todos existentes no `data.json` e usados pela análise;
   - interação: opções de dimensão, métrica e filtro, com a inicial em primeiro;
   - top N e formato de exibição de cada campo, conforme as regras de escrita abaixo;
   - para `indicadores`, os mesmos campos e a mesma ordem de `indicadores` no guideline, com a unidade conforme as regras abaixo;
   - os ids das leituras, conclusões e ressalvas que o bloco exibe.
   Tudo o que a seção do guideline cita precisa aparecer em algum bloco da seção. Quando nenhum bloco do kit exibe o que a seção pede na forma descrita no guideline, use um bloco `proprio` (passo 5). Ele pode receber várias tabelas (`tabelas`) e os textos que exibe (`leituras`, `conclusoes`, `ressalvas`); com `cabecalho: true`, desenha o cabeçalho da seção, e só vale quando é o único bloco dela.
4. **Ressalvas.** Toda ressalva da metodologia entra no report (ADR-002):
   - citada numa seção do guideline: nessa seção;
   - não citada e ligada a uma análise: na seção que exibe essa análise;
   - não citada e sem análise: num bloco ao final do report.
5. **Componentes próprios.** Reserve o bloco na composição e deixe a criação do código para `03-gerar-componente` quando:
   - o guideline declarar o componente em `componentes_novos`; ou
   - o guideline pedir algo que nenhum componente do kit cobre.
   Falta de bloco no kit não é motivo para parar a geração: reserve o bloco `proprio`, com as tabelas e os textos que ele exibe, e siga para `03-gerar-componente`. Pare só se faltar algo nas entradas.
6. **Validação.** Rode `npm run validar -- <slug>` e corrija a composição até ela passar. O script valida o `composicao.json` contra `lib/report/schemas/composicao.schema.json` (tipos de bloco e campos de cada um) e contra as entradas (RF-06): seções iguais às do guideline e na mesma ordem; tabelas e campos existentes e usados pela análise do bloco; formato compatível com o tipo do campo; opções de filtro existentes nos dados; leituras, conclusões e ressalvas citadas na seção; tudo o que o guideline cita exibido; toda ressalva no report.
7. **Proteção de ajustes manuais.** Se `app/reports/<slug>/composicao.json` já existir, compare com a nova versão. Liste o que mudou e sinalize qualquer diferença que não venha de mudança nas entradas. Uma diferença assim pode ser ajuste manual do desenvolvedor e não pode ser descartada sem aviso (RF-16).

## Regras de escrita da composição

Para a mesma entrada gerar sempre o mesmo arquivo (RNF-04; backlog V8). O `npm run validar` confere todas.

| Regra | Como escrever |
|---|---|
| Formato de exibição | Omita `formato` quando o valor é exibido como está. Declare só `compact`, `fob` ou `cleanLabel`. |
| Top N | Sempre declare `top` em `ranking`, `serie_empilhada` e `fluxo`, mesmo quando igual ao padrão do kit (10, 10 e 100). |
| Unidade nos cartões de `indicadores` | Declare `"mostrar_unidade": true` quando o formato for `compact` e o campo tiver `unidade` no `data.json` (ex.: `271,3 mi kg`). Nos demais casos, não declare: `fob` já mostra `US$`, e valores de texto não têm unidade. |
| Chave `$schema` | Não use. |
| Formatação do arquivo | Indentação de 2 espaços, um item por linha e quebra de linha no fim: a saída de `JSON.stringify(composicao, null, 2)`. |

## Saída

- `app/reports/<slug>/composicao.json`, válido contra o esquema.
- Um resumo legível para o PR: seções, blocos, os dados de cada bloco, a análise que justifica cada bloco e os componentes próprios previstos (RF-05).

## Regras

- Use só componentes do kit ou componentes próprios do estudo. Nada de layout arbitrário (ADR-004).
- Prefira sempre o kit. Crie um componente próprio só quando nenhum componente do kit atende ao pedido (ADR-001) e diga no resumo por que o kit não cobria.
- Nunca altere o `guideline.md`, a `metodologia.md` ou o `data.json`. Se o guideline precisar mudar, aponte os trechos para uma pessoa atualizar.
- Não faça cálculos nem agregações. Todo número vem do `data.json` como está (ADR-002).
- Rótulos que não chegaram limpos: se um campo de texto exibido como rótulo, legenda ou opção de controle tem valores vazios ou com código no início, aplique a função de limpeza de `lib/report/format.ts` (hoje `cleanLabel`) como formato desse campo na composição. Registre no resumo do PR quais campos precisaram de limpeza, para o cientista corrigir na próxima entrega (ADR-003). Não limpe valores que entram em conta, filtro ou chave, só a exibição.
- Não redija textos (PRD, Q13; RF-09). O texto de análise vem das leituras e conclusões da `metodologia.md`, referenciadas pelo id; o renderizador busca o texto e preenche os marcadores. Os textos de interface vêm do `guideline.md`. Se faltar um texto obrigatório, como o rótulo de um campo exibido num eixo ou controle, pare e aponte o que precisa ser escrito.
- Não coloque estilo visual (cores, espaçamentos) nem lógica na composição. Estilo é do kit e agregação é dos dados (ADR-004).
- Não crie blocos que o guideline não pede. Para a mesma entrada, a composição deve sair o mais parecida possível (RNF-04, backlog V8).
- Não escreva `page.tsx` nem componentes. Essas tarefas são de `04-montar-pagina` e `03-gerar-componente`.
