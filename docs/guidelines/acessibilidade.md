# Acessibilidade

Regras para que todo report seja legível e utilizável por qualquer leitor, inclusive em celular e com tecnologia assistiva. Respondem ao RNF-07 do PRD: texto alternativo nos gráficos, contraste e leitura em celular.

> **Status: proposta inicial.** As regras seguem a WCAG 2.1, nível AA. Corrigir o que hoje não cumpre muda cores do kit, e isso é decisão de quem responde pela identidade visual (PRD, Q9). Ajustes que não mudam o visual podem entrar como props opcionais nos componentes (PRD, Q10).
>
> **Prioridade: depois do lançamento da primeira versão.** As pendências abaixo não bloqueiam a publicação de estudos nem a primeira versão da esteira. As cores e o rodapé atuais continuam como estão até haver decisão de design.

## Regras

1. **Contraste mínimo** (WCAG 1.4.3 e 1.4.11):
   - texto normal: 4,5:1;
   - texto grande (a partir de 24 px, ou 18,7 px em negrito): 3:1;
   - elementos gráficos necessários para entender a informação, como barras e linhas: 3:1 contra o fundo.
2. **A cor nunca é o único meio de informação.** Toda série, barra ou nó tem nome visível na legenda ou no rótulo. Destaques têm texto, além da cor.
3. **Todo gráfico tem equivalente em texto.**
   - Título e descrição visíveis (do guideline).
   - Texto alternativo para leitor de tela, que diga o que o gráfico mostra.
   - A principal leitura do gráfico também aparece em texto, numa leitura ou conclusão da metodologia, para quem não vê o gráfico.
4. **Controles operáveis por teclado e anunciados.** Botões de filtro informam qual está ativo, e seletores têm rótulo associado.
5. **Leitura em celular.** A página funciona com 390 px de largura sem rolagem horizontal; blocos lado a lado empilham; gráficos mantêm rótulos legíveis.
6. **Idioma declarado.** A página declara `pt-BR`, para a leitura correta por leitores de tela.
7. **Checagem automática.** Antes da publicação, o report passa por uma checagem automática de acessibilidade (critério do RNF-07).

## Situação atual

Medido em 15/10/2026 nos componentes do kit:

| Uso | Contraste | Mínimo | Situação |
|---|---|---|---|
| Títulos e texto forte (`deep`) sobre branco | 17,45:1 | 4,5:1 | Cumpre |
| Texto corrido (`secondary`) sobre branco | 7,07:1 | 4,5:1 | Cumpre |
| Introduções, descrições de gráfico e rótulos de indicador (`text`) sobre branco | 4,29:1 | 4,5:1 | **Não cumpre** |
| Sobretítulo de seção (`accent`, 11 px) sobre branco | 1,99:1 | 4,5:1 | **Não cumpre** |
| Topo: sobretítulo, subtítulo e metadados sobre `deep` | 8,65 a 13,78:1 | 4,5:1 | Cumpre |
| Valor da mensagem-chave (`orange`, 38 px) sobre branco | 1,98:1 | 3:1 | **Não cumpre** |
| Texto da caixa de destaque e da nota sobre os fundos claros | 6,50 a 6,69:1 | 4,5:1 | Cumpre |
| Rodapé sobre `dark` | 14,25:1 | 4,5:1 | Cumpre |
| Barras do ranking (`primary` e `accent`) sobre branco | 2,0:1 | 3:1 | **Não cumpre** |

| Regra | Situação |
|---|---|
| Cor não é o único meio | Cumpre: séries com legenda, barras com rótulo, destaque com título |
| Texto alternativo nos gráficos | **Não cumpre:** os gráficos não têm texto alternativo |
| Controles anunciados | **Parcial:** são botões e seletores nativos, operáveis por teclado, mas os botões de filtro não informam qual está ativo, e os seletores não têm rótulo |
| Leitura em celular | Cumpre na largura de 390 px |
| Idioma declarado | Cumpre (`lang="pt-BR"`) |
| Checagem automática | **Não existe** |

## Pendências

**Precisam de decisão de design, porque mudam o visual:**
- Escurecer o cinza `text` até pelo menos 4,5:1. Uma pequena mudança, de `#7A7A7A` para `#767676`, já atinge 4,54:1.
- Escolher um tom de verde para os sobretítulos que atinja 4,5:1, ou passar os sobretítulos para outra cor.
- Escolher como dar contraste ao valor da mensagem-chave e às barras dos rankings: tons mais escuros, ou um contorno.

**Podem entrar sem mudar o visual** (props opcionais, PRD Q10):
- Texto alternativo nos gráficos: um rótulo acessível no gráfico, montado a partir do título e da descrição do guideline.
- `aria-pressed` nos botões de filtro e um rótulo acessível nos seletores.
- Checagem automática de acessibilidade no workflow `Validação`.
