---
# Responde: como montar o report. Cita análises, leituras, conclusões e ressalvas da metodologia pelo id, sem reescrever o texto delas.
# Os textos deste arquivo são só de interface (títulos, introduções, rótulos). Não trazem números, nomes vindos dos dados nem conclusões.
slug: acessos-portuarios
sobretitulo: Infraestrutura rodoviária · Portos organizados
titulo: Acessos rodoviários aos portos organizados
subtitulo: Quanto da malha rodoviária no entorno dos portos já está comprometida pelo tráfego que leva e busca cargas nos portos e terminais, trecho a trecho.
seo:
  titulo: Acessos rodoviários aos portos organizados | GRAF Infra Consulting
  descricao: Ocupação da malha rodoviária a até 50 km dos portos organizados, trecho a trecho, com o VMDa 2025 e a capacidade do DNIT.
meta:
  - rotulo: Recorte
    leitura: recorte
tabelas:
  parametros:
    campos: [raio_km, limite_ocupacao_elevada_pct, ano_vmda, nota_tecnica, programa_contagem, classificacao_urbana]
  resumo:
    campos: [instalacoes, ufs, links, associacoes, extensao_malha_km, extensao_calculada_km, cobertura_capacidade_pct, cobertura_vmda_pct, extensao_70_km, participacao_70_pct, extensao_100_km]
  instalacoes:
    campos: [id_porto, instalacao, rotulo, uf, regiao, ponto, links, extensao_total_km, extensao_calculada_km, extensao_70_km, participacao_70_pct, extensao_80_km, extensao_sem_vmda_km, codigo, tipo, situacao, gestao, administradora, sitio, endereco, complemento, numero, bairro, cep, municipio, regiao_hidrografica, localizacao, observacao]
  instalacao_faixa:
    campos: [id_porto, faixa, ordem, extensao_km, participacao_pct]
  instalacao_distribuicao:
    campos: [id_porto, dimensao, categoria, extensao_km]
  instalacao_rodovia:
    campos: [id_porto, rodovia, ocupacao_media_pct, ocupacao_maxima_pct]
  trechos:
    campos: [id_porto, id_link, id_pnct, codigo_br, codigo_snv, uf, linhas, extensao_km, superficie, jurisdicao, tipo_link, relevo, velocidade_kmh, classificacao, legenda, vmda_ab, vmda_ba, vmda_crescente, vmda_decrescente, vmda_total, cap_hora_sentido, cap_dia_sentido, ocupacao_pct, faixa_ocupacao, classe_mapa]
rotulos:
  # cartões do resumo da base
  instalacoes: Instalações portuárias
  links: Links rodoviários
  extensao_malha_km: Extensão da malha
  cobertura_capacidade_pct: Cobertura dos dados
  extensao_70_km: Ocupação de 70% ou mais
  # comparativo e controles
  regiao: Região
  uf: Estado
  instalacao: Instalação portuária
  ponto: Instalação portuária selecionada
  rotulo: Instalação portuária
  faixa: Faixa de ocupação
  extensao_km: Extensão
  participacao_pct: Parcela
  extensao_calculada_km: Total com ocupação
  # cartões de uma instalação portuária
  extensao_total_km: Extensão total
  participacao_70_pct: Parcela da extensão total
  extensao_sem_vmda_km: Sem VMDA informado
  dimensao: Atributo
  categoria: Categoria
  rodovia: Rodovia
  ocupacao_media_pct: Média
  ocupacao_maxima_pct: Máxima
  # atributos do link, na caixa de detalhe do mapa
  id_link: Identificador do link rodoviário
  id_pnct: Identificador PNCT
  codigo_br: Código BR
  codigo_snv: Código SNV
  superficie: Tipo de superfície
  jurisdicao: Jurisdição
  tipo_link: Tipo de link
  relevo: Relevo predominante
  velocidade_kmh: Velocidade regulamentada
  classificacao: Classificação
  legenda: Legenda
  vmda_ab: VMDA sentido A–B
  vmda_ba: VMDA sentido B–A
  vmda_crescente: VMDA sentido crescente
  vmda_decrescente: VMDA sentido decrescente
  vmda_total: VMDA total
  cap_hora_sentido: Capacidade horária por sentido
  cap_dia_sentido: Capacidade diária por sentido
  ocupacao_pct: Ocupação
  classe_mapa: Ocupação
  # cadastro da ANTAQ
  codigo: Código da instalação portuária
  tipo: Tipo de instalação portuária
  situacao: Situação cadastral
  gestao: Modelo de gestão
  administradora: Companhia administradora
  sitio: Sítio na internet
  endereco: Endereço
  complemento: Complemento
  numero: Número
  bairro: Bairro
  cep: CEP
  municipio: Município
  regiao_hidrografica: Região hidrográfica
  localizacao: Localização
  observacao: Observação
