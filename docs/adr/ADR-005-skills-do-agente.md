# ADR-005 — Skills do agente de geração

| | |
|---|---|
| **Tipo** | Arquitetura |
| **Status** | Vigente |
| **Data da decisão** | 14/10/2026 |
| **Decidido por** | IA GRAF |
| **Ciente** | A definir |
| **Relacionados** | PRD: Publicação automatizada de estudos, Q11, Q12 e Q22 · ADRs: ADR-002, ADR-003, ADR-004 · Fluxo: [fluxo-da-esteira.md](../fluxo-da-esteira.md) |

## Contexto

O agente executa várias etapas, do conjunto entregue pelo cientista até o pull request com preview. Separar cada etapa numa skill, com instruções, entradas e saídas próprias, deixa cada uma testável e revisável e permite rodar só a etapa necessária quando chega um ajuste.

## Decisão

O agente usa sete skills, versionadas no repositório em `.claude/skills/<nn>-<nome>/SKILL.md`. O número indica a ordem em que rodam numa geração; a 07 roda a cada pedido de ajuste. As skills orientam o agente sobre como executar cada etapa; a ordem de execução é do workflow (modo A) ou do desenvolvedor (modo C), conforme o [fluxo da esteira](../fluxo-da-esteira.md).

| Skill | O que faz | Lê | Produz | Quando roda |
|---|---|---|---|---|
| 01-validar-entradas | Confere os três arquivos contra os schemas de `lib/report/schemas/` e entre si: ids, tabelas, campos, marcadores e tipos | `content/reports/<slug>/` | Lista de erros e avisos, ou aprovação | Sempre, antes de tudo |
| 02-compor-report | Traduz metodologia e guideline em composição, escolhendo blocos do catálogo do kit | Entradas, catálogo (schema da composição), composição de referência, guidelines da plataforma | `composicao.json` validado | Depois de 01-validar-entradas, e de novo quando as entradas mudam |
| 03-gerar-componente | Cria componente próprio do estudo quando nenhum bloco do kit atende, declarado ou não em `componentes_novos` | Guideline, guidelines da plataforma, componentes do kit como exemplo | `app/reports/<slug>/components/` e registro na composição | Só quando o kit não cobre o que o guideline pede |
| 04-montar-pagina | Cria a página fina pelo modelo fixo: lê as entradas no build, declara o SEO e chama o renderizador | `composicao.json` e entradas | `app/reports/<slug>/page.tsx` | Na primeira geração do estudo |
| 05-conferir-report | Roda lint, typecheck e build e confere composição, números, textos, ressalvas e isolamento | Estudo gerado | Relatório de conferência | Antes de abrir o PR e a cada nova versão |
| 06-abrir-pr | Modo C: cria branch e PR. Modo A: atualiza a descrição do PR que já existe. Em ambos, com resumo e link do preview | Estudo gerado e relatório de conferência | PR e preview | Ao fim da geração |
| 07-aplicar-ajuste | Classifica o pedido de ajuste. Se for de apresentação e uma pessoa já tiver atualizado o guideline, regenera; senão, aponta os trechos a mudar ou devolve ao cientista | Pedido do stakeholder, guideline atualizado | Nova versão no mesmo PR | A cada pedido de ajuste |

Regras que valem para todas as skills:

- **O agente nunca altera as entradas do cientista**, nem o `guideline.md`. Um ajuste de apresentação é feito por uma pessoa no guideline, e o agente regenera a partir dele. Ajuste de análise ou de dados volta ao cientista.
- **O agente não escreve textos.** Todo texto exibido vem da metodologia ou do guideline (PRD, Q13).
- **Componente próprio** pode ser criado sem estar declarado em `componentes_novos`, desde que nenhum bloco do kit atenda. Ele fica isolado na pasta do estudo e não é promovido ao kit pelo agente.
- **As skills são mantidas pelo desenvolvedor responsável pela plataforma**, que opera o agente e é dono do kit (PRD, seção 3). Mudança numa skill entra por PR, como qualquer código.

Só 02-compor-report, 03-gerar-componente e 07-aplicar-ajuste exigem julgamento. 04-montar-pagina, a parte técnica de 05-conferir-report e 06-abrir-pr podem virar scripts determinísticos. A validação das entradas e da composição deve virar um script do repositório, usado pelas skills e pelo CI.

## Pontos em aberto

- Quem revisa um componente gerado por 03-gerar-componente e quando ele é promovido ao kit (PRD, Q22).
- Consistência do agente: composições parecidas para a mesma entrada (backlog V8).
- Risco técnico: componente gerado inconsistente com o kit ou com as guidelines. Mitigação: revisão do desenvolvedor, isolamento na pasta do estudo e conferência.

## Alternativas consideradas

| Opção | Observação |
|---|---|
| Um único prompt de agente para todo o fluxo | Mais simples de começar; difícil de testar por etapa e de reaproveitar em ajustes |
| Gerador determinístico sem agente | Cobre blocos padrão, mas não traduz intenção escrita em composição |
| Agente altera o guideline para aplicar ajustes | Rejeitado: o guideline é entrada humana e fonte de verdade da apresentação; a edição fica com uma pessoa |

## Revisitar quando

Após o primeiro estudo novo passar pelo modo A, do PR com as entradas à publicação.
