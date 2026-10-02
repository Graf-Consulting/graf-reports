/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import { RankingChart, SankeyChart, StackedAreaChart } from '@/components/charts';
import {
  Callout,
  ChartCard,
  Emphasis,
  Hero,
  KeyMessage,
  MethodNote,
  MetricCards,
  ReportSection,
  SelectControl,
  ToggleButton,
  type Metric as MetricCard,
} from '@/components/report';
import { compact, fob } from '@/lib/report/format';
import { COLORS } from '@/lib/report/tokens';
import { DATA } from './data';

/** Remove o código numérico do início do nome da unidade da RFB. */
const cleanRfb = (v: string) => String(v || 'Não informado').replace(/^\s*\d+\s*-\s*/, '');

type Kind = 'product' | 'state' | 'rfb';
type Metric = 'vl_fob' | 'kg_liquido';

const SERIES: Record<Kind, { label: string; rows: any[]; key: string; format?: (v: string) => string }> = {
  product: { label: 'Mercadoria', rows: DATA.monthly_product, key: 'nome_simplificado_antaq' },
  state: { label: 'Estado de origem', rows: DATA.monthly_state, key: 'uf_origem_carga' },
  rfb: { label: 'Unidade da RFB', rows: DATA.monthly_rfb, key: 'unidade_rfb', format: cleanRfb },
};

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: 'vl_fob', label: 'Valor FOB' },
  { value: 'kg_liquido', label: 'Peso líquido' },
];

const RANKING_HOVER = '<b>%{y}</b><br>Valor FOB: US$ %{x:,.0f}<br>Peso líquido: %{customdata:,.0f} kg<extra></extra>';

/** Linhas do Sankey com os nomes das camadas já limpos. */
const SANKEY_ROWS = (DATA.sankey as any[]).map((r) => ({
  ...r,
  uf_origem_carga: r.uf_origem_carga || 'Não informado',
  unidade_rfb: cleanRfb(r.unidade_rfb),
  pais_destino: r.pais_destino || 'Não informado',
}));
const SANKEY_LAYERS = ['uf_origem_carga', 'unidade_rfb', 'pais_destino'];