secoes:
  - id: mensagem-chave
    analises:
      - id: ocupacao-elevada
    conclusoes:
      - id: extensao-ocupacao-elevada
        tipo: destaque
  - id: sobre-a-analise
    sobretitulo: Sobre esta análise
    titulo: Oferta rodoviária e uso nos acessos portuários
    intro: O que a base reúne, o que se quer medir e como os números abaixo foram obtidos.
    leituras: [contexto, objetivo, fonte-e-tratamento, capacidade]
    analises:
      - id: resumo-base
        indicadores:
          - campo: instalacoes
            detalhe: detalhe-instalacoes
          - campo: links
            detalhe: detalhe-links
          - campo: extensao_malha_km
            detalhe: detalhe-extensao-malha
          - campo: cobertura_capacidade_pct
            detalhe: detalhe-cobertura
  - id: comparativo
    sobretitulo: Comparativo
    titulo: Ocupação dos acessos por instalação portuária
    intro: Cada rosca mostra como a extensão dos acessos de uma instalação portuária se distribui pelas faixas de ocupação, e seu tamanho acompanha a extensão com ocupação calculada. Filtre por região ou estado e clique em uma instalação portuária para abri-la no mapa interativo.
    analises:
      - id: comparativo-instalacoes
        titulo: Extensão por faixa de ocupação
        descricao: Ordenado pela extensão com ocupação de 80% ou mais.
  - id: mapa-interativo
    sobretitulo: Mapa interativo
    titulo: Acessos de cada instalação portuária
    intro: Escolha uma instalação portuária para desenhar seus trechos de acesso nas três camadas temáticas. Clique em um trecho para ver seus atributos e arraste as camadas na lista para definir qual fica por cima.
    analises:
      - id: mapa-acessos
  - id: indicadores-da-selecao
    sobretitulo: Indicadores da seleção
    titulo: Extensão, ocupação e perfil da malha
    intro: Selecione uma instalação portuária no seletor do mapa para ver os indicadores. Extensões em quilômetros, quando informadas na base.
    analises:
      - id: indicadores-instalacao
        titulo: Ocupação por rodovia
        descricao: Média ponderada pela extensão e máximo entre os links de cada rodovia.
        indicadores:
          - campo: extensao_total_km
            detalhe: detalhe-extensao-instalacao
          - campo: extensao_70_km
            detalhe: detalhe-70-instalacao
          - campo: extensao_sem_vmda_km
            detalhe: detalhe-sem-vmda-instalacao
  - id: cadastro
    sobretitulo: Cadastro
    titulo: Dados da instalação portuária selecionada
    intro: Atributos cadastrais da ANTAQ para a instalação portuária escolhida no mapa.
    analises:
      - id: cadastro-instalacao
  - id: como-interpretar
    sobretitulo: Como interpretar
    titulo: Ressalvas da leitura
    ressalvas: [ocupacao-so-com-vmda, ocupacao-bidirecional, links-compartilhados, vmda-estimativa, raio-em-linha-reta]
visual:
  mensagem_chave: "Número grande com a extensão com ocupação de 70% ou mais, em km, seguido da conclusão, com o texto centralizado na altura do número; os valores dos marcadores em destaque."
  resumo_base: Quatro cartões de indicadores lado a lado, abaixo dos tópicos de "Sobre esta análise".
  comparativo: "Mapa do Brasil com uma rosca por instalação portuária e, ao lado, lista com barras empilhadas por faixa de ocupação."
  faixas_de_ocupacao: "Seis faixas em escala sequencial, do verde (0% a 20%) ao vermelho (acima de 100%), com a mesma cor no comparativo e nos indicadores da seleção."
  mapa: "Mapa claro, com três camadas de linhas (VMDA, capacidade e ocupação) e o ponto da instalação portuária; espessura cresce com o valor."
