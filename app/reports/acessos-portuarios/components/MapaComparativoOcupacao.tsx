/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SelectControl } from '@/components/report';
import { BASE_LAYOUT, loadPlotly } from '@/components/charts/plotly';
import { compact } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';
import { COLORS } from '@/lib/report/tokens';
import { CORES_FAIXA, corDaFaixa, fmt, porOrdem, porPorto, type Linha } from './faixas';
import { useSelecao } from './Selecao';

/** Recorte do mapa (graus) e tamanho do desenho; o contêiner é quadrado, então longitude e latitude têm a mesma escala. */
const LON0 = -74, LAT1 = 6, VAO = 40, TAM = 400;
const px = (graus: number) => graus * (TAM / VAO);
const R_MAX = 20, R_MIN = 3;
const TODAS = '';

/** Fatia de rosca entre dois ângulos (radianos, a partir do topo). */
function fatia(cx: number, cy: number, r: number, a0: number, a1: number) {
  const ri = r * 0.55;
  const p = (rr: number, a: number) => `${cx + rr * Math.sin(a)} ${cy - rr * Math.cos(a)}`;
  const g = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r, a0)} A${r} ${r} 0 ${g} 1 ${p(r, a1)} L${p(ri, a1)} A${ri} ${ri} 0 ${g} 0 ${p(ri, a0)}Z`;
}

/** Base do mapa do Brasil, desenhada pelo Plotly com projeção fixa para as roscas em SVG caírem no lugar certo. */
function BaseMapa() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelado = false;
    loadPlotly().then((Plotly: any) => {
      if (cancelado || !ref.current) return;
      Plotly.react(
        ref.current,
        [{ type: 'scattergeo', lat: [null], lon: [null], hoverinfo: 'skip' }],
        {
          ...BASE_LAYOUT,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          geo: {
            projection: { type: 'equirectangular' },
            lonaxis: { range: [LON0, LON0 + VAO] },
            lataxis: { range: [LAT1 - VAO, LAT1] },
            domain: { x: [0, 1], y: [0, 1] },
            showland: true,
            landcolor: COLORS.surface,
            showcountries: true,
            countrycolor: COLORS.border,
            showcoastlines: true,
            coastlinecolor: COLORS.border,
            showframe: false,
            bgcolor: COLORS.white,
          },
        },
        { staticPlot: true, responsive: true }
      );
    });
    return () => {
      cancelado = true;
    };
  }, []);
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}

export function MapaComparativoOcupacao({ tabelas, rotulos }: PropsProprio) {
  const { selecionar } = useSelecao();
  const [regiao, setRegiao] = useState(TODAS);
  const [uf, setUf] = useState(TODAS);
  const [aberta, setAberta] = useState('');
  const [sobre, setSobre] = useState('');

  const instalacoes = tabelas.instalacoes.linhas;
  const faixas = useMemo(() => porPorto(tabelas.instalacao_faixa.linhas), [tabelas]);
  const regioes = useMemo(() => [...new Set(instalacoes.map((i) => String(i.regiao)))].sort(), [instalacoes]);
  const ufs = useMemo(
    () => [...new Set(instalacoes.filter((i) => !regiao || i.regiao === regiao).map((i) => String(i.uf)))].sort(),
    [instalacoes, regiao]
  );
  const rMax = useMemo(() => Math.max(...instalacoes.map((i) => Math.sqrt(Number(i.extensao_calculada_km) || 0))), [instalacoes]);

  const visiveis = useMemo(
    () =>
      instalacoes
        .filter((i) => (!regiao || i.regiao === regiao) && (!uf || i.uf === uf))
        .sort((a, b) => Number(b.extensao_80_km) - Number(a.extensao_80_km) || Number(b.extensao_calculada_km) - Number(a.extensao_calculada_km)),
    [instalacoes, regiao, uf]
  );
  const nome = (i: Linha) => `${i.rotulo} (${i.uf})`;
  const abrir = (id: string) => {
    selecionar(id);
    document.getElementById('mapa-acessos-portuarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const detalhe = visiveis.find((i) => String(i.id_porto) === aberta);
  const dentro = (i: Linha) => Array.isArray(i.ponto);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[13px] text-graf-secondary">
        <label className="flex items-center gap-2 font-medium">
          {rotulos.regiao}
          <SelectControl
            value={regiao}
            onChange={(v) => {
              setRegiao(v);
              setUf(TODAS);
              setAberta('');
            }}
            options={[{ value: TODAS, label: 'Todas' }, ...regioes.map((r) => ({ value: r, label: r }))]}
          />
        </label>
        <label className="flex items-center gap-2 font-medium">
          {rotulos.uf}
          <SelectControl
            value={uf}
            onChange={(v) => {
              setUf(v);
              setAberta('');
            }}
            options={[{ value: TODAS, label: 'Todos' }, ...ufs.map((u) => ({ value: u, label: u }))]}
          />
        </label>
        <span aria-live="polite">
          {visiveis.length} {String(rotulos.instalacoes).toLowerCase()}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="relative mx-auto aspect-square w-full max-w-[640px] border border-graf-grid bg-white">
          <BaseMapa />
          <svg viewBox={`0 0 ${TAM} ${TAM}`} className="absolute inset-0 h-full w-full" role="group" aria-label={rotulos.faixa}>
            {[...visiveis].filter(dentro).sort((a, b) => Number(b.extensao_calculada_km) - Number(a.extensao_calculada_km)).map((i) => {
              const id = String(i.id_porto);
              const [lat, lon] = i.ponto as [number, number];
              const cx = px(lon - LON0), cy = px(LAT1 - lat);
              const r = Math.max(R_MIN, (Math.sqrt(Number(i.extensao_calculada_km) || 0) / (rMax || 1)) * R_MAX);
              const fs = [...(faixas.get(id) ?? [])].sort(porOrdem);
              const total = fs.reduce((s, f) => s + Number(f.extensao_km), 0) || 1;
              let acum = 0;
              return (
                <g
                  key={id}
                  tabIndex={0}
                  role="button"
                  aria-label={nome(i)}
                  className="cursor-pointer outline-none focus-visible:opacity-80"
                  onMouseEnter={() => setSobre(id)}
                  onMouseLeave={() => setSobre('')}
                  onFocus={() => setSobre(id)}
                  onBlur={() => setSobre('')}
                  onClick={() => setAberta(id)}
                  onKeyDown={(e) => e.key === 'Enter' && setAberta(id)}
                >
                  <circle cx={cx} cy={cy} r={r + 1.5} fill={COLORS.white} opacity={0.85} />
                  {fs.map((f) => {
                    const a0 = (acum / total) * 2 * Math.PI;
                    acum += Number(f.extensao_km);
                    const a1 = Math.min((acum / total) * 2 * Math.PI, 2 * Math.PI - 0.0001);
                    return <path key={String(f.faixa)} d={fatia(cx, cy, r, a0, a1)} fill={corDaFaixa(Number(f.ordem))} />;
                  })}
                  {id === aberta && <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={COLORS.deep} strokeWidth={1.5} />}
                </g>
              );
            })}
          </svg>
          {sobre && (
            <div className="pointer-events-none absolute top-2 left-2 bg-graf-deep px-2.5 py-1.5 text-[12px] text-white">
              {nome(instalacoes.find((i) => String(i.id_porto) === sobre) ?? {})}
            </div>
          )}
          {detalhe && (
            <div className="absolute right-2 bottom-2 left-2 border border-graf-grid bg-white p-3 text-[12px] text-graf-secondary shadow-[0_13px_34px_var(--graf-shadow)] sm:left-auto sm:w-[280px]">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-graf-deep">{nome(detalhe)}</strong>
                <button onClick={() => setAberta('')} aria-label="Fechar" className="text-graf-deep">
                  ×
                </button>
              </div>
              <ul className="my-2 grid list-none gap-1 p-0">
                {[...(faixas.get(String(detalhe.id_porto)) ?? [])].sort(porOrdem).map((f) => (
                  <li key={String(f.faixa)} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <i className="inline-block h-2.5 w-2.5" style={{ background: corDaFaixa(Number(f.ordem)) }} />
                      {String(f.faixa)}
                    </span>
                    <span>
                      {fmt(f.extensao_km, 1)} km · {fmt(f.participacao_pct)}%
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => abrir(String(detalhe.id_porto))}
                className="border border-graf-deep px-2.5 py-1.5 font-semibold text-graf-deep hover:bg-graf-surface"
              >
                Ver no mapa interativo
              </button>
            </div>
          )}
        </div>

        <ol className="m-0 max-h-[640px] list-none overflow-y-auto border border-graf-grid bg-white p-0">
          {visiveis.map((i) => {
            const id = String(i.id_porto);
            const fs = [...(faixas.get(id) ?? [])].sort(porOrdem);
            const total = fs.reduce((s, f) => s + Number(f.extensao_km), 0) || 1;
            return (
              <li key={id} className="border-b border-graf-grid last:border-b-0">
                <button onClick={() => abrir(id)} className="block w-full px-3 py-2 text-left hover:bg-graf-surface">
                  <span className="flex justify-between gap-2 text-[12px] text-graf-secondary">
                    <span className="font-medium text-graf-deep">{nome(i)}</span>
                    <span>{compact(Number(i.extensao_calculada_km))} km</span>
                  </span>
                  <span className="mt-1 flex h-2.5 w-full overflow-hidden bg-graf-grid" aria-hidden="true">
                    {fs.map((f) => (
                      <span key={String(f.faixa)} style={{ width: `${(Number(f.extensao_km) / total) * 100}%`, background: corDaFaixa(Number(f.ordem)) }} />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <ul className="mt-4 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[12px] text-graf-secondary" aria-label={rotulos.faixa}>
        {[...tabelas.instalacao_faixa.linhas]
          .filter((f, k, todas) => todas.findIndex((x) => x.ordem === f.ordem) === k)
          .sort(porOrdem)
          .map((f) => (
            <li key={String(f.faixa)} className="flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5" style={{ background: CORES_FAIXA[Number(f.ordem) - 1] }} />
              {String(f.faixa)}
            </li>
          ))}
      </ul>
    </div>
  );
}
