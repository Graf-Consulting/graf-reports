# Decisões de arquitetura (ADRs)

Cada ADR registra uma decisão, o contexto, as alternativas consideradas e as consequências. Uma decisão nova ou uma mudança de decisão entra num ADR novo, ou na seção 11 do [PRD](../PRD_publicacao-automatizada-de-estudos_v0.3.md) quando responde a uma questão dele.

| ADR | Decisão | Status |
|---|---|---|
| [ADR-001](ADR-001.md) | Uma única aplicação Next.js hospeda os estudos, independentes entre si e com componentes compartilhados | Vigente |
| [ADR-002](ADR-002-entradas-do-estudo.md) | O cientista entrega cada estudo como `data.json`, `metodologia.md` e `guideline.md`; o report não faz contas e o agente não escreve textos | Vigente |
| [ADR-003](ADR-003-estrutura-de-pastas.md) | Entradas do estudo em `content/reports/<slug>/`, código gerado em `app/reports/<slug>/` | Vigente |
| [ADR-004](ADR-004-composicao-do-report.md) | O report é descrito num `composicao.json` validado por schema e montado por um renderizador determinístico a partir do catálogo de blocos do kit | Vigente |
| [ADR-005](ADR-005-skills-do-agente.md) | O agente trabalha com sete skills, uma por etapa, em `.claude/skills/`, e nunca altera as entradas do cientista | Vigente |

## Como ler

- **ADR-001** é a base: por que existe um único site de estudos.
- **ADR-002 a ADR-005** descrevem a esteira de publicação automatizada. Leia na ordem: o que entra (002), onde fica (003), como vira página (004) e quem executa cada etapa (005).
- O caminho completo, da entrega à produção, está em [fluxo-da-esteira.md](../fluxo-da-esteira.md).