componentes_novos:
  - nome: MapaComparativoOcupacao
    motivo: O kit não tem mapa. O comparativo precisa mostrar a posição das instalações portuárias no país e a composição por faixa de cada uma ao mesmo tempo.
    comportamento: "Mapa do Brasil com uma rosca por instalação portuária no seu ponto, dividida pelas faixas de ocupação (instalacao_faixa, na ordem do campo ordem) e com diâmetro proporcional à raiz de extensao_calculada_km. Ao lado, lista das instalações portuárias com barra empilhada por faixa, ordenada por extensao_80_km e depois por extensao_calculada_km, com o total em km. Dois filtros, Região e Estado, começando em todas; o de estado lista só as UFs da região escolhida. Passar o mouse mostra o nome com a UF; clicar na rosca abre uma caixa com a extensão e a parcela de cada faixa e o botão Ver no mapa interativo; clicar na lista ou nesse botão seleciona a instalação portuária no MapaAcessosPortuarios e rola até ele. Abaixo, a legenda das seis faixas."
    tabelas:
      instalacoes:
        campos: [id_porto, rotulo, uf, regiao, ponto, extensao_calculada_km, extensao_80_km]
      instalacao_faixa:
        campos: [id_porto, faixa, ordem, extensao_km, participacao_pct]
  - nome: MapaAcessosPortuarios
    motivo: O kit não tem mapa com traçados de rodovias nem camadas temáticas.
    comportamento: "Seletor de instalação portuária, em ordem alfabética, começando vazio, com a dica Selecione a instalação portuária para ver no mapa seus acessos rodoviários e, abaixo, os indicadores e os dados cadastrais. Sem seleção, o mapa mostra o aviso Selecione uma instalação portuária na lista ao lado para ver os detalhes. Com seleção, desenha os trechos da instalação portuária em três camadas e o ponto dela, e centraliza o mapa; um botão recentraliza. Camadas, de cima para baixo: Instalação portuária selecionada, Ocupação VMDA / capacidade (espessura por classe_mapa, só links com ocupação), Capacidade diária (cap_dia_sentido) e VMDA total (vmda_total). Nas duas últimas, a espessura cresce em faixas de 5.000 veículos/dia e, acima de 30.000, 1 px a cada 5.000. O leitor liga e desliga cada camada e muda a ordem arrastando ou com as setas do teclado, com o anúncio da nova posição para leitores de tela. Passar o mouse num trecho mostra o código BR e o valor da camada; clicar abre a caixa Informações do link com os atributos do trecho, na ordem de tabelas.trechos, com os rótulos de rotulos. Legenda com os títulos VMDA total (veículos/dia), Capacidade diária por sentido (veículos/dia) com a nota sobre a espessura acima de 30.000, Ocupação (VMDA ÷ capacidade) e Instalação portuária selecionada. A seleção é compartilhada com IndicadoresInstalacao e CadastroInstalacao."
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, ponto]
      trechos:
        campos: [id_porto, id_link, id_pnct, codigo_br, codigo_snv, uf, linhas, extensao_km, superficie, jurisdicao, tipo_link, relevo, velocidade_kmh, classificacao, legenda, vmda_ab, vmda_ba, vmda_crescente, vmda_decrescente, vmda_total, cap_hora_sentido, cap_dia_sentido, ocupacao_pct, classe_mapa]
  - nome: IndicadoresInstalacao
    motivo: Os cartões e distribuições do kit mostram valores fixos; aqui eles acompanham a instalação portuária escolhida no mapa.
    comportamento: "Três cartões: Extensão total (extensao_total_km, detalhe com o número de links e a leitura detalhe-extensao-instalacao), Ocupação de 70% ou mais (extensao_70_km, detalhe com participacao_70_pct e a leitura detalhe-70-instalacao) e Sem VMDA informado (extensao_sem_vmda_km, leitura detalhe-sem-vmda-instalacao). Sem seleção, os cartões mostram travessão e Aguardando seleção. Abaixo, cartões com barras horizontais da extensão por categoria, nesta ordem: Superfície e Jurisdição (5 maiores), Velocidade (6 maiores) e Ocupação por faixa (as seis faixas, nas cores das faixas, ordem do campo ordem). Depois, uma tabela Ocupação por rodovia, com subtítulo Média ponderada pela extensão e máximo entre os links de cada rodovia, ordenada pela máxima, destacando máximas acima de 100%. Por último, o cartão de Classificação (5 maiores)."
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, links, extensao_total_km, extensao_70_km, participacao_70_pct, extensao_sem_vmda_km]
      instalacao_faixa:
        campos: [id_porto, faixa, ordem, extensao_km]
      instalacao_distribuicao:
        campos: [id_porto, dimensao, categoria, extensao_km]
      instalacao_rodovia:
        campos: [id_porto, rodovia, ocupacao_media_pct, ocupacao_maxima_pct]
  - nome: CadastroInstalacao
    motivo: Tabela de atributos de um registro escolhido pelo leitor, que o kit não tem.
    comportamento: "Tabela de duas colunas (atributo e valor) com o cadastro da instalação portuária selecionada no mapa, na ordem de tabelas.instalacoes a partir de codigo, com os rótulos de rotulos e travessão nos vazios. O título da seção ganha o nome da instalação portuária. Sem seleção, mostra Selecione uma instalação portuária para ver os dados cadastrais."
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, codigo, tipo, situacao, gestao, administradora, sitio, endereco, complemento, numero, bairro, cep, municipio, uf, regiao_hidrografica, localizacao, observacao]
---

