---
name: 03-gerar-componente
description: Cria um componente próprio de um estudo em app/reports/<slug>/components/ quando o estudo precisa de algo que o kit não cobre, seguindo as guidelines da plataforma e os componentes do kit como exemplo, e o registra na composição. A necessidade vem de componentes_novos no guideline.md ou de algo no guideline que nenhum componente do kit cobre.
---

# 03-gerar-componente

## Objetivo

Atender a uma necessidade de apresentação que o kit não cobre, com um componente isolado na pasta do estudo e coerente com o kit e as guidelines (PRD, RF-15).

## Quando usar

Quando o estudo precisa de um componente que não existe no kit:

- o cabeçalho do `guideline.md` tem itens em `componentes_novos`;
- `02-compor-report` reservou um bloco porque o kit não cobre o que o guideline pede, inclusive depois de uma atualização do guideline para atender a um ajuste.

Roda depois de o bloco estar reservado na composição.

## Entrada

- O que motiva o componente: o item de `componentes_novos` ou o trecho do `guideline.md` que o kit não cobre.
- `app/reports/<slug>/composicao.json`, com o bloco reservado.
- Guidelines da plataforma em `docs/guidelines/`.
- Componentes do kit em `components/report/` e `components/charts/`, como exemplo de padrão.
- `content/reports/<slug>/data.json`, para conhecer as tabelas e os campos que o componente recebe.

## Pré-requisitos

Pare e diga o que falta se:

- as guidelines da plataforma não existem (PRD, Q9 e Q14);
- o renderizador não aceita componentes próprios (prop `proprios` do `Renderizador`, ADR-004, consumo no build, passo 5).

Se um componente do kit já atende ao pedido, não gere nada. Aponte isso no resultado e deixe a decisão para o desenvolvedor. O ADR-001 exige usar o kit sempre que houver solução adequada.

## Procedimento

1. Leia o pedido do guideline e o bloco reservado na composição.
2. Escolha no kit o componente mais próximo e use-o como modelo de estrutura e de props.
3. Escreva o componente em `app/reports/<slug>/components/`, seguindo as convenções do repositório:
   - recebe linhas de dados e nomes de coluna por props;
   - usa cores de `lib/report/tokens.ts` e nunca hex solto;
   - formata números com `lib/report/format.ts`, em pt-BR;
   - leva `'use client'` se tiver estado ou gráfico;
   - gráficos são montados sobre `PlotlyChart` do kit;
   - faz importações com o alias `@/*`.
4. Registre o componente no registro local do estudo e confirme que o bloco da composição aponta para ele.
5. Se o arquivo do componente já existir, não sobrescreva sem aviso. Mostre a diferença e sinalize um possível ajuste manual (RF-16).

## Contrato com o renderizador

O renderizador passa a cada componente próprio as props do tipo `PropsProprio` (`@/lib/report/renderizador`), mais o que estiver em `props` no bloco da composição:

| Prop | Vem de | Conteúdo |
|---|---|---|
| `linhas` | `tabela` do bloco | As linhas da tabela, como estão no `data.json` |
| `tabelas` | `tabelas` do bloco | Cada tabela citada, pelo nome técnico, com campos e linhas |
| `textos.leituras`, `textos.conclusoes`, `textos.ressalvas` | `leituras`, `conclusoes`, `ressalvas` do bloco | Por id, `{ conteudo, destacado, texto }`: `conteudo` já tem os marcadores preenchidos e o negrito aplicado; `destacado` também põe em negrito os valores dos marcadores (use quando o guideline pede os valores em destaque); `texto` é a versão em texto simples |
| `rotulos` | `rotulos` do guideline | Os textos de interface do estudo |
| `analise` | `analise` do bloco | Título e descrição da análise na metodologia |
| `secao` | seção do guideline, só com `cabecalho: true` | Sobretítulo, título e introdução, para o componente desenhar o próprio cabeçalho |

Regras:

- O componente não calcula sobre os dados nem redige texto. Filtrar e ordenar linhas para exibir é permitido; derivar números novos, não.
- Texto da metodologia é exibido por `conteudo` (ou `destacado`, quando o guideline pede os valores em destaque), nunca por `texto`. O `texto` é a versão simples, sem o negrito marcado com `**` na metodologia; não o recorte nem o transforme para criar títulos ou destaques que a metodologia não marcou.
- Ao usar componentes do kit dentro do componente próprio, use as opções que o guideline pedir, como `centralizar` no `KeyMessage`.
- Textos também não vão em `props` na composição: lá só cabem nomes técnicos e parâmetros (minúsculas, números, `_`, `-` e `.`), e o `npm run validar` reprova o resto. Um título que o componente precisa exibir vem de `rotulos`, de uma leitura da metodologia ou do cabeçalho da seção.
- Leituras, conclusões e ressalvas passadas ao componente precisam estar citadas na seção do guideline ou ligadas à mesma análise do bloco na metodologia. O `npm run validar` confere isso.
- Use `cabecalho: true` só quando o bloco é o único da seção e o cabeçalho depende do estado do componente, como o nome da instalação selecionada. A seção, então, não ganha a moldura padrão.

### Registro local

O registro fica em `app/reports/<slug>/components/index.ts`, um módulo comum, sem `'use client'`, porque o renderizador roda no servidor e lê o mapa:

```ts
import { MeuGrafico } from './MeuGrafico';

export const proprios = { MeuGrafico };
```

- Cada componente fica num arquivo `'use client'` e é exportado por nome. Não exporte fábricas de componentes de um módulo cliente: o servidor não consegue chamá-las.
- A chave do mapa é o `nome` do bloco `proprio` na composição.

### Seleção compartilhada com o kit

Os blocos do kit que publicam uma seleção (por exemplo `mapa_roscas` e `mapa_trechos` com `"selecao": "id_porto"`) e os componentes próprios usam a mesma seleção da página (ADR-007). Num componente próprio, leia e troque o valor com o hook do kit:

```ts
import { useSelecao } from '@/components/report';

const [idPorto, selecionar] = useSelecao('id_porto');
```

Não crie provedor próprio para uma seleção: use a do kit, que já envolve a página.

### Mapas

Use os blocos `mapa_roscas` e `mapa_trechos` do kit. Se nenhum atender, o componente próprio de mapa é montado sobre o `MapaBase` de `@/components/maps` (Leaflet com o fundo do CARTO), com camadas que usam `useMapa()`. Nunca escreva a chave do CARTO no código.

### Estado compartilhado

Quando vários componentes próprios do estudo dividem um estado que não é uma seleção do kit, crie um provedor de contexto num arquivo `'use client'` e exporte-o também no registro:

```ts
export { Provedor } from './Selecao';
```

O renderizador envolve todas as seções com o `Provedor` quando a página o recebe (skill `04-montar-pagina`).

## Saída

- O componente em `app/reports/<slug>/components/`.
- O registro local (`components/index.ts`, com `proprios` e, se houver, `Provedor`) e o vínculo na composição atualizados.
- Um resumo para o PR: o que o componente faz, por que o kit não cobria e qual componente do kit serviu de modelo.

## Regras

- O componente fica só na pasta do estudo. Não altere `components/`, `lib/report/`, `app/layout.tsx` nem `app/globals.css`.
- O componente não importa nada de outro estudo e não é usado por outro estudo (ADR-001; RF-15).
- O componente não faz cálculos sobre os dados. Ele exibe o que recebe.
- Não promova o componente ao kit. Essa decisão é humana (PRD, Q22).
