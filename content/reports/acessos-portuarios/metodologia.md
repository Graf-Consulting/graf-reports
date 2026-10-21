---
# Responde: como usar os dados corretamente e o que é verdade. Não fala de layout, cor ou componente.
# Slug e título ficam no guideline.md; data de referência, período e fontes ficam no metadata do data.json.
analises:
  - id: ocupacao-elevada
    titulo: Extensão com ocupação elevada
    tabelas:
      resumo:
        campos: [extensao_calculada_km, extensao_70_km, participacao_70_pct, extensao_100_km]
  - id: resumo-base
    titulo: Resumo da base
    tabelas:
      resumo:
        campos: [instalacoes, ufs, links, associacoes, extensao_malha_km, cobertura_capacidade_pct, cobertura_vmda_pct]
  - id: comparativo-instalacoes
    titulo: Ocupação dos acessos por instalação portuária
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, rotulo, uf, regiao, ponto, extensao_calculada_km, extensao_80_km]
      instalacao_faixa:
        campos: [id_porto, faixa, ordem, extensao_km, participacao_pct]
  - id: mapa-acessos
    titulo: Acessos rodoviários de cada instalação portuária
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, ponto]
      trechos:
        campos: [id_porto, id_link, id_pnct, codigo_br, codigo_snv, uf, linhas, extensao_km, superficie, jurisdicao, tipo_link, relevo, velocidade_kmh, classificacao, legenda, vmda_ab, vmda_ba, vmda_crescente, vmda_decrescente, vmda_total, cap_hora_sentido, cap_dia_sentido, ocupacao_pct, faixa_ocupacao, classe_mapa]
  - id: indicadores-instalacao
    titulo: Indicadores dos acessos de uma instalação portuária
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, links, extensao_total_km, extensao_70_km, participacao_70_pct, extensao_sem_vmda_km]
      instalacao_faixa:
        campos: [id_porto, faixa, ordem, extensao_km]
      instalacao_distribuicao:
        campos: [id_porto, dimensao, categoria, extensao_km]
      instalacao_rodovia:
        campos: [id_porto, rodovia, ocupacao_media_pct, ocupacao_maxima_pct]
  - id: cadastro-instalacao
    titulo: Cadastro da instalação portuária
    tabelas:
      instalacoes:
        campos: [id_porto, instalacao, codigo, tipo, situacao, gestao, administradora, sitio, endereco, complemento, numero, bairro, cep, municipio, uf, regiao_hidrografica, localizacao, observacao]
leituras:
  - id: recorte
    analise: resumo-base
    texto: "{instalacoes} portos organizados em {ufs} UFs, links a até 50 km"
    valores:
      - id: instalacoes
        tabela: resumo
        campo: instalacoes
        formato: texto
      - id: ufs
        tabela: resumo
        campo: ufs
        formato: texto
  - id: contexto
    texto: "Os portos organizados dependem da malha rodoviária do seu entorno para receber e escoar cargas. Este relatório reúne, para cada instalação portuária, os trechos rodoviários da sua área de acesso e compara, trecho a trecho, duas grandezas: o volume médio diário anual de veículos (VMDA) e a capacidade diária da via."
  - id: objetivo
    texto: "O objetivo é apresentar a infraestrutura rodoviária disponível nas regiões próximas aos portos e indicar quanto dessa infraestrutura está suportando o volume de veículos que levam e buscam cargas nos portos e terminais vizinhos. A razão entre VMDA e capacidade, chamada aqui de ocupação, separa os trechos com folga daqueles que se aproximam do limite, a partir de 70%, e dos que já operam acima da capacidade."
  - id: fonte-e-tratamento
    texto: "As informações foram obtidas a partir de uma série de tratamentos sobre a base de VMDa do DNIT, estimada no Plano Nacional de Contagem de Tráfego (PNCT) para a rede rodoviária vetorizada. O VMDa é atualizado anualmente pelo DNIT; esta versão usa o VMDa 2025, publicado com a Nota Técnica nº 001/2026. Para cada instalação portuária, foram consultados todos os links situados a até 50 km do ponto da instalação portuária, e esses links foram associados ao cadastro da ANTAQ."
  - id: capacidade
    texto: "A capacidade de cada link segue a tabela de valores referenciais de capacidade por tipo de superfície, pista e relevo proposta pelo DNIT na Nota Técnica nº 001/2026, que sintetiza a metodologia de estimativa do VMDa 2025. Como o VMDA soma os dois sentidos do trecho, a ocupação o compara com a capacidade dos dois sentidos, o dobro da capacidade diária por sentido da nota técnica."
  - id: detalhe-instalacoes
    analise: resumo-base
    texto: "Portos organizados em {ufs} unidades federativas"
    valores:
      - id: ufs
        tabela: resumo
        campo: ufs
        formato: texto
  - id: detalhe-links
    analise: resumo-base
    texto: "Trechos distintos nas áreas de acesso ({associacoes} associações entre instalação portuária e link)"
    valores:
      - id: associacoes
        tabela: resumo
        campo: associacoes
        formato: compact
  - id: detalhe-extensao-malha
    analise: resumo-base
    texto: "Trechos de rodovias (SNV) que fazem interseção com o raio de 50 km das instalações portuárias"
  - id: detalhe-cobertura
    analise: resumo-base
    texto: "dos links com capacidade diária; {cobertura_vmda}% com VMDA"
    valores:
      - id: cobertura_vmda
        tabela: resumo
        campo: cobertura_vmda_pct
        formato: texto
  - id: detalhe-extensao-instalacao
    analise: indicadores-instalacao
    texto: "Links rodoviários na área de acesso da instalação portuária"
  - id: detalhe-70-instalacao
    analise: indicadores-instalacao
    texto: "da extensão total dos acessos da instalação portuária"
  - id: detalhe-sem-vmda-instalacao
    analise: indicadores-instalacao
    texto: "Fora do cálculo de ocupação"
