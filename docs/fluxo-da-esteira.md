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
    H4["Dev pede no PR: @claude ajuste<br/>07-aplicar-ajuste classifica<br/>e sugere a mudança"]
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
  H4 -- "apresentação" --> A1["Dev aceita a sugestão no guideline.md<br/>(Commit suggestion)"]:::h
  H4 -- "análise ou dados" --> C1
  A1 --> G0
  H3 -- sim --> P1

  classDef h stroke-width:3px
```

### Regras do modo A

- **Workflows.** `.github/workflows/gerar-estudo.yml` roda o agente com as skills. `.github/workflows/validacao.yml` roda lint, typecheck, `npm run validar` e build em todo PR para a `main`.
- **Gatilho.** A geração roda quando o último push do PR altera `content/reports/<slug>/`, só para os estudos alterados. Commits do próprio agente só alteram `app/reports/<slug>/`, então não disparam uma nova geração.
- **Disparo manual.** Para gerar de novo sem mudar as entradas, por exemplo depois de o kit ganhar um bloco que faltava, rode o workflow à mão (Actions → Gerar estudo → Run workflow) com o número do PR. Sem slugs, gera todos os estudos que o PR altera em `content/reports/`. O PR precisa estar aberto.
- **Versões.** Cada geração é um commit no mesmo PR, com um preview novo. As versões anteriores ficam no histórico do PR (PRD, RF-14).
- **Ajustes.** O agente nunca faz commit nas entradas. Um desenvolvedor pede o ajuste com `@claude` no PR, o agente sugere a mudança no `guideline.md` e o desenvolvedor aceita; ajuste de análise ou de dados volta para o cientista. Passo a passo em [Ajustes pedidos na homologação](#ajustes-pedidos-na-homologação).
- **Publicação.** O merge na `main` é sempre humano. A `main` precisa de proteção para que nada entre sem PR, validação e aprovação (PRD, RF-13 e Q18).
- **Credenciais.** O token do modelo fica em segredo do repositório (RNF-09). O workflow precisa de permissão de escrita no conteúdo e nos PRs.
- **Custo.** Ao fim de cada geração, o workflow registra o custo estimado, os turnos e a duração do agente no resumo da execução e num comentário do PR ("Custo das execuções do agente neste PR"), com uma linha por execução e o total. O `claude.yml` registra só no resumo da execução. Com o token da assinatura, o valor é o custo equivalente pela tabela de preços da API, não uma cobrança (`.github/scripts/custo-do-agente.sh`).
- **Revisão do código gerado.** O agente faz commit como o bot `claude`, e esse commit dispara o `Validação` e a revisão do Claude, que aceita o bot (`allowed_bots`).
- **Homologação.** O preview do PR exige login na Vercel; os stakeholders acessam com a conta criada para eles (ADR-006). O link a enviar é o do comentário "Preview para homologação", que o workflow `link-do-preview.yml` publica no PR a cada deploy, com o endereço completo de cada estudo alterado (`…vercel.app/reports/<slug>`) e o commit da versão. A raiz do preview abre o estudo mais recente, que nem sempre é o do PR.
- **Testado** em 16/10/2026 com um PR real e um estudo fictício: geração de ponta a ponta em cerca de 2 minutos (backlog, V11).

## Ajustes pedidos na homologação

Quando um stakeholder pede uma mudança no preview, o ajuste **nunca é feito na página nem direto na composição**. Ele entra pelas entradas do estudo, e a geração roda de novo sozinha.

**Regra:** o `guideline.md` só muda quando um **desenvolvedor pede explicitamente**. O agente sugere; uma pessoa aceita (ADR-005).

```mermaid
flowchart TD
  S1["Stakeholder pede um ajuste<br/>(hoje por qualquer canal; Teams no ADR-006)"]:::h
  S2["Desenvolvedor registra o pedido no PR:<br/>@claude ajuste: ..."]:::h
  S3["07-aplicar-ajuste classifica o pedido"]
  S4{"Tipo do pedido"}
  S5["Agente comenta sugestões de alteração<br/>no guideline.md (suggested change)"]
  S6["Desenvolvedor revisa e clica em<br/>Commit suggestion"]:::h
  S7["Agente responde o que o cientista<br/>precisa mudar"]
  S8["Cientista altera metodologia.md<br/>ou data.json no PR"]:::h
  S9["Agente pergunta o que falta para entender"]
  S10["Commit muda content/ → Gerar estudo regenera<br/>→ novo preview → link atualizado no PR"]
  S11["Aprovação anterior anulada;<br/>nova homologação"]:::h
  S1 --> S2 --> S3 --> S4
  S4 -- "apresentação" --> S5 --> S6 --> S10
  S4 -- "análise ou dados" --> S7 --> S8 --> S10
  S4 -- "ambíguo" --> S9 --> S2
  S10 --> S11
  classDef h stroke-width:3px
```

### Passo a passo

1. **O pedido chega.** Hoje, por qualquer canal; quando o ADR-006 for decidido, pelo "Pedir ajuste" do Teams.
2. **Um desenvolvedor registra o pedido no PR**, num comentário que menciona o agente:

   ```
   @claude ajuste: o ranking de regiões deve mostrar só as 3 maiores
   ```

   Só quem tem permissão de escrita no repositório aciona o `@claude`.
3. **O agente classifica o pedido** (skill `07-aplicar-ajuste`):
   - **Apresentação** (gráfico, top N, ordem, títulos, rótulos, destaque): responde com **sugestões de alteração** em cima das linhas do `guideline.md`;
   - **Análise ou dados** (métrica, recorte, número, texto de conclusão): responde o que o cientista precisa mudar na `metodologia.md` ou no `data.json`;
   - **Ambíguo:** pergunta o que falta.
4. **Uma pessoa aplica a mudança.**
   - Apresentação: o desenvolvedor revisa cada sugestão e clica em **Commit suggestion**. Ele também pode editar a sugestão antes, ou recusá-la.
   - Análise ou dados: o cientista altera o arquivo no próprio PR, pelo site do GitHub ou localmente. Se o ajuste muda a análise de forma relevante, a decisão de seguir no mesmo PR ou voltar ao começo ainda está em aberto (PRD, Q23).
5. **A geração roda sozinha.** O commit muda `content/reports/<slug>/`, o `Gerar estudo` regenera a composição e o agente faz o commit. Depois do deploy, a Vercel gera um preview novo e o comentário "Preview para homologação" passa a mostrar o link da nova versão.
6. **Nova homologação.** A proteção da `main` anula a aprovação anterior, e o stakeholder confere a nova versão pelo link atualizado.

### Garantias

- O agente nunca faz commit nas entradas: o workflow `Validação` reprova o PR se um commit de bot alterar `content/`.
- Toda mudança no guideline tem um autor humano no histórico do PR, e cada versão tem o próprio preview (RF-14).
- Uma sugestão só pode ser feita em linhas que mudaram no PR. Num PR de estudo novo, o guideline inteiro é novo, então sempre funciona. Num ajuste de um estudo antigo, o agente responde com o trecho a mudar em texto comum, e o desenvolvedor edita.

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