# Guideline: Acessos rodoviários aos portos organizados

O report segue o painel de acessos portuários da GRAF (versão de 06/10/2026). O leitor parte do número nacional, compara as instalações
portuárias no mapa do Brasil e desce para os trechos, os indicadores e o cadastro de uma instalação portuária. Sempre escrever
"instalação portuária", nunca só "instalação".

## mensagem-chave
Logo abaixo do topo, a mensagem-chave do estudo: o número grande é a extensão com ocupação de 70% ou mais (`resumo.extensao_70_km`, em km)
e o texto é a conclusão `extensao-ocupacao-elevada`, com os valores em destaque. É a primeira coisa que o leitor vê.

## sobre-a-analise
Quatro tópicos curtos, em lista, cada um com a abertura em negrito: Contexto (`contexto`), Objetivo (`objetivo`), Fonte e tratamento
(`fonte-e-tratamento`) e Capacidade (`capacidade`). Em `fonte-e-tratamento`, a frase sobre a atualização anual do VMDa vai em negrito.
Abaixo, os quatro cartões do resumo da base, nesta ordem: instalações portuárias, links rodoviários, extensão da malha (km) e cobertura dos
dados (%). Cada cartão tem a leitura de detalhe indicada no cabeçalho.

## comparativo
Componente `MapaComparativoOcupacao`. O mapa ocupa a maior parte da largura e a lista fica ao lado; em telas pequenas, a lista vai para
baixo do mapa. Os filtros Região e Estado ficam acima, com a contagem de instalações portuárias exibidas. O leitor compara as instalações
portuárias pela parte da extensão nas faixas altas; o destaque visual são as faixas de 80% ou mais.

## mapa-interativo
Componente `MapaAcessosPortuarios`, com o painel de controle (seletor, camadas e legenda) à esquerda e o mapa à direita. A camada de ocupação
começa por cima, depois capacidade e VMDA; todas começam ligadas. O mapa abre no Brasil inteiro.

## indicadores-da-selecao
Ligado à seleção do mapa. As distribuições ficam em grade de cartões, e a tabela de ocupação por rodovia rola dentro do cartão quando é longa.

## cadastro
Componente `CadastroInstalacao`, ligado à seleção do mapa.

## como-interpretar
Nota final com as cinco ressalvas da metodologia, em lista com marcadores.