conclusoes:
  - id: extensao-ocupacao-elevada
    analise: ocupacao-elevada
    texto: "{extensao_70} km de rodovias nos acessos portuários operam com 70% ou mais da capacidade diária, {participacao_70}% da extensão em que a ocupação pode ser calculada. Desses, {extensao_100} km já operam acima da capacidade."
    valores:
      - id: extensao_70
        tabela: resumo
        campo: extensao_70_km
        formato: texto
      - id: participacao_70
        tabela: resumo
        campo: participacao_70_pct
        formato: texto
      - id: extensao_100
        tabela: resumo
        campo: extensao_100_km
        formato: texto
ressalvas:
  - id: ocupacao-so-com-vmda
    texto: "A ocupação é calculada apenas nos trechos que têm VMDA e capacidade. Trechos sem VMDA aparecem só na camada de capacidade e são somados à parte."
  - id: ocupacao-bidirecional
    texto: "A ocupação é bidirecional: o VMDA, total dos dois sentidos, é dividido pelo dobro da capacidade diária por sentido. Um sentido mais carregado que o outro pode estar mais perto do limite do que a média indica."
  - id: links-compartilhados
    texto: "Um mesmo link pode servir a mais de um porto. Os totais de cada instalação portuária são completos, mas não devem ser somados entre instalações portuárias."
  - id: vmda-estimativa
    texto: "O VMDa do DNIT é uma estimativa de macrossimulação do tráfego total, de veículos leves e pesados. Links classificados como “Não Simulável”, próximos a grandes áreas urbanas, devem ter seu volume lido com cautela, como recomenda a própria nota técnica."
  - id: raio-em-linha-reta
    texto: "O raio de 50 km é medido em linha reta a partir do ponto da instalação portuária, e não pela distância de viagem."
---

# Metodologia: Acessos rodoviários aos portos organizados

O estudo compara, trecho a trecho, o tráfego estimado pelo DNIT (VMDa 2025 do PNCT) com a capacidade diária da via nos links rodoviários
a até 50 km de cada porto organizado do cadastro da ANTAQ. A razão entre os dois, a ocupação, mostra quanto da malha de acesso aos portos
já está perto do limite ou acima dele. Os dados vêm das views do schema `graf` do datalake da GRAF
(`graf.mvw_acessosportuarios_trecho_v2` e `graf.mvw_acessosportuarios_instalacao`), montadas a partir das tabelas do schema `dnit`.
Todos os totais, faixas e distribuições do `data.json` já vêm calculados.

## Fontes

