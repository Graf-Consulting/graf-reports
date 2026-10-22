# Decisões de arquitetura (ADRs)

Cada ADR registra uma decisão, o contexto, as alternativas consideradas e as consequências. Uma decisão nova ou uma mudança de decisão entra num ADR novo, ou na seção 11 do [PRD](../PRD_publicacao-automatizada-de-estudos_v0.3.md) quando responde a uma questão dele.

| ADR | Decisão | Status |
|---|---|---|
| [ADR-001](ADR-001.md) | Uma única aplicação Next.js hospeda os estudos, independentes entre si e com componentes compartilhados | Vigente |
| [ADR-002](ADR-002-entradas-do-estudo.md) | O cientista entrega cada estudo como `data.json`, `metodologia.md` e `guideline.md`; o report não faz contas e o agente não escreve textos | Vigente |
| [ADR-003](ADR-003-estrutura-de-pastas.md) | Entradas do estudo em `content/reports/<slug>/`, código gerado em `app/reports/<slug>/` | Vigente |
| [ADR-004](ADR-004-composicao-do-report.md) | O report é descrito num `composicao.json` validado por schema e montado por um renderizador determinístico a partir do catálogo de blocos do kit | Vigente |
| [ADR-005](ADR-005-skills-do-agente.md) | O agente trabalha com sete skills, uma por etapa, em `.claude/skills/`, e nunca altera as entradas do cientista | Vigente |
| [ADR-006](ADR-006-homologacao-e-publicacao.md) | Aviso de homologação no Teams, registro da aprovação no PR e publicação: Power Automate ou GitHub Actions | Em discussão |
| [ADR-007](ADR-007-mapas-no-kit.md) | Mapas no kit: mapa base com Leaflet por CDN e fundo CARTO (chave em variável de ambiente), blocos `mapa_roscas` e `mapa_trechos` e seleção compartilhada entre blocos | Vigente |

## Como ler

- **ADR-001** é a base: por que existe um único site de estudos.
- **ADR-002 a ADR-006** descrevem a esteira de publicação automatizada. Leia na ordem: o que entra (002), onde fica (003), como vira página (004), quem executa cada etapa (005) e como o estudo é homologado e publicado (006).
- **ADR-007** trata de uma família de blocos do kit: os mapas, com biblioteca e credencial próprias.
- O caminho completo, da entrega à produção, está em [fluxo-da-esteira.md](../fluxo-da-esteira.md).
