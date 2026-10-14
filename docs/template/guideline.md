---
# Responde: como montar o report. Cita análises, leituras, conclusões e ressalvas da metodologia pelo id, sem reescrever o texto delas.
# Os textos deste arquivo são só de interface (títulos, introduções, rótulos). Não trazem números, nomes vindos dos dados nem conclusões.
# Texto com dois-pontos seguido de espaço vai entre aspas, por exemplo intro: "Três camadas: origem, saída e destino."
slug: <slug-do-estudo>                 # igual ao nome da pasta; é o único lugar do conjunto onde o slug aparece
sobretitulo: <Rótulo curto acima do título>   # opcional
titulo: <Título exibido no report>
subtitulo: <Uma frase que diz o que o leitor vai encontrar>
seo:
  titulo: <Título da aba do navegador e dos buscadores>   # opcional; sem ele, vale o titulo
  descricao: <Até 160 caracteres para buscadores>
meta:                                  # opcional; informações do topo além de fonte e período, que vêm do data.json
  - rotulo: <Rótulo exibido>           # texto de interface, ex.: Recorte principal
    leitura: <l1>                      # id de leitura da metodologia com o texto exibido
tabelas:                               # tabelas e campos do data.json que o report usa, no mesmo formato de tabelas.<tabela>.campos do data.json
  <tabela>:
    campos: [<campo>, <campo>]
rotulos:                               # nome exibido de cada campo usado em eixo, legenda, filtro ou controle
  <campo>: <Rótulo exibido>
secoes:                                # em ordem de exibição
  - id: <id-da-secao>
    sobretitulo: <Rótulo curto acima do título da seção>   # opcional
    titulo: <Título da seção>          # opcional
    intro: <Texto de interface da seção, por exemplo como usar os controles>   # opcional
    analises:                          # análises da metodologia exibidas na seção
      - id: <id-da-analise>
        titulo: <Título do gráfico ou bloco>      # opcional
        descricao: <Uma frase sobre o gráfico>    # opcional
        indicadores:                   # opcional; um cartão por indicador
          - campo: <campo>             # valor do cartão; o nome vem de rotulos
            detalhe: <l1>              # opcional; id de leitura da metodologia exibida abaixo do valor
    leituras: [<l1>]                   # opcional; ids de leituras da metodologia
    conclusoes:                        # opcional; conclusões da metodologia exibidas na seção
      - id: <c1>
        titulo: <Abertura em negrito da caixa>   # opcional, ex.: Leitura prioritária
        tipo: destaque                 # opcional; estilo da caixa (hoje só destaque)
    ressalvas: [<r1>]                  # opcional; ids de ressalvas da metodologia exibidas nesta seção
visual:                                # opcional; intenção, não código
  <chave>: <descrição>
componentes_novos:                     # vazio se o kit basta
  - nome: <NomeEmPascalCase>
    motivo: <Por que nenhum componente do kit atende>
    comportamento: <O que mostra e como o leitor interage>
    tabelas:
      <tabela>:
        campos: [<campo>]
---

# Guideline: <Título do estudo>

## <id-da-secao>
<O que a seção deve mostrar, o que destacar, que comparação fazer e que controle o leitor tem. Cite análises, leituras e conclusões pelo id.>
