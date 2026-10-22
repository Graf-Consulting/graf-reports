import type { ComponentType, ReactNode } from 'react';
import { RankingChart } from '@/components/charts';
import { Footer } from '@/components/layout';
import { MapaRoscas, MapaTrechos } from '@/components/maps';
import {
  Callout,
  ChartCard,
  Distribuicoes,
  Emphasis,
  Ficha,
  Hero,
  IndicadoresSelecao,
  KeyMessage,
  MethodNote,
  MetricCards,
  ReportSection,
  SelecaoProvider,
  TabelaDados,
} from '@/components/report';
import { dataCurta } from '../format';
import { ACCENT_SEQUENCE } from '../tokens';
import BlocoFluxo from './BlocoFluxo';
import BlocoSerieEmpilhada from './BlocoSerieEmpilhada';
import { dadosRoscas, dadosTrechos } from './mapas';
import { dadosDistribuicoes, dadosFicha, dadosTabela, exibir, valoresIndicadores } from './selecao';
import { formatar, partes, preencher, tituloEixo, valorHover, valorUnico, type Parte } from './textos';
import type { Bloco, Composicao, Dados, Formato, Guideline, Linha, Metodologia, PropsProprio, SecaoGuideline, Tabela, Texto, TextoPronto } from './tipos';

type Props = {
  composicao: Composicao;
  dados: Dados;
  guideline: Guideline;
  metodologia: Metodologia;
  /** Registro local dos componentes próprios do estudo, por nome. */
  proprios?: Record<string, ComponentType<PropsProprio & Record<string, unknown>>>;
  /** Opcional. Componente do estudo que envolve a página, para estado compartilhado entre componentes próprios. */
  provedor?: ComponentType<{ children: ReactNode }>;
};

/** Rótulo padrão do kit para a opção "todos" de um filtro. */
const ROTULO_TODOS = 'Todo o período';

/**
 * Monta a página de um estudo a partir da composição (ADR-004).
 * Textos de interface vêm do guideline, textos de análise da metodologia, valores do data.json.
 * O mesmo conjunto de entradas gera sempre a mesma página.
 */
