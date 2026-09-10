/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import { DATA } from './data'

const COLORS = {
  primary: '#6EC1E4',
  secondary: '#54595F',
  text: '#7A7A7A',
  accent: '#61CE70',
  white: '#FFFFFF',
  orange: '#F5A855',
  deep: '#001E1D',
  dark: '#0D0E0E',
  grid: '#e3e8e8',
};

const AREA_PALETTE = [
  '#1B998B', '#FFD166', '#2D6A4F', '#FF9F1C', '#0077B6', '#E63946',
  '#52B788', '#D62828', '#023E8A', '#48CAE4', '#9D4EDD', '#F77F00',
];

const PLOT_CONFIG = { displayModeBar: false, responsive: true };

const BASE_LAYOUT: any = {
  paper_bgcolor: COLORS.white,
  plot_bgcolor: COLORS.white,
  font: { family: 'Montserrat, sans-serif', color: COLORS.secondary },
  margin: { l: 54, r: 20, t: 18, b: 60 },
  hoverlabel: { bgcolor: COLORS.deep, font: { color: COLORS.white } },
  xaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, linecolor: COLORS.grid },
  yaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, linecolor: COLORS.grid },
};

function compact(v: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v || 0);
}
const fob = (v: number) => `US$ ${compact(v)}`;
const cleanRfb = (v: string) => String(v || 'Não informado').replace(/^\s*\d+\s*-\s*/, '');

type Kind = 'product' | 'state' | 'rfb';
type Metric = 'vl_fob' | 'kg_liquido';

/** Carrega o Plotly via CDN (igual ao HTML original) */
function loadPlotly(): Promise<any> {
  return new Promise((resolve) => {
    const w = window as any;
    if (w.Plotly) return resolve(w.Plotly);
    const existing = document.querySelector('script[data-plotly]');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).Plotly));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
    s.dataset.plotly = 'true';
    s.onload = () => resolve((window as any).Plotly);
    document.head.appendChild(s);
  });
}

function renderRanking(Plotly: any, el: HTMLElement, rows: any[], dim: string, color: string) {
  const top = rows.slice().sort((a, b) => b.vl_fob - a.vl_fob).slice(0, 10).reverse();
  Plotly.react(
    el,
    [
      {
        type: 'bar',
        orientation: 'h',
        x: top.map((r) => r.vl_fob),
        y: top.map((r) => r[dim]),
        customdata: top.map((r) => r.kg_liquido),
        marker: { color },
        hovertemplate: '<b>%{y}</b><br>Valor FOB: US$ %{x:,.0f}<br>Peso líquido: %{customdata:,.0f} kg<extra></extra>',
      },
    ],
    {
      ...BASE_LAYOUT,
      margin: { l: 150, r: 14, t: 8, b: 52 },
      xaxis: { ...BASE_LAYOUT.xaxis, title: 'Valor FOB (US$)', tickformat: '~s' },
      yaxis: { ...BASE_LAYOUT.yaxis, automargin: true },
    },
    PLOT_CONFIG
  );
}

function renderSeries(Plotly: any, el: HTMLElement, kind: Kind, metric: Metric) {
  const source: any[] = kind === 'product' ? DATA.monthly_product : kind === 'state' ? DATA.monthly_state : DATA.monthly_rfb;
  const dim = kind === 'product' ? 'nome_simplificado_antaq' : kind === 'state' ? 'uf_origem_carga' : 'unidade_rfb';
  const totals: Record<string, number> = {};
  source.forEach((r) => (totals[r[dim]] = (totals[r[dim]] || 0) + r[metric]));
  const selected = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((x) => x[0]);
  const months = [...new Set(source.map((r: any) => r.periodo))].sort();
  const traces = selected.map((item, i) => {
    const label = kind === 'rfb' ? cleanRfb(item) : item;
    return {
      type: 'scatter',
      mode: 'lines',
      x: months,
      y: months.map((m) => {
        const r = source.find((c) => c.periodo === m && c[dim] === item);
        return r ? r[metric] : 0;
      }),
      name: label,
      stackgroup: 'one',
      fillcolor: AREA_PALETTE[i % AREA_PALETTE.length],
      line: { color: AREA_PALETTE[i % AREA_PALETTE.length], width: 1.2 },
      opacity: 0.92,
      hovertemplate: `<b>${label}</b><br>%{x}<br>%{y:,.2f}<extra></extra>`,
    };
  });
  Plotly.react(
    el,
    traces,
    {
      ...BASE_LAYOUT,
      hovermode: 'x unified',
      margin: { l: 64, r: 20, t: 14, b: 105 },
      xaxis: { ...BASE_LAYOUT.xaxis, title: 'Mês' },
      yaxis: { ...BASE_LAYOUT.yaxis, title: metric === 'vl_fob' ? 'Valor FOB (US$)' : 'Peso líquido (kg)', tickformat: '~s' },
      legend: { orientation: 'h', y: -0.28, x: 0, font: { size: 11 } },
    },
    PLOT_CONFIG
  );
}