- **DNIT (PNCT):** VMDa 2025 de toda a rede rodoviária vetorizada (37.469 links), estimado por macrossimulação: matrizes origem e destino
  ajustadas a contagens reais (703 *count locations* na rodada final: postos do PNCT, praças de pedágio, equipamentos de detecção e
  pesquisas sazonais) e alocação de tráfego no TransCAD 8.0. Publicado com a Nota Técnica DNIT nº 001/2026, "Síntese da metodologia para
  estimativa do Volume Médio Diário Anual — VMDa 2025 em toda a malha rodoviária federal pavimentada" (DNIT e COPPE/UFRJ). Na rodada final,
  90,9% dos *count locations* ficam na faixa A do teste GEH para o volume total e 97,7% em A ou B (Tabela 6.3 da nota). A mesma nota traz a
  tabela de capacidade referencial por superfície, tipo de pista e relevo (Tabela 3.1). O VMDa é atualizado anualmente pelo DNIT.
- **ANTAQ:** cadastro de instalações portuárias, com o ponto (latitude e longitude) e os dados cadastrais de cada porto organizado.

## Análises

### Extensão com ocupação elevada
Extensão dos links com ocupação de 70% ou mais (`resumo.extensao_70_km`) e acima de 100% (`resumo.extensao_100_km`), na base inteira.
A participação (`resumo.participacao_70_pct`) é a extensão com 70% ou mais dividida pela extensão com ocupação calculada
(`resumo.extensao_calculada_km`), e não pela extensão total da malha. Cada link conta uma vez, mesmo quando serve a mais de uma instalação
portuária. Valores em km, arredondados ao inteiro; participação em %, de 0 a 100, arredondada ao inteiro.

### Resumo da base
Contagens da base inteira: instalações portuárias (37 portos organizados), UFs, links distintos e associações entre instalação portuária e
link (um link a até 50 km de duas instalações portuárias gera duas associações). A extensão da malha (`extensao_malha_km`) soma a extensão
dos links distintos. A cobertura é a parcela dos links distintos com capacidade diária (`cobertura_capacidade_pct`) e com VMDA
(`cobertura_vmda_pct`). Não use `associacoes` para somar extensão: ela repete os links compartilhados.

### Ocupação dos acessos por instalação portuária
Para cada instalação portuária, extensão dos acessos com ocupação calculada em cada faixa (`instalacao_faixa`): 0% a 20%, 20% a 40%,
40% a 60%, 60% a 80%, 80% a 100% e acima de 100%. O limite superior de cada faixa é exclusivo, exceto em 80% a 100%, que inclui os 100%.
A participação (`instalacao_faixa.participacao_pct`) é sobre a extensão com ocupação calculada da instalação portuária
(`instalacoes.extensao_calculada_km`), que é também a medida do tamanho de cada instalação portuária no comparativo. A ordem do comparativo
usa `instalacoes.extensao_80_km`, a extensão com ocupação de 80% ou mais. A região (`regiao`) é a região geográfica da UF da instalação
portuária e serve de filtro junto com a UF.

### Acessos rodoviários de cada instalação portuária
Uma linha por par instalação portuária × link (`trechos`), com o traçado do link (`linhas`), o VMDA, a capacidade e a ocupação.
- **Seleção dos links:** buffer de 50 km em torno do ponto de cada instalação portuária, calculado em SIRGAS 2000 / UTM 23S (EPSG 31983),
  cruzado com a rede vetorizada do PNCT. O buffer reproduz exatamente os 4.447 pares da base.
- **VMDA:** `vmda_total` soma os dois sentidos; `vmda_ab` e `vmda_ba` são o sentido topológico do link e o inverso; `vmda_crescente` e
  `vmda_decrescente` são os sentidos do SNV, só em rodovias federais.
- **Capacidade:** `cap_dia_sentido` é a capacidade diária por sentido. A rede do PNCT informa superfície, relevo e velocidade, mas não o
  tipo de pista; por isso a capacidade é a média das capacidades da Tabela 3.1 da nota para a mesma superfície, relevo e velocidade (por
  exemplo, duplicada em relevo ondulado a 100 km/h: média de 63.000 e 42.000, 52.500 veículos por dia e sentido). Conectores e travessias
  têm capacidade convencional de 999.999 na nota e ficam sem capacidade.
- **Ocupação:** `ocupacao_pct` = `vmda_total` ÷ (2 × `cap_dia_sentido`), em %, só nos links com os dois valores. O VMDA soma os dois
  sentidos e por isso é comparado com a capacidade dos dois sentidos.
