# Backlog — validações técnicas da esteira de publicação

Itens candidatos a issue. Pelo PRD Standard v0.1, tarefas de engenharia não ficam no PRD; cada item aponta para o que ele ajuda a decidir.

| # | O que validar | Como | Alimenta |
|---|---|---|---|
| V1 | Um report equivalente ao atual sai de `data.json`, `metodologia.md` e `guideline.md` | Escrever retroativamente as três entradas do `impacto-restricoes-ue`, gerar e comparar com o publicado | PRD Q7, Q19, M1; ADR-002 |
| V2 | Validação do `composicao.json` contra o kit e os campos do `data.json` antes do build | Prova de conceito com esquema e um erro proposital de campo | ADR-004; PRD Q17, RF-06 |
| V3 | Impacto do tamanho do `data.json` no bundle e no carregamento | Medir o estudo atual com os dados como JSON importado | PRD premissa de tamanho, RNF-06 |
| V4 | `composicao.json` em `app/reports/<slug>/` e import de `content/reports/<slug>/data.json` com `output: 'export'`, sem virar rota nem quebrar o build | Build estático com a estrutura do ADR-003 | ADR-003 |
| V5 | Gráficos do kit no build estático: Plotly por CDN em execução (como hoje) ou como dependência | Comparar carregamento e funcionamento nos dois modos | PRD Q10, RNF-06 |
| V6 | Proteção de acesso e não indexação dos previews no plano atual da Vercel | Verificar recursos do plano e testar um preview | PRD Q15, RNF-05 |
| V7 | Regressão visual dos estudos existentes no CI | Captura de tela antes e depois de uma mudança no kit | PRD Q10, Q17, RNF-01 |
| V8 | Consistência do agente: composições parecidas para a mesma entrada | Gerar a composição do piloto várias vezes e comparar | ADR-004, ADR-005; RNF-04 |
| V9 | Leitura e validação do cabeçalho YAML do `guideline.md` pelo agente e no CI | Prova de conceito com o guideline do estudo atual e um campo inválido | ADR-002; PRD RF-03, RF-04 |
| V10 | Skill gerando componente próprio a partir de `componentes_novos` | Pedir no guideline do piloto um componente fora do kit e revisar o resultado | ADR-005; PRD RF-15, Q22 |
| — | README e seção Diagrama do ADR-001 citam a pasta `report-1`, que não existe | Atualizar com a estrutura do ADR-003 | ADR-003 |

## Resultados

| # | Situação | Data | Resultado |
|---|---|---|---|
| V1 | Feito | 14/10/2026 | O conjunto do `impacto-restricoes-ue` foi escrito no formato novo, em `content/reports/impacto-restricoes-ue/`, e passa na validação. O teste mostrou lacunas no formato, já corrigidas: detalhe dos indicadores, informações do topo, título do SEO, chave de tabela de uma linha e título da caixa de destaque. A página passou a ser montada pelo renderizador; comparada com a publicada, tem o mesmo título, a mesma descrição e o mesmo texto visível na mesma ordem (60 trechos), e o mesmo peso (198 KB com gzip). Os gráficos recebem as mesmas cores, eixos, hovers, opções e estados iniciais. |
| V2 | Feito | 13/10/2026 | `composicao.schema.json` em `lib/report/schemas/`, com a composição do estudo atual em `app/reports/impacto-restricoes-ue/composicao.json`. A composição real é aceita, e 18 erros propositais foram detectados pelo schema e pelas checagens contra as entradas: bloco inexistente, cor ou texto na composição, campo fora da análise, filtro com valor inexistente, ressalva sem aparecer, entre outros. O script de checagem ainda não está no repositório. |
| V3 | Feito | 13/10/2026 | Os dados do estudo atual têm 150,6 KB minificados e 18,2 KB com gzip. Lidos no build e passados a um componente cliente, entram uma vez no HTML (25,1 KB com gzip) em vez de no JavaScript. O total baixado ficou equivalente ao da página atual: 194,4 KB contra 197,6 KB com gzip, sem contar o Plotly, que vem do CDN nos dois casos. O tamanho dos dados não é um problema para o RNF-06 neste estudo. O renderizador deve passar a cada bloco só a fatia de dados que ele usa, como prevê o ADR-004. |
| V4 | Feito | 13/10/2026 | Numa rota temporária, a página importou `content/reports/<slug>/data.json` e `app/reports/<slug>/composicao.json` e leu os cabeçalhos YAML da metodologia e do guideline com `fs` e `js-yaml` no build. O export estático funcionou: o `composicao.json` não virou rota, e nenhum arquivo de `content/` foi copiado para `out/`. Para o código real, `js-yaml` e `@types/js-yaml` precisam ser declarados no `package.json`; hoje o `js-yaml` só existe como dependência indireta, e sem os tipos o typecheck falha. |
| V9 | Feito | 13/10/2026 | Schemas do cabeçalho do guideline e da metodologia em `lib/report/schemas/`, validados com o conjunto do estudo atual e com erros propositais. |
