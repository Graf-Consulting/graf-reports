# Uso dos blocos

Quando usar cada bloco do kit, quantos itens cada um comporta e como organizar o report. Vale para quem escreve o `guideline.md` de um estudo e para o agente que escolhe os blocos (`02-compor-report`).

> **Status: proposta inicial.** As regras partem do estudo `impacto-restricoes-ue` e de boas práticas de visualização de dados. Precisam ser validadas por quem responde pela identidade visual (PRD, Q9). Até lá, valem como padrão; um estudo pode fugir delas se o `guideline.md` pedir e explicar o motivo.

## Escolha pelo que a análise quer mostrar

O bloco sai da pergunta que a análise responde, e não do formato dos dados.

| A análise quer mostrar... | Bloco | Não use quando... |
|---|---|---|
| Um número que resume o estudo inteiro | `mensagem_chave` | Houver mais de um número igualmente importante; aí use `indicadores` |
| Até 4 números de um mesmo recorte, lado a lado | `indicadores` | Os números precisarem de comparação entre si; aí use `ranking` |
| Quem é maior ou menor entre categorias | `ranking` | As categorias forem períodos de tempo; aí use `serie_empilhada` |
| Como a composição de um total muda no tempo | `serie_empilhada` | Os valores não puderem ser somados (preços, taxas, médias, percentuais); o kit ainda não tem gráfico de linhas, então isso pede um componente próprio |
| Onde ficam os pontos e como o total de cada um se divide em faixas | `mapa_roscas` | Os pontos não tiverem localização (`geo_ponto`) ou as faixas não somarem o total do ponto |
| Os traçados ligados a um ponto escolhido pelo leitor, com camadas de valores | `mapa_trechos` | Não houver traçado (`geo_linhas`); aí, um ranking dos trechos |
| Para onde o volume vai, de uma etapa para outra | `fluxo` | Houver mais de 3 etapas ou dezenas de categorias por etapa |
| A conclusão principal de uma seção | `destaque` | O texto for contexto ou leitura, e não conclusão; aí use uma leitura na introdução |
| Como interpretar os resultados e seus limites | `nota` | — |
| Dois ou três blocos que se comparam | `grupo` | Os blocos tratarem de coisas diferentes ou tiverem alturas muito diferentes |
| Algo que nenhum bloco atende | componente próprio (`03-gerar-componente`) | Um bloco do kit resolver, mesmo que com outro visual |

## Limites por bloco

| Bloco | Limite | Por quê |
|---|---|---|
| `mensagem_chave` | Uma por report, logo depois do topo | É a primeira coisa que o leitor vê; duas competem |
| `indicadores` | Até 4 cartões (limite do schema) | Cabem numa linha no desktop e em duas no celular |
| `ranking` | Padrão de 10 itens; até 15 | Acima disso, as barras ficam finas demais e os nomes se sobrepõem |
| `serie_empilhada` | Padrão de 10 séries; até 10 | Acima disso, as cores deixam de se distinguir; a paleta tem 12 |
| `mapa_roscas` | Até 6 faixas na escala sequencial; acima disso, cores categóricas | A escala sequencial de `BAND_PALETTE` tem 6 cores |
| `mapa_trechos` | Até 5 camadas | Mais camadas sobrepostas deixam de se distinguir |
| `fluxo` | Até 3 camadas; padrão de 100 caminhos; até cerca de 20 categorias por camada | Acima disso, os nós ficam ilegíveis |
| `destaque` | Um por seção | Vários destaques deixam de destacar |
| `grupo` | 2 colunas; 3 só para blocos compactos, como rankings curtos | Em 3 colunas, gráficos largos ficam apertados |

**Itens fora do limite.** Ranking, série e fluxo mostram só os maiores; o resto não aparece. Se o que fica de fora for uma parte relevante do total, os dados devem trazer uma categoria "Outros" já somada no `data.json`, porque o report não faz contas (ADR-002).

## Ordem do report

Ordem padrão, do geral para o detalhado:

1. **Topo:** título, subtítulo, fonte, período e recorte (sai do guideline e do `metadata`).
2. **Mensagem-chave:** o número principal e a leitura dele.
3. **Visão executiva:** os indicadores do recorte principal.
4. **Seções de análise:** das mais gerais (quem e quanto) para as mais detalhadas (como evolui, por onde passa).
5. **Nota final:** como interpretar e as ressalvas.

Cada seção mostra uma ideia. Se a introdução precisar de "e" para explicar o que a seção mostra, provavelmente são duas seções.

## Textos de interface

- **Título de seção:** curto, de preferência uma afirmação sobre o que a seção revela ("Onde se concentra a exposição"), e não só o assunto ("Exposição").
- **Sobretítulo:** o assunto da seção em poucas palavras ("Mercados e origens").
- **Introdução:** uma ou duas frases sobre o que a seção mostra e, se houver controles, como usá-los.
- **Título de gráfico:** o que é medido e em que recorte ("Países de destino").
- **Descrição de gráfico:** uma frase sobre o que o leitor encontra.
- **Rótulos:** o nome que o leitor reconhece, sem siglas técnicas de banco de dados (`vl_fob` vira "Valor FOB").

Os textos de análise (leituras, conclusões e ressalvas) seguem o [guia de preenchimento](../guia-de-preenchimento.md) e vêm da metodologia.

## Controles

- O primeiro item de cada lista de opções é o estado inicial; comece pelo recorte mais importante para a análise.
- Ofereça só as alternativas que a metodologia sustenta. Um filtro de ano, por exemplo, só lista anos que existem nos dados.
- Evite mais de dois controles por gráfico.
