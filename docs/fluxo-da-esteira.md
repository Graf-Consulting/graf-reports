# Fluxo da esteira de publicação de estudos

Como um estudo sai das entradas do cientista e chega à produção. Responde à Q11 do PRD (forma de execução do agente). As etapas do agente são as skills em `.claude/skills/` (ADR-005).

Há dois modos de execução:

- **Modo A, a meta:** a geração roda num workflow do GitHub, dentro do próprio PR do estudo.
- **Modo C, o piloto:** a geração roda numa sessão local do Claude Code, operada pelo desenvolvedor, enquanto o renderizador e as skills amadurecem.

Nos dois modos, cada PR é o ambiente de homologação do seu estudo, pelo preview da Vercel. Não há branch de homologação: o que o stakeholder aprova no preview é exatamente o que vai para a `main` no merge.

## Modo A: geração no PR (meta)

Nos diagramas, as caixas com borda grossa são etapas humanas.

```mermaid
flowchart TD
  subgraph E["1 · Entrega"]
    E1["Cientista sobe data.json, metodologia.md e guideline.md<br/>em content/reports/slug/ pela interface do GitHub"]:::h
    E2["GitHub cria a branch e o PR para a main"]
    E1 --> E2
  end

  subgraph G["2 · Geração: workflow no próprio PR"]
    G0{{"Mudou algo em<br/>content/reports/slug/?"}}
    G1["01-validar-entradas"]
    G2{"Conjunto válido?"}
    G3["02-compor-report<br/>gera composicao.json"]
    G4{"Precisa de componente<br/>fora do kit?"}
    G5["03-gerar-componente"]
    G6{"Primeira geração<br/>do estudo?"}
    G7["04-montar-pagina<br/>gera page.tsx"]
    G8["05-conferir-report<br/>lint, typecheck, build, números e textos"]
    G9{"Conferência aprovada?"}
    G10["Commit no PR e resumo<br/>na descrição do PR"]
    G0 -- sim --> G1 --> G2
    G2 -- sim --> G3 --> G4
    G4 -- sim --> G5 --> G6
    G4 -- não --> G6
    G6 -- sim --> G7 --> G8
    G6 -- não --> G8
    G8 --> G9
    G9 -- sim --> G10
  end

  subgraph H["3 · Revisão e homologação"]
    H1["Vercel atualiza o preview do PR"]
    H2["Desenvolvedor revisa composição e código"]:::h
    H3{"Stakeholder aprova<br/>o preview?"}:::h
    H4["07-aplicar-ajuste classifica o pedido<br/>e aponta o que mudar"]
    H1 --> H2 --> H3
    H3 -- "não: pedido de ajuste" --> H4
  end

  subgraph P["4 · Publicação"]
    P1["Aprovação registrada no PR<br/>(opções no ADR-006)"]:::h
    P2["Merge humano na main"]:::h
    P3["Vercel publica em produção"]
    P1 --> P2 --> P3
  end

  E2 --> G0
  G2 -- não --> X1["Comentário no PR com os erros"]
  X1 --> C1["Cientista corrige os arquivos no PR"]:::h
  C1 --> G0
  G9 -- não --> X2["Comentário no PR com o relatório<br/>e a etapa que falhou"]
  X2 --> D1["Desenvolvedor analisa"]:::h
  G10 --> H1
  H4 -- "apresentação" --> A1["Pessoa altera o guideline.md no PR"]:::h
  H4 -- "análise ou dados" --> C1
  A1 --> G0
  H3 -- sim --> P1

  classDef h stroke-width:3px
```

### Regras do modo A

- **Workflows.** `.github/workflows/gerar-estudo.yml` roda o agente com as skills. `.github/workflows/validacao.yml` roda lint, typecheck, `npm run validar` e build em todo PR para a `main`.
- **Gatilho.** A geração roda quando o último push do PR altera `content/reports/<slug>/`, só para os estudos alterados. Commits do próprio agente só alteram `app/reports/<slug>/`, então não disparam uma nova geração.
- **Versões.** Cada geração é um commit no mesmo PR, com um preview novo. As versões anteriores ficam no histórico do PR (PRD, RF-14).
- **Ajustes.** O agente nunca altera as entradas. Ajuste de apresentação é feito por uma pessoa no `guideline.md`; ajuste de análise ou de dados volta para o cientista (ADR-005; PRD, Q23).
- **Publicação.** O merge na `main` é sempre humano. A `main` precisa de proteção para que nada entre sem PR, validação e aprovação (PRD, RF-13 e Q18).
- **Credenciais.** O token do modelo fica em segredo do repositório (RNF-09). O workflow precisa de permissão de escrita no conteúdo e nos PRs.

## Modo C: sessão local (piloto)

```mermaid
flowchart TD
  C1["Cientista entrega os três arquivos"]:::h
  C2["Desenvolvedor cria a branch e coloca os arquivos<br/>em content/reports/slug/"]:::h
  C3["Desenvolvedor roda as skills no Claude Code local:<br/>01-validar-entradas → 02-compor-report → 03-gerar-componente →<br/>04-montar-pagina → 05-conferir-report"]:::h
  C4{"Tudo aprovado?"}
  C5["06-abrir-pr: commit, push e PR para a main"]
  C6["Vercel gera o preview do PR"]
  C7["Revisão, homologação e publicação<br/>iguais às etapas 3 e 4 do modo A"]:::h
  C1 --> C2 --> C3 --> C4
  C4 -- sim --> C5 --> C6 --> C7
  C4 -- não --> C8["Corrigir: entradas com o cientista,<br/>geração com o desenvolvedor"]:::h --> C3
  classDef h stroke-width:3px
```

No modo C, quem opera as skills é o desenvolvedor, e o PR só é aberto depois que a geração passa na conferência. Os ajustes pedidos na homologação seguem o mesmo caminho, rodando as skills de novo na branch do PR.

## Diferenças entre os modos

| | Modo A (meta) | Modo C (piloto) |
|---|---|---|
| Quem entrega as entradas no repositório | Cientista, pela interface do GitHub | Desenvolvedor |
| Onde o agente roda | Workflow do GitHub, no PR | Claude Code na máquina do desenvolvedor |
| Quando o PR é aberto | Na entrega, antes da geração | Depois da geração aprovada |
| Papel da skill `06-abrir-pr` | Atualizar a descrição do PR existente | Criar a branch e o PR |
| Credenciais no GitHub | Necessárias | Não |