export default function Report() {
  const [kind, setKind] = useState<Kind>('product');
  const [metric, setMetric] = useState<Metric>('vl_fob');
  const [sMetric, setSMetric] = useState<Metric>('kg_liquido');
  const [year, setYear] = useState<string>('all');

  const s = DATA.summary as any;
  const series = SERIES[kind];
  const sankeyRows = useMemo(
    () => (year === 'all' ? SANKEY_ROWS : SANKEY_ROWS.filter((r) => String(r.ano) === year)),
    [year]
  );

  const metrics: MetricCard[] = [
    { label: 'Valor FOB · 2026', value: fob(s.fob_2026), detail: 'Produtos incluídos no recorte', accent: COLORS.primary },
    { label: 'Peso líquido · 2026', value: `${compact(s.kg_2026)} kg`, detail: 'Volume potencialmente exposto', accent: COLORS.accent },
    { label: 'Principal destino', value: s.top_country, detail: `${fob(s.top_country_fob)} em valor FOB`, accent: COLORS.orange },
    { label: 'Principal origem', value: s.top_state, detail: `${fob(s.top_state_fob)} em valor FOB`, accent: COLORS.secondary },
  ];

  return (
    <>
      <Hero
        eyebrow="Análise de comércio exterior · União Europeia"
        title="Impacto da suspensão das importações de carnes e produtos de origem animal do Brasil pela União Europeia"
        subtitle="Um retrato dos fluxos comerciais potencialmente expostos às restrições, conectando a origem da carga, os corredores de saída e os mercados consumidores europeus."
        meta={[
          { label: 'Base analisada', value: 'Comex Stat' },
          { label: 'Período', value: `${s.period_min} a ${s.period_max}` },
          { label: 'Recorte principal', value: '2026' },
        ]}
      />

      <KeyMessage value={fob(s.fob_2026)}>
        O valor FOB observado em 2026 para os produtos considerados no recorte representa a exposição comercial
        potencial aos efeitos da restrição. A leitura deve orientar priorização de mercados, corredores logísticos e
        estratégias de redirecionamento da carga.
      </KeyMessage>

      <ReportSection
        eyebrow="Visão executiva"
        title="Onde se concentra a exposição"
        intro="Indicadores consolidados para 2026. O objetivo é destacar os pontos de maior dependência na cadeia exportadora antes de detalhar destinos, origens e unidades de despacho."
      >
        <MetricCards items={metrics} />
      </ReportSection>

      <ReportSection
        eyebrow="Mercados e origens"
        title="Países consumidores e estados de origem"
        intro="Rankings por valor FOB em 2026, úteis para identificar os principais mercados expostos e a concentração territorial da produção exportada."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Países de destino" description="Principais consumidores europeus por valor FOB.">
            <RankingChart
              rows={DATA.countries26}
              labelKey="pais_destino"
              valueKey="vl_fob"
              extraKey="kg_liquido"
              color={COLORS.primary}
              xAxisTitle="Valor FOB (US$)"
              hovertemplate={RANKING_HOVER}
              className="h-[350px] md:h-[395px]"
            />
          </ChartCard>
          <ChartCard title="Estados de origem" description="Unidades federativas com maior valor exportado.">
            <RankingChart
              rows={DATA.states26}
              labelKey="uf_origem_carga"
              valueKey="vl_fob"
              extraKey="kg_liquido"
              color={COLORS.accent}
              xAxisTitle="Valor FOB (US$)"
              hovertemplate={RANKING_HOVER}
              className="h-[350px] md:h-[395px]"
            />
          </ChartCard>
        </div>
        <Callout title="Leitura prioritária.">
          Em 2026, <Emphasis>{s.top_country}</Emphasis> é o principal mercado no recorte, com {fob(s.top_country_fob)}.
          Entre as origens, <Emphasis>{s.top_state}</Emphasis> concentra o maior valor FOB, com{' '}
          {fob(s.top_state_fob)}. Esses dois pontos devem ser priorizados em cenários de mitigação de impacto.
        </Callout>
      </ReportSection>

      <ReportSection
        eyebrow="Evolução dos fluxos"
        title="Mercadorias, origens e unidades da RFB"
        intro="A evolução mensal mostra a composição dos fluxos em todo o período disponível. Use os controles para alterar a dimensão de análise e o indicador apresentado."
      >
        <ChartCard
          controls={
            <>
              {(Object.keys(SERIES) as Kind[]).map((k) => (
                <ToggleButton key={k} active={kind === k} onClick={() => setKind(k)}>
                  {SERIES[k].label}
                </ToggleButton>
              ))}
              <SelectControl value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
            </>
          }
        >
          <StackedAreaChart
            rows={series.rows}
            periodKey="periodo"
            seriesKey={series.key}
            valueKey={metric}
            formatLabel={series.format}
            yAxisTitle={metric === 'vl_fob' ? 'Valor FOB (US$)' : 'Peso líquido (kg)'}
            className="h-[350px] md:h-[395px]"
          />
        </ChartCard>
      </ReportSection>

      <ReportSection
        eyebrow="Rede logística"
        title="Da origem ao mercado europeu"
        intro="Fluxos agregados em três camadas: estado de origem, unidade da Receita Federal do Brasil e país de destino. A largura das conexões representa o indicador selecionado."
      >
        <ChartCard
          controls={
            <>
              <ToggleButton active={sMetric === 'kg_liquido'} onClick={() => setSMetric('kg_liquido')}>
                Peso líquido
              </ToggleButton>
              <ToggleButton active={sMetric === 'vl_fob'} onClick={() => setSMetric('vl_fob')}>
                Valor FOB
              </ToggleButton>
              <SelectControl
                value={year}
                onChange={setYear}
                options={[
                  { value: 'all', label: 'Todo o período' },
                  { value: '2026', label: '2026' },
                ]}
              />
            </>
          }
        >
          <SankeyChart rows={sankeyRows} layers={SANKEY_LAYERS} valueKey={sMetric} className="h-[540px] md:h-[610px]" />
        </ChartCard>
      </ReportSection>

      <MethodNote
        eyebrow="Como interpretar"
        title="Exposição não é previsão de perda"
        caveats={[
          'Podem existir exceções sanitárias, contratos vigentes, cargas em trânsito e estoques.',
          'Os fluxos podem ser redirecionados para outros mercados.',
          'A classificação por NCM é uma aproximação analítica do escopo regulatório.',
        ]}
      >
        Os resultados representam exportações históricas incluídas no recorte de mercadorias potencialmente afetadas.
        Eles não estimam, por si só, a perda econômica efetiva decorrente das restrições.
      </MethodNote>
    </>
  );
}
