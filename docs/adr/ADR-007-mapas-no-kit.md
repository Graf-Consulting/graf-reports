# ADR-007 — Mapas no kit: mapa base com Leaflet e fundo CARTO, e dois blocos sobre ele

| | |
|---|---|
| **Tipo** | Arquitetura |
| **Status** | Vigente |
| **Data da decisão** | 22/10/2026 |
| **Decidido por** | IA GRAF |
| **Ciente** | A definir |
| **Relacionados** | PRD: Publicação automatizada de estudos, Q10 e Q22 · ADRs: ADR-001, ADR-004 |

## Contexto

O estudo `acessos-portuarios` (PR #16, fechado) foi o primeiro gerado de ponta a ponta pela esteira. O kit não tem mapa, e o agente criou dois mapas como componentes próprios do estudo, sobre o mapa geográfico do Plotly (`scattergeo`). Na comparação com o painel de referência da GRAF, os mapas foram a maior diferença:

- **Sem fundo de ruas.** O `scattergeo` desenha só contornos de países e costa. No zoom de uma instalação portuária (raio de 50 km), o leitor fica sem referência de cidades e vias.
- **Sem zoom nas roscas.** O comparativo desenhou as roscas em SVG sobre um mapa fixo, que não acompanha zoom nem o filtro de região.
- **Legenda e espessuras improvisadas**, sem um padrão do kit para camadas de linhas.

O painel de referência usa o Leaflet com o fundo de ruas do CARTO (`light_all`). O agente não poderia ter feito o mesmo, por três motivos:

1. **Biblioteca nova:** o Leaflet não está na stack, e o `CLAUDE.md` exige decisão registrada para uma biblioteca nova.
2. **Credencial:** o fundo do CARTO usa uma chave de API, que precisa de configuração na hospedagem e de restrição na conta do CARTO.
3. **Reuso:** mapas de pontos e de trechos tendem a voltar em outros estudos de infraestrutura e logística. Pela regra da Q10, componente que serve a vários estudos é do kit. O que serve a um só fica com o agente, como componente próprio.

## Decisão

**1. Leaflet por CDN, como o Plotly.** O kit carrega o Leaflet 1.9.4 em runtime, só nas páginas que têm mapa, de `unpkg.com/leaflet@1.9.4` com verificação de integridade (SRI), por um carregador em `components/maps/leaflet.ts` no mesmo modelo de `components/charts/plotly.ts`. O Leaflet não entra no `package.json`.

**2. Fundo de ruas do CARTO, com a chave em variável de ambiente.**
- A chave fica na variável `NEXT_PUBLIC_CARTO_API_KEY`, criada na Vercel para os ambientes Production e Preview. Localmente, quem precisar do fundo põe a chave num `.env.local`, que o Git ignora.
- A chave nunca é escrita no código, no guideline nem em outra entrada do estudo.
- O prefixo `NEXT_PUBLIC_` faz o Next colocar o valor na página. O site é estático e o navegador baixa o fundo direto do CARTO, então a chave é pública por natureza. A proteção é restringir a chave, na conta do CARTO, aos domínios da GRAF na Vercel e ao domínio final.
- Sem a chave (build do GitHub, ambiente local sem `.env.local`), o mapa funciona sem o fundo de ruas: desenha pontos e traçados sobre fundo neutro, com um aviso discreto, e o build não falha.

**3. Um mapa base e dois blocos.**

```
components/maps/
  leaflet.ts       carregador do Leaflet por CDN
  MapaBase.tsx     mapa Leaflet + fundo CARTO, zoom, atribuição, vista inicial,
                   ajuste aos elementos, botão de recentralizar e aviso sem chave
  MapaRoscas.tsx   bloco mapa_roscas: um ponto por linha, com rosca por categoria e tamanho por valor;
                   filtros, lista ao lado e caixa ao clicar
  MapaTrechos.tsx  bloco mapa_trechos: traçados em camadas, com cor e espessura por campo;
                   liga/desliga, ordem das camadas, legenda e caixa do trecho
```

- O `MapaBase` não conhece estudo nem dado: recebe a vista inicial e o que desenhar. Um tipo novo de mapa no futuro (pontos coloridos, calor) reaproveita o `MapaBase` e vira outro bloco.
- `mapa_roscas` e `mapa_trechos` entram no catálogo (`composicao.schema.json`), com validação em `scripts/validacao.mjs`, como os demais blocos. Recebem nomes de tabela e de campo pela composição: ponto, categoria, valor, rótulo, filtros, camadas, campos de cor e de espessura e campos da caixa de detalhe. Textos de interface vêm do guideline e cores, de `lib/report/tokens.ts`.
- Cores de mapa entram em `tokens.ts` e no `@theme` do `app/globals.css`: as cores das camadas e uma paleta sequencial para faixas, como as de ocupação.

**4. Seleção compartilhada no kit.** No estudo, escolher uma instalação portuária no comparativo abre o mapa interativo e atualiza os indicadores e o cadastro. Hoje isso só existe entre componentes próprios, pelo provedor do estudo. Passa a existir uma seleção do kit, oferecida pelo renderizador a toda a página:
- um bloco declara na composição o campo que publica ou lê, por exemplo `"selecao": "id_porto"`;
- quem publica define o valor ao clicar; quem lê filtra as linhas por ele;
- componentes próprios leem e trocam a seleção com o hook `useSelecao(campo)`, de `@/components/report`, sem precisar de provedor próprio para isso. (O renderizador roda no servidor e não consegue passar estado do navegador por props.)

Além dos mapas, leem a seleção os blocos `indicadores` (com `selecao`), `distribuicoes`, `tabela` e `ficha`: com ela, mostram só as linhas do id escolhido. O provedor do estudo continua opcional, para estados que não são seleção.

**5. Geometria no `data.json`.** Pontos e traçados continuam no `data.json` (tipos `geo_ponto` e `geo_linhas`, ADR-002). O peso da página acompanha o detalhe da geometria: o `acessos-portuarios` gerou uma página de 30 MB. O guia de preenchimento passa a recomendar simplificar os traçados antes da entrega. Uma tolerância da ordem de 20 m não muda o desenho nos zooms do estudo e reduz a geometria em mais de 90%.

## Alternativas consideradas

| Opção | Por que não |
|---|---|
| Plotly `scattergeo` (o que o agente usou) | Sem fundo de ruas; inadequado para zoom local |
| Plotly `scattermap` (MapLibre, estilo `carto-positron`) | Não traz biblioteca nova e tem fundo de ruas, mas roscas e camadas reordenáveis não são nativas: as roscas teriam de ser SVG sobreposto, sem acompanhar o zoom |
| `react-leaflet` ou `leaflet` pelo npm | Dependência nova no build; o kit já carrega o Plotly por CDN, e o mesmo modelo vale para o Leaflet |
| MapLibre GL ou Mapbox | Mais pesados, exigem estilo vetorial; o Mapbox cobra por uso e exige token |
| Mapas como componentes próprios em cada estudo | Repete código complexo a cada estudo e deixa para o agente decisões de biblioteca e credencial |
| Fundo do OpenStreetMap sem chave | A política de uso dos servidores do OSM não é feita para sites com tráfego de produção; e o fundo do CARTO é o do painel de referência |

## Consequências

**Positivas**
- Mapas com a mesma experiência do painel de referência: fundo de ruas, zoom e roscas presas ao ponto.
- O agente monta mapas pela composição, sem decidir biblioteca nem credencial.
- Um estudo novo com mapa sai sem componente próprio para o mapa.

**Negativas / trade-offs**
- Mais uma biblioteca externa carregada em runtime e um fornecedor de fundo de mapa (CARTO), dos quais o site passa a depender.
- A chave fica visível no navegador; depende da restrição por domínio na conta do CARTO.
- Previews e builds sem a chave mostram o mapa sem fundo de ruas.

**Passa a ser obrigatório**
- A chave do CARTO só em variável de ambiente (`NEXT_PUBLIC_CARTO_API_KEY`), nunca no repositório nem nas entradas do estudo.
- Mapas de estudos novos usam os blocos do kit. Componente próprio de mapa só quando nenhum bloco atender, sobre o `MapaBase`.
- Cores de mapa vêm de `lib/report/tokens.ts`.

## Pendências

- Confirmar se a licença do CARTO usada pela GRAF cobre a publicação dos estudos (uso comercial, limite de acessos) e restringir a chave por domínio.
- Atualizar o `CLAUDE.md` (stack: Leaflet por CDN), o guia de preenchimento (simplificação da geometria) e as guidelines de uso dos blocos quando os blocos entrarem no kit.

## Revisitar quando

A licença ou o limite do CARTO não atender, um estudo precisar de mapa vetorial ou com milhares de elementos por vista, ou o peso da geometria passar a comprometer a abertura das páginas.