function renderSankey(Plotly: any, el: HTMLElement, metric: Metric, year: string) {
  const sums: Record<string, number> = {};
  (DATA.sankey as any[]).forEach((r) => {
    if (year !== 'all' && String(r.ano) !== year) return;
    const path = [r.uf_origem_carga || 'Não informado', cleanRfb(r.unidade_rfb), r.pais_destino || 'Não informado'].join('|');
    sums[path] = (sums[path] || 0) + r[metric];
  });
  const flows = Object.entries(sums)
    .map(([path, value]) => ({ parts: path.split('|'), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
  const states = [...new Set(flows.map((f) => f.parts[0]))];
  const rfbs = [...new Set(flows.map((f) => f.parts[1]))];
  const countries = [...new Set(flows.map((f) => f.parts[2]))];
  const nodes = [...states, ...rfbs, ...countries];
  const index = new Map(nodes.map((n, i) => [n, i]));
  const sc = ['#d9edf6', '#c9e7d0', '#f8dfc5', '#e2d6eb', '#d8e5e4', '#f1d7d3'];
  const rc = ['#001E1D', '#17606A', '#3A7B80', '#456A7A', '#54595F', '#346B77'];
  const cc = ['#F5A855', '#dc8c4f', '#d66d52', '#e4a441', '#c75f50', '#d98355'];
  const nodeColors = nodes.map((_, i) =>
    i < states.length ? sc[i % sc.length] : i < states.length + rfbs.length ? rc[(i - states.length) % rc.length] : cc[(i - states.length - rfbs.length) % cc.length]
  );
  const links: any = { source: [], target: [], value: [], label: [], color: [] };
  flows.forEach((f) => {
    for (let i = 0; i < 2; i++) {
      links.source.push(index.get(f.parts[i]));
      links.target.push(index.get(f.parts[i + 1]));
      links.value.push(f.value);
      links.label.push(`${f.parts[i]} → ${f.parts[i + 1]}`);
      links.color.push(i === 0 ? 'rgba(110,193,228,.38)' : 'rgba(245,168,85,.38)');
    }
  });
  Plotly.react(
    el,
    [
      {
        type: 'sankey',
        orientation: 'h',
        node: { pad: 13, thickness: 16, line: { color: 'rgba(0,30,29,.24)', width: 0.5 }, label: nodes, color: nodeColors },
        link: { source: links.source, target: links.target, value: links.value, color: links.color, customdata: links.label, hovertemplate: '<b>%{customdata}</b><br>%{value:,.2f}<extra></extra>' },
      },
    ],
    { ...BASE_LAYOUT, margin: { l: 10, r: 10, t: 12, b: 12 } },
    PLOT_CONFIG
  );
}

export default function Report() {
  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<HTMLDivElement>(null);
  const sankeyRef = useRef<HTMLDivElement>(null);

  const [kind, setKind] = useState<Kind>('product');
  const [metric, setMetric] = useState<Metric>('vl_fob');
  const [sMetric, setSMetric] = useState<Metric>('kg_liquido');
  const [year, setYear] = useState<string>('all');

  const s = DATA.summary as any;

  useEffect(() => {
    let cancelled = false;
    loadPlotly().then((Plotly) => {
      if (cancelled) return;
      if (countryRef.current) renderRanking(Plotly, countryRef.current, DATA.countries26 as any, 'pais_destino', COLORS.primary);
      if (stateRef.current) renderRanking(Plotly, stateRef.current, DATA.states26 as any, 'uf_origem_carga', COLORS.accent);
      if (seriesRef.current) renderSeries(Plotly, seriesRef.current, kind, metric);
      if (sankeyRef.current) renderSankey(Plotly, sankeyRef.current, sMetric, year);
    });
    return () => {
      cancelled = true;
    };
  }, [kind, metric, sMetric, year]);

  const metrics = [
    { label: 'Valor FOB · 2026', value: fob(s.fob_2026), detail: 'Produtos incluídos no recorte', color: 'border-[#6EC1E4]' },
    { label: 'Peso líquido · 2026', value: `${compact(s.kg_2026)} kg`, detail: 'Volume potencialmente exposto', color: 'border-[#61CE70]' },
    { label: 'Principal destino', value: s.top_country, detail: `${fob(s.top_country_fob)} em valor FOB`, color: 'border-[#F5A855]' },
    { label: 'Principal origem', value: s.top_state, detail: `${fob(s.top_state_fob)} em valor FOB`, color: 'border-[#54595F]' },
  ];

  const kindButtons: { kind: Kind; label: string }[] = [
    { kind: 'product', label: 'Mercadoria' },
    { kind: 'state', label: 'Estado de origem' },
    { kind: 'rfb', label: 'Unidade da RFB' },
  ];

  const btn = (active: boolean) =>
    `border border-[#cfd8d9] bg-white px-3 py-2 text-[13px] font-medium text-[#001E1D] ${
      active ? '!border-[#001E1D] bg-[#001E1D] text-white' : 'hover:border-[#001E1D]'
    }`;
  const selectCls =
    'border border-[#cfd8d9] bg-white px-3 py-2 text-[13px] font-medium text-[#001E1D]';

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#001E1D] text-white">
        <div
          aria-hidden="true"
          className="absolute -top-[150px] -right-[120px] h-[480px] w-[480px] rounded-full border-[72px] border-[#6EC1E4]/20"
        />
        <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] py-[52px] md:py-[72px] md:pb-16">
          <div className="mb-4 text-xs font-medium tracking-[0.14em] text-[#6EC1E4] uppercase">
            Análise de comércio exterior · União Europeia
          </div>
          <h1 className="max-w-[900px] text-[clamp(33px,5vw,58px)] leading-[1.04] font-semibold tracking-[-0.04em] text-white">
            Impacto da suspensão das importações de carnes e produtos de origem animal do Brasil pela
            União Europeia
          </h1>
          <p className="mt-6 max-w-[760px] text-base leading-relaxed text-[#d7e8e7] md:text-[19px]">
            Um retrato dos fluxos comerciais potencialmente expostos às restrições, conectando a origem da
            carga, os corredores de saída e os mercados consumidores europeus.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-x-[26px] gap-y-3 text-[13px] text-[#b8d1d0]">
            <span>
              <strong className="font-semibold text-white">Base analisada:</strong> Comex Stat
            </span>
            <span>
              <strong className="font-semibold text-white">Período:</strong> {s.period_min} a {s.period_max}
            </span>
            <span>
              <strong className="font-semibold text-white">Recorte principal:</strong> 2026
            </span>
          </div>
        </div>
      </section>

      {/* KEY MESSAGE */}
      <div className="relative z-20 mx-auto -mt-6 w-[min(1180px,calc(100%-48px))]">
        <div className="grid gap-4 border-l-[7px] border-[#F5A855] bg-white p-6 shadow-[0_13px_34px_rgba(0,30,29,0.12)] md:grid-cols-[80px_1fr] md:gap-[18px] md:px-7 md:py-6">
          <div className="text-[38px] leading-none font-semibold text-[#F5A855]">{fob(s.fob_2026)}</div>
          <p className="m-0 text-[#54595F]">
            O valor FOB observado em 2026 para os produtos considerados no recorte representa a exposição
            comercial potencial aos efeitos da restrição. A leitura deve orientar priorização de mercados,
            corredores logísticos e estratégias de redirecionamento da carga.
          </p>
        </div>
      </div>

      {/* MÉTRICAS */}
      <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
        <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#61CE70] uppercase">
          Visão executiva
        </div>
        <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.15] font-semibold tracking-[-0.03em] text-[#001E1D]">
          Onde se concentra a exposição
        </h2>
        <p className="mt-3 mb-7 max-w-[800px] text-[#7A7A7A]">
          Indicadores consolidados para 2026. O objetivo é destacar os pontos de maior dependência na cadeia
          exportadora antes de detalhar destinos, origens e unidades de despacho.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className={`min-h-[154px] border-t-4 bg-white p-[22px] ${m.color}`}>
              <div className="text-[11px] font-medium tracking-[0.08em] text-[#7A7A7A] uppercase">{m.label}</div>
              <div className="mt-3 mb-1.5 text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#001E1D]">
                {m.value}
              </div>
              <div className="text-[13px] text-[#54595F]">{m.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RANKINGS */}
      <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
        <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#61CE70] uppercase">
          Mercados e origens
        </div>
        <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.15] font-semibold tracking-[-0.03em] text-[#001E1D]">
          Países consumidores e estados de origem
        </h2>
        <p className="mt-3 mb-7 max-w-[800px] text-[#7A7A7A]">
          Rankings por valor FOB em 2026, úteis para identificar os principais mercados expostos e a
          concentração territorial da produção exportada.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="border border-[#e3e8e8] bg-white p-4 md:p-6">
            <h3 className="mb-1 text-[19px] font-semibold text-[#001E1D]">Países de destino</h3>
            <p className="mb-3 text-[13px] text-[#7A7A7A]">Principais consumidores europeus por valor FOB.</p>
            <div ref={countryRef} className="h-[350px] md:h-[395px]" />
          </article>
          <article className="border border-[#e3e8e8] bg-white p-4 md:p-6">
            <h3 className="mb-1 text-[19px] font-semibold text-[#001E1D]">Estados de origem</h3>
            <p className="mb-3 text-[13px] text-[#7A7A7A]">Unidades federativas com maior valor exportado.</p>
            <div ref={stateRef} className="h-[350px] md:h-[395px]" />
          </article>
        </div>
        <div className="mt-5 border-l-4 border-[#61CE70] bg-[#f2fbf3] p-5 text-[#54595F] md:p-6">
          <strong className="font-semibold text-[#001E1D]">Leitura prioritária.</strong> Em 2026,{' '}
          <strong className="font-semibold text-[#001E1D]">{s.top_country}</strong> é o principal mercado no
          recorte, com {fob(s.top_country_fob)}. Entre as origens,{' '}
          <strong className="font-semibold text-[#001E1D]">{s.top_state}</strong> concentra o maior valor
          FOB, com {fob(s.top_state_fob)}. Esses dois pontos devem ser priorizados em cenários de mitigação
          de impacto.
        </div>
      </section>

      {/* SÉRIES */}
      <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
        <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#61CE70] uppercase">
          Evolução dos fluxos
        </div>
        <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.15] font-semibold tracking-[-0.03em] text-[#001E1D]">
          Mercadorias, origens e unidades da RFB
        </h2>
        <p className="mt-3 mb-7 max-w-[800px] text-[#7A7A7A]">
          A evolução mensal mostra a composição dos fluxos em todo o período disponível. Use os controles
          para alterar a dimensão de análise e o indicador apresentado.
        </p>
        <article className="border border-[#e3e8e8] bg-white p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {kindButtons.map((b) => (
              <button key={b.kind} onClick={() => setKind(b.kind)} className={btn(kind === b.kind)}>
                {b.label}
              </button>
            ))}
            <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)} className={selectCls}>
              <option value="vl_fob">Valor FOB</option>
              <option value="kg_liquido">Peso líquido</option>
            </select>
          </div>
          <div ref={seriesRef} className="h-[350px] md:h-[395px]" />
        </article>
      </section>

      {/* SANKEY */}
      <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
        <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#61CE70] uppercase">
          Rede logística
        </div>
        <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.15] font-semibold tracking-[-0.03em] text-[#001E1D]">
          Da origem ao mercado europeu
        </h2>
        <p className="mt-3 mb-7 max-w-[800px] text-[#7A7A7A]">
          Fluxos agregados em três camadas: estado de origem, unidade da Receita Federal do Brasil e país de
          destino. A largura das conexões representa o indicador selecionado.
        </p>
        <article className="border border-[#e3e8e8] bg-white p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => setSMetric('kg_liquido')} className={btn(sMetric === 'kg_liquido')}>
              Peso líquido
            </button>
            <button onClick={() => setSMetric('vl_fob')} className={btn(sMetric === 'vl_fob')}>
              Valor FOB
            </button>
            <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
              <option value="all">Todo o período</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div ref={sankeyRef} className="h-[540px] md:h-[610px]" />
        </article>
      </section>

      {/* METODOLOGIA */}
      <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
        <div className="grid gap-7 bg-[#f3f6f6] p-[34px] md:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#61CE70] uppercase">
              Como interpretar
            </div>
            <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.15] font-semibold tracking-[-0.03em] text-[#001E1D]">
              Exposição não é previsão de perda
            </h2>
          </div>
          <div className="text-[#54595F]">
            <p className="m-0">
              Os resultados representam exportações históricas incluídas no recorte de mercadorias
              potencialmente afetadas. Eles não estimam, por si só, a perda econômica efetiva decorrente das
              restrições.
            </p>
            <ul className="mt-3 mb-0 pl-[19px]">
              <li>Podem existir exceções sanitárias, contratos vigentes, cargas em trânsito e estoques.</li>
              <li>Os fluxos podem ser redirecionados para outros mercados.</li>
              <li>A classificação por NCM é uma aproximação analítica do escopo regulatório.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