- **Faixas:** `faixa_ocupacao` usa as seis faixas do comparativo; `classe_mapa` usa sete classes (abaixo de 50%, 50% a 60%, 60% a 70%,
  70% a 80%, 80% a 90%, 90% a 100% e acima de 100%), usadas só para a espessura da linha de ocupação no mapa.
- **Classificação e legenda:** "Não Simulável" tem dois sentidos. Em `classificacao`, marca links em mancha urbana (metade ou mais da extensão
  em setores censitários urbanos do Censo 2022), onde as matrizes OD do PNCT não representam os deslocamentos urbanos. Os demais valores são
  "Referencial" (link com contagem real), "Não Pavimentada", "Travessia - Não Simulável", "Conector" e "VMDa estimado". Em `legenda`,
  "Não Simulável" marca links não pavimentados, conectores e links sem VMDa ou com menos de 200 veículos em algum sentido, exceto os
  referenciais; os demais valores são faixas de VMDa. Os dois não coincidem necessariamente.
- **Superfície:** códigos do SNV traduzidos (DUP Duplicada, PAV Pavimentada, LEN Leito natural, IMP Implantada, TRV Travessia). Conectores
  não têm superfície, jurisdição nem relevo; a velocidade deles (999 na base) fica vazia em `velocidade_kmh`.

### Indicadores dos acessos de uma instalação portuária
Totais de uma instalação portuária, somando todos os seus links (`instalacoes`): extensão total (`extensao_total_km`), número de links,
extensão com ocupação de 70% ou mais (`extensao_70_km`), sua participação sobre a extensão total dos acessos (`participacao_70_pct`, note que
o denominador aqui é a extensão total, e não a calculada) e extensão sem VMDA (`extensao_sem_vmda_km`). Extensões em km com uma casa decimal.
- `instalacao_distribuicao`: extensão por categoria de superfície, jurisdição, velocidade e classificação. Links sem a informação, em geral
  conectores, entram como "Não informado" (ou "Conector", na velocidade).
- `instalacao_faixa`: a mesma distribuição por faixa de ocupação do comparativo.
- `instalacao_rodovia`: para cada rodovia (jurisdição e código BR), a ocupação média ponderada pela extensão dos links e a maior ocupação
  entre eles, só com links de ocupação calculada.

### Cadastro da instalação portuária
Atributos do cadastro da ANTAQ, como vêm na base, só com espaços duplicados removidos. O campo `sitio` vem do campo "modalidade" da ANTAQ,
que traz o endereço na internet da administradora.

## Leituras
Os textos de "Sobre esta análise" (`contexto`, `objetivo`, `fonte-e-tratamento` e `capacidade`) são os do painel de acessos portuários da
GRAF, versão de 06/10/2026. Os detalhes dos cartões explicam cada número: os do resumo da base valem para a base inteira, e os de uma
instalação portuária acompanham a instalação portuária escolhida pelo leitor.

## Conclusões
A extensão com ocupação de 70% ou mais é a mensagem principal do estudo. Ela usa a ocupação bidirecional, decidida em 06/10/2026: até a
primeira versão do painel, o VMDA total era dividido pela capacidade de um sentido só, o que dobrava a ocupação de trechos com tráfego
equilibrado. Com a regra atual, a extensão com 70% ou mais caiu de 2.253 km para 627 km, e a acima de 100%, de 1.210 km para 218 km.

## Ressalvas
- **Ocupação só com VMDA:** pouco mais da metade dos links não tem VMDA (veja a cobertura no resumo da base) e fica fora das faixas.
- **Ocupação bidirecional:** a ocupação por sentido, com `vmda_ab` e `vmda_ba`, destacaria o sentido mais carregado, mas os volumes por
  sentido faltam em parte dos links.
- **Links compartilhados:** os totais nacionais do resumo contam cada link uma vez; os totais por instalação portuária, não.
- **VMDa é estimativa:** é modelo, não contagem; vale mais nos links "Referencial" e menos nos "Não Simulável". A desagregação por categoria
  de veículo do PNCT é extrapolada de um subconjunto de contagens; o estudo usa só o VMDa total, sem separar o tráfego portuário.
- **Raio em linha reta:** o buffer de 50 km parte do ponto da instalação portuária no cadastro da ANTAQ.