export default function Renderizador({ composicao, dados, guideline, metodologia, proprios = {}, provedor: Provedor }: Props) {
  /**
   * Texto da metodologia pronto para exibir: trechos **em negrito** e, se pedido, marcadores destacados.
   * Sem nenhum negrito, sai como texto simples.
   */
  const rico = (item: Texto, destacar?: (p: Parte) => boolean): ReactNode => {
    const ps = partes(item, dados);
    const negrito = (p: Parte) => Boolean(p.negrito || destacar?.(p));
    if (!ps.some(negrito)) return preencher(item, dados);
    return ps.map((p, i) => (negrito(p) ? <Emphasis key={i}>{p.texto}</Emphasis> : p.texto));
  };
  const busca = (lista: Texto[] | undefined, id: string, tipo: string) => {
    const item = lista?.find((x) => x.id === id);
    if (!item) throw new Error(`${tipo} "${id}" não existe na metodologia`);
    return item;
  };
  const leitura = (id: string) => rico(busca(metodologia.leituras, id, 'leitura'));
  const ressalva = (id: string) => rico(busca(metodologia.ressalvas, id, 'ressalva'));
  const pronto = (lista: Texto[] | undefined, ids: string[] | undefined, tipo: string): Record<string, TextoPronto> =>
    Object.fromEntries((ids ?? []).map((id) => {
      const item = busca(lista, id, tipo);
      return [id, { conteudo: rico(item), destacado: rico(item, (p) => Boolean(p.marcador)), texto: preencher(item, dados) }];
    }));

  const rotulo = (campo: string) => guideline.rotulos?.[campo] ?? campo;
  const unidade = (tabela: string, campo: string) => dados.tabelas[tabela]?.campos[campo]?.unidade;
  /** Valor com a unidade do campo depois, quando o bloco pede mostrar_unidade (ex.: 271,3 mi kg; % vai colado: 88%). */
  const comUnidade = (tabela: string, item: { campo: string; mostrar_unidade?: boolean }, valor: string) => {
    const u = item.mostrar_unidade ? unidade(tabela, item.campo) : undefined;
    if (!u) return valor;
    return u === '%' ? `${valor}%` : `${valor} ${u}`;
  };
  const tabela = (nome: string) => {
    const t = dados.tabelas[nome];
    if (!t) throw new Error(`tabela "${nome}" não existe no data.json`);
    return t;
  };
  /** Fatia da tabela só com os campos usados pelo bloco, com os formatos de exibição aplicados. */
  const fatia = (nome: string, campos: string[], formatos: Record<string, Formato | undefined> = {}): Linha[] =>
    tabela(nome).linhas.map((l) =>
      Object.fromEntries(campos.map((c) => [c, formatos[c] && formatos[c] !== 'texto' ? formatar(l[c], formatos[c]) : l[c]]))
    );

  let rankings = 0;

  const bloco = (b: Bloco, sg: SecaoGuideline, chave: string): ReactNode => {
    const analiseG = 'analise' in b ? sg.analises?.find((a) => a.id === b.analise) : undefined;
    switch (b.tipo) {
      case 'mensagem_chave':
        return (
          <KeyMessage key={chave} value={formatar(valorUnico(dados, b.tabela, b.valor.campo, chave), b.valor.formato)} centralizar={b.centralizar}>
            {leitura(b.leitura)}
          </KeyMessage>
        );

      case 'indicadores': {
        const indicadores = analiseG?.indicadores ?? [];
        const detalheDe = (campo: string) => {
          const id = indicadores.find((x) => x.campo === campo)?.detalhe;
          return id ? leitura(id) : '';
        };
        // Com selecao, os cartões mostram a linha escolhida na página (ADR-007).
        if (b.selecao)
          return (
            <IndicadoresSelecao
              key={chave}
              selecao={b.selecao}
              itens={b.itens.map((it, i) => ({ label: rotulo(it.campo), accent: ACCENT_SEQUENCE[i % ACCENT_SEQUENCE.length], detalhe: detalheDe(it.campo) }))}
              valores={valoresIndicadores({ ...b, selecao: b.selecao }, dados)}
            />
          );
        return (
          <MetricCards
            key={chave}
            items={b.itens.map((it, i) => {
              const v = formatar(valorUnico(dados, b.tabela, it.campo, chave), it.formato);
              const complemento = it.complemento && exibir(tabela(b.tabela), it.complemento, valorUnico(dados, b.tabela, it.complemento.campo, chave));
              return {
                label: rotulo(it.campo),
                value: comUnidade(b.tabela, it, v),
                detail: complemento ? (
                  <>
                    {complemento} {detalheDe(it.campo)}
                  </>
                ) : (
                  detalheDe(it.campo)
                ),
                accent: ACCENT_SEQUENCE[i % ACCENT_SEQUENCE.length],
              };
            })}
          />
        );
      }

      case 'distribuicoes':
        return <Distribuicoes key={chave} selecao={b.selecao} cartoes={dadosDistribuicoes(b, dados, rotulo)} />;

      case 'tabela':
        return <TabelaDados key={chave} titulo={analiseG?.titulo} descricao={analiseG?.descricao} selecao={b.selecao} {...dadosTabela(b, dados, rotulo)} />;

      case 'ficha':
        return (
          <Ficha
            key={chave}
            selecao={b.selecao}
            secao={b.cabecalho ? { sobretitulo: sg.sobretitulo, titulo: sg.titulo, intro: sg.intro } : undefined}
            {...dadosFicha(b, dados, rotulo)}
          />
        );

      case 'ranking': {
        const cor = ACCENT_SEQUENCE[rankings++ % ACCENT_SEQUENCE.length];
        const campos = [b.rotulo.campo, b.valor, ...(b.extra ? [b.extra] : [])];
        const uValor = unidade(b.tabela, b.valor);
        const hover =
          `<b>%{y}</b><br>${rotulo(b.valor)}: ${valorHover('x', uValor)}` +
          (b.extra ? `<br>${rotulo(b.extra)}: ${valorHover('customdata', unidade(b.tabela, b.extra))}` : '') +
          '<extra></extra>';
        return (
          <ChartCard key={chave} title={analiseG?.titulo} description={analiseG?.descricao}>
            <RankingChart
              rows={fatia(b.tabela, campos, { [b.rotulo.campo]: b.rotulo.formato })}
              labelKey={b.rotulo.campo}
              valueKey={b.valor}
              extraKey={b.extra}
              color={cor}
              topN={b.top}
              xAxisTitle={tituloEixo(rotulo(b.valor), uValor)}
              hovertemplate={hover}
              className="h-[350px] md:h-[395px]"
            />
          </ChartCard>
        );
      }

      case 'serie_empilhada':
        return (
          <BlocoSerieEmpilhada
            key={chave}
            titulo={analiseG?.titulo}
            descricao={analiseG?.descricao}
            periodo={b.periodo}
            dimensoes={b.dimensoes.map((d) => ({
              campo: d.campo,
              rotulo: rotulo(d.campo),
              linhas: fatia(d.tabela, [b.periodo, d.campo, ...b.metricas], { [d.campo]: d.formato }),
            }))}
            metricas={b.metricas.map((m) => ({
              campo: m,
              rotulo: rotulo(m),
              eixo: tituloEixo(rotulo(m), unidade(b.dimensoes[0].tabela, m)),
            }))}
            top={b.top}
          />
        );

      case 'fluxo': {
        const formatos = Object.fromEntries(b.camadas.map((c) => [c.campo, c.formato]));
        const campos = [...b.camadas.map((c) => c.campo), ...b.metricas, ...(b.filtro ? [b.filtro.campo] : [])];
        return (
          <BlocoFluxo
            key={chave}
            titulo={analiseG?.titulo}
            descricao={analiseG?.descricao}
            camadas={b.camadas.map((c) => c.campo)}
            metricas={b.metricas.map((m) => ({ campo: m, rotulo: rotulo(m) }))}
            filtro={
              b.filtro && {
                campo: b.filtro.campo,
                opcoes: b.filtro.opcoes.map((o) => ({ valor: String(o), rotulo: o === 'todos' ? ROTULO_TODOS : String(o) })),
              }
            }
            linhas={fatia(b.tabela, [...new Set(campos)], formatos)}
            top={b.top}
          />
        );
      }

      case 'destaque': {
        const titulo = sg.conclusoes?.find((c) => c.id === b.conclusao)?.titulo ?? '';
        const item = busca(metodologia.conclusoes, b.conclusao, 'conclusão');
        // No destaque, nomes vindos dos dados (formato texto) saem em negrito; números, não.
        return (
          <Callout key={chave} title={titulo && !/[.!?:]$/.test(titulo) ? `${titulo}.` : titulo}>
            {rico(item, (p) => Boolean(p.marcador) && p.formato === 'texto')}
          </Callout>
        );
      }

      case 'nota':
        return (
          <MethodNote
            key={chave}
            eyebrow={sg.sobretitulo ?? ''}
            title={sg.titulo ?? ''}
            caveats={(b.ressalvas ?? []).map(ressalva)}
            marcadores={b.marcadores}
          >
            {b.leitura ? leitura(b.leitura) : null}
          </MethodNote>
        );

      case 'grupo':
        return (
          <div key={chave} className={`grid gap-6 ${b.colunas === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
            {b.blocos.map((x, i) => bloco(x, sg, `${chave}.${i}`))}
          </div>
        );

      case 'mapa_roscas':
        return (
          <MapaRoscas
            key={chave}
            titulo={analiseG?.titulo}
            descricao={analiseG?.descricao}
            selecao={b.selecao}
            {...dadosRoscas(b, dados, rotulo, guideline.rotulos ?? {})}
          />
        );

      case 'mapa_trechos':
        return <MapaTrechos key={chave} selecao={b.selecao} {...dadosTrechos(b, dados, rotulo, guideline.rotulos ?? {})} />;

      case 'proprio': {
        const Proprio = proprios[b.nome];
        if (!Proprio) throw new Error(`componente próprio "${b.nome}" não está no registro local do estudo`);
        const tabelas: Record<string, Tabela> = Object.fromEntries((b.tabelas ?? []).map((n) => [n, tabela(n)]));
        return (
          <Proprio
            key={chave}
            linhas={b.tabela ? tabela(b.tabela).linhas : undefined}
            tabelas={tabelas}
            textos={{
              leituras: pronto(metodologia.leituras, b.leituras, 'leitura'),
              conclusoes: pronto(metodologia.conclusoes, b.conclusoes, 'conclusão'),
              ressalvas: pronto(metodologia.ressalvas, b.ressalvas, 'ressalva'),
            }}
            rotulos={guideline.rotulos ?? {}}
            analise={analiseG && { titulo: analiseG.titulo, descricao: analiseG.descricao }}
            secao={b.cabecalho ? { sobretitulo: sg.sobretitulo, titulo: sg.titulo, intro: sg.intro } : undefined}
            {...b.props}
          />
        );
      }
    }
  };

  const { metadata } = dados;
  const fontes = metadata.fontes.map((f) => f.nome).join(', ');
  const meta = [
    { label: 'Base analisada', value: fontes },
    ...(metadata.periodo
      ? [{ label: 'Período', value: metadata.periodo.inicio === metadata.periodo.fim ? metadata.periodo.inicio : `${metadata.periodo.inicio} a ${metadata.periodo.fim}` }]
      : []),
    ...(guideline.meta ?? []).map((m) => ({ label: m.rotulo, value: leitura(m.leitura) })),
  ];

  const conteudo = (
    <>
      <Hero eyebrow={guideline.sobretitulo ?? ''} title={guideline.titulo} subtitle={guideline.subtitulo} meta={meta} />
      {composicao.secoes.map((s) => {
        const sg = guideline.secoes.find((x) => x.id === s.id);
        if (!sg) throw new Error(`seção "${s.id}" não existe no guideline`);
        const blocos = s.blocos.map((b, i) => bloco(b, sg, `${s.id}.${i}`));
        // A nota e os blocos com cabecalho (componente próprio, ficha) desenham o cabeçalho da seção; seção sem título não ganha moldura.
        const unico = s.blocos.length === 1 ? s.blocos[0] : undefined;
        if (unico?.tipo === 'nota' || ((unico?.tipo === 'proprio' || unico?.tipo === 'ficha') && unico.cabecalho)) return blocos[0];
        if (!sg.titulo) return <div key={s.id}>{blocos}</div>;
        return (
          <ReportSection key={s.id} eyebrow={sg.sobretitulo ?? ''} title={sg.titulo} intro={sg.intro ?? ''}>
            {blocos}
          </ReportSection>
        );
      })}
    </>
  );

  return (
    <>
      {/* A seleção do kit (ADR-007) e o provedor do estudo, se houver, envolvem a página para os blocos compartilharem estado. */}
      <main>
        <SelecaoProvider>{Provedor ? <Provedor>{conteudo}</Provedor> : conteudo}</SelecaoProvider>
      </main>
      {/* O rodapé traz a fonte e a data do snapshot deste estudo (metadata do data.json). */}
      <Footer fonte={fontes} elaboracao={dataCurta(metadata.data_referencia)} />
    </>
  );
}
