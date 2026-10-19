# ADR-006 — Aviso de homologação, registro da aprovação e publicação em produção

| | |
|---|---|
| **Tipo** | Processo / arquitetura |
| **Status** | Em discussão (duas opções, sem decisão) |
| **Data da decisão** | A definir |
| **Decidido por** | A definir |
| **Ciente** | A definir |
| **Relacionados** | PRD: Publicação automatizada de estudos, Q15, Q16 e Q18; RF-11, RF-12, RF-13; RNF-05 e RNF-09; métrica M3 · ADRs: ADR-005 · Fluxo: [fluxo-da-esteira.md](../fluxo-da-esteira.md) · Backlog: V6 |

## Contexto

Cada estudo gerado vira um PR para a `main`, com um preview da Vercel que serve de homologação ([fluxo da esteira](../fluxo-da-esteira.md)). Faltam três peças, que o PRD deixa em aberto:

- **Aviso:** os stakeholders precisam saber que há um preview para homologar, sem usar o GitHub. A equipe já usa um chat em grupo no Teams.
- **Aprovação:** o PRD exige registrar quem aprovou, quando e qual versão (RF-12). O que é aprovado precisa ser exatamente o que vai para produção (O2, M3).
- **Publicação:** nada chega à produção sem validação aprovada e aprovação registrada (RF-13). Hoje, todo merge na `main` publica na Vercel.

A ideia inicial era: o preview fica pronto, uma mensagem vai para o grupo do Teams, um stakeholder responde "autorizado" e o merge é feito. Responder com texto livre é frágil: "autorizado, mas troca o título" passa como aprovação, qualquer pessoa do grupo pode responder, e não fica claro qual versão foi aprovada.

## Regras comuns às duas opções

Valem para qualquer opção escolhida:

1. **A aprovação vale para um commit.** O aviso leva o link do preview e o commit correspondente. Um commit novo no PR invalida a aprovação anterior e gera um novo aviso.
2. **A aprovação fica registrada no PR**, com aprovador, data e hora e commit, num comentário e num status de verificação "homologação aprovada" no commit.
3. **A `main` fica protegida.** O merge exige o status de homologação aprovada, a revisão do desenvolvedor e as validações automáticas (RF-13).
4. **A revisão do desenvolvedor vem antes da homologação**, como no fluxo. A aprovação do stakeholder não substitui a revisão técnica.
5. **Credenciais fora do repositório.** Tokens e endereços de webhook ficam em segredos do GitHub ou nas conexões do Power Automate (RNF-09). O token do GitHub tem acesso só a este repositório.

## Opções

### Opção 1: Power Automate com aprovação no Teams

```
PR com preview pronto
  → workflow do GitHub avisa o Power Automate (evento deployment_status da Vercel)
  → Power Automate publica no chat do Teams um cartão com link do preview, commit
    e botões Aprovar / Pedir ajuste, e espera a resposta
     ├─ Pedir ajuste → comentário no PR com o pedido → 07-aplicar-ajuste
     └─ Aprovar → comentário e status "homologação aprovada" no PR
  → merge
```

- **A favor:** o stakeholder aprova com um clique, sem sair do Teams. Quem clicou e quando ficam registrados automaticamente. O fluxo pode limitar quem pode aprovar.
- **Contra:** depende de licença do Power Automate. O gatilho por requisição HTTP e o acesso à API do GitHub podem exigir conectores premium. O fluxo fica fora do repositório, então a manutenção acontece em outra ferramenta.

### Opção 2: GitHub Actions avisa no Teams; aprovação registrada no PR

```
PR com preview pronto
  → workflow do GitHub publica no chat do Teams, pelo webhook do app Workflows,
    uma mensagem com link do preview e commit
  → stakeholder responde no chat (aprova ou pede ajuste)
  → desenvolvedor registra a resposta no PR, em nome do stakeholder:
    comentário com aprovador, data e commit, e o status "homologação aprovada"
  → merge
```

- **A favor:** tudo fica no repositório, versionado, e não depende de licença premium. É simples de montar.
- **Contra:** a mensagem é de mão única; botões só abrem links e não devolvem resposta. O registro da aprovação é manual, feito pelo desenvolvedor, o que mantém uma dependência de pessoa e abre espaço para erro na transcrição.

### Comparação

| | Opção 1: Power Automate | Opção 2: GitHub Actions |
|---|---|---|
| Aviso no Teams | Cartão do Power Automate | Webhook do app Workflows do Teams |
| Como o stakeholder aprova | Botão no cartão | Resposta no chat |
| Quem registra a aprovação no PR | O fluxo, automaticamente | O desenvolvedor, manualmente |
| Rastreabilidade (RF-12) | Automática | Depende de transcrição correta |
| Licença | Power Automate, possivelmente premium | Nenhuma além do GitHub e do Teams |
| Onde a automação vive | Power Automate | Repositório (`.github/workflows/`) |

As duas podem conviver: a opção 2 pode valer no começo, e a opção 1 entra quando a licença for confirmada, sem mudar as regras comuns.

## Decisão em aberto: quem faz o merge

Com a homologação aprovada e a revisão do desenvolvedor feita, há duas formas de publicar:

- **Merge humano:** uma pessoa clica em merge. É a regra atual do CLAUDE.md ("o merge é sempre humano").
- **Auto-merge do GitHub:** o merge acontece sozinho quando todas as condições da proteção da `main` forem atendidas. A aprovação do stakeholder é uma ação humana, então isso não fere o "publicação automática sem ação humana" do escopo do PRD, mas muda a regra atual e precisa ser decidido (Q18).

Em nenhuma das opções o Power Automate ou um workflow faz o merge direto, contornando a proteção da `main`.

## A verificar antes de decidir

- **Licença do Power Automate:** quais gatilhos (requisição HTTP) e conectores (GitHub, aprovações no Teams) estão disponíveis no plano de vocês.
- **App Workflows no Teams:** se o modelo de webhook para chat em grupo está liberado no tenant.
- **Acesso ao preview (Q15; backlog V6):** verificado em 16/10/2026: os previews são protegidos pelo login da Vercel, e só membros do time na Vercel os abrem. Uma conta na Vercel será criada para os stakeholders.
- **Proteção da `main`:** regras de branch e status obrigatórios no plano atual do GitHub.

## Revisitar quando

A licença do Power Automate for confirmada ou descartada, ou depois da homologação de dois estudos pela opção escolhida.
