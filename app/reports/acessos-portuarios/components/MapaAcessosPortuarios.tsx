/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SelectControl } from '@/components/report';
import { BASE_LAYOUT, loadPlotly } from '@/components/charts/plotly';
import { cleanLabel } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';
import { COLORS } from '@/lib/report/tokens';
import { CORES_FAIXA, fmt, texto, type Linha } from './faixas';
import { useSelecao } from './Selecao';

type Camada = 'selecionada' | 'ocupacao' | 'capacidade' | 'vmda';

const TITULOS: Record<Camada, string> = {
  selecionada: 'Instalação portuária selecionada',
  ocupacao: 'Ocupação VMDA / capacidade',
  capacidade: 'Capacidade diária',
  vmda: 'VMDA total',
};
const CLASSES = ['Abaixo de 50%', '50% a 60%', '60% a 70%', '70% a 80%', '80% a 90%', '90% a 100%', 'Acima de 100%'];
const ORDEM_INICIAL: Camada[] = ['selecionada', 'ocupacao', 'capacidade', 'vmda'];

/** Espessura (px) pelo volume de veículos/dia: sobe por faixas de 5.000 e, acima de 30.000, 1 px a cada 5.000. */
const espessura = (v: number) => (v <= 30000 ? 1 + 0.5 * Math.floor(v / 5000) : 4 + Math.floor((v - 30000) / 5000));
const idxFaixa = (nome: string) => Math.min(5, Math.floor(Number((nome.match(/\d+/) ?? ['0'])[0]) / 20));

type Linhas = [number, number][][];

/** Pontos de várias linhas em vetores de latitude e longitude, com null entre uma linha e outra. */
function achatar(linhas: Linhas, texto: string, indice: number) {
  const lat: (number | null)[] = [], lon: (number | null)[] = [], text: (string | null)[] = [], cd: (number | null)[] = [];
  for (const l of linhas) {
    for (const [a, o] of l) {
      lat.push(a);
      lon.push(o);
      text.push(texto);
      cd.push(indice);
    }
    lat.push(null);
    lon.push(null);
    text.push(null);
    cd.push(null);
  }
  return { lat, lon, text, cd };
}

export function MapaAcessosPortuarios({ tabelas, rotulos }: PropsProprio) {
  const { idPorto, selecionar } = useSelecao();
  const [ordem, setOrdem] = useState<Camada[]>(ORDEM_INICIAL);
  const [ligadas, setLigadas] = useState<Record<Camada, boolean>>({ selecionada: true, ocupacao: true, capacidade: true, vmda: true });
  // O link aberto vale só para a instalação portuária em que foi clicado.
  const [aberto, setAberto] = useState({ porto: '', indice: -1 });
  const [vista, setVista] = useState(0);
  const [anuncio, setAnuncio] = useState('');
  const [arrastando, setArrastando] = useState(-1);
  const el = useRef<HTMLDivElement>(null);

  const instalacoes = tabelas.instalacoes.linhas;
  const opcoes = useMemo(
    () =>
      [...instalacoes]
        .sort((a, b) => cleanLabel(String(a.instalacao)).localeCompare(cleanLabel(String(b.instalacao)), 'pt-BR'))
        .map((i) => ({ value: String(i.id_porto), label: cleanLabel(String(i.instalacao)) })),
    [instalacoes]
  );
  const instalacao = instalacoes.find((i) => String(i.id_porto) === idPorto);
  const trechos = useMemo<Linha[]>(() => (idPorto ? tabelas.trechos.linhas.filter((t) => String(t.id_porto) === idPorto) : []), [tabelas, idPorto]);
  const nomesFaixa = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of tabelas.trechos.linhas) if (t.faixa_ocupacao) m.set(idxFaixa(String(t.faixa_ocupacao)), String(t.faixa_ocupacao));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [tabelas]);

  useEffect(() => {
    let cancelado = false;
    loadPlotly().then((Plotly: any) => {
      const div = el.current;
      if (cancelado || !div) return;
      const tracos: any[] = [];
      // O Plotly desenha por último o que fica por cima; a lista da tela vai de cima para baixo.
      for (const c of [...ordem].reverse()) {
        if (!ligadas[c]) continue;
        if (c === 'selecionada') {
          const p = instalacao?.ponto as [number, number] | undefined;
          if (p) {
            tracos.push({
              type: 'scattergeo', mode: 'markers', lat: [p[0]], lon: [p[1]], hoverinfo: 'text',
              text: [cleanLabel(String(instalacao?.instalacao))],
              marker: { size: 13, color: COLORS.deep, line: { color: COLORS.white, width: 2 } },
            });
          }
          continue;
        }
        const grupos = new Map<string, { cor: string; largura: number; lat: any[]; lon: any[]; text: any[]; cd: any[] }>();
        trechos.forEach((t, i) => {
          const linhas = t.linhas as Linhas | null;
          if (!linhas) return;
          let cor: string, largura: number, valor: string;
          if (c === 'ocupacao') {
            if (t.ocupacao_pct === null || t.ocupacao_pct === undefined) return;
            cor = CORES_FAIXA[idxFaixa(String(t.faixa_ocupacao))];
            largura = 1.5 + Math.max(0, CLASSES.indexOf(String(t.classe_mapa)));
            valor = `${fmt(t.ocupacao_pct, 1)}%`;
          } else if (c === 'capacidade') {
            if (t.cap_dia_sentido === null || t.cap_dia_sentido === undefined) return;
            cor = COLORS.primary;
            largura = espessura(Number(t.cap_dia_sentido));
            valor = `${fmt(t.cap_dia_sentido)} veículos/dia`;
          } else {
            if (t.vmda_total === null || t.vmda_total === undefined) return;
            cor = COLORS.secondary;
            largura = espessura(Number(t.vmda_total));
            valor = `${fmt(t.vmda_total)} veículos/dia`;
          }
          const k = `${cor}|${largura}`;
          const g = grupos.get(k) ?? { cor, largura, lat: [], lon: [], text: [], cd: [] };
          const a = achatar(linhas, `${texto(t.codigo_br)} · ${TITULOS[c]}: ${valor}`, i);
          g.lat.push(...a.lat); g.lon.push(...a.lon); g.text.push(...a.text); g.cd.push(...a.cd);
          grupos.set(k, g);
        });
        for (const g of grupos.values())
          tracos.push({
            type: 'scattergeo', mode: 'lines', lat: g.lat, lon: g.lon, text: g.text, customdata: g.cd,
            hoverinfo: 'text', line: { color: g.cor, width: g.largura },
          });
      }
      const layout = {
        ...BASE_LAYOUT,
        margin: { l: 0, r: 0, t: 0, b: 0 },
        showlegend: false,
        uirevision: `${idPorto}|${vista}`,
        geo: {
          scope: 'south america',
          projection: { type: 'mercator' },
          ...(instalacao ? { fitbounds: 'locations' } : { lonaxis: { range: [-74, -34] }, lataxis: { range: [-34, 6] } }),
          showland: true, landcolor: COLORS.surface, showcountries: true, countrycolor: COLORS.border,
          showcoastlines: true, coastlinecolor: COLORS.border, showframe: false, bgcolor: COLORS.white,
        },
      };
      Plotly.react(div, tracos.length ? tracos : [{ type: 'scattergeo', lat: [null], lon: [null], hoverinfo: 'skip' }], layout, { displayModeBar: false, responsive: true });
      (div as any).removeAllListeners?.('plotly_click');
      (div as any).on?.('plotly_click', (e: any) => {
        const cd = e.points?.[0]?.customdata;
        if (typeof cd === 'number') setAberto({ porto: idPorto, indice: cd });
      });
    });
    return () => {
      cancelado = true;
    };
  }, [ordem, ligadas, trechos, instalacao, idPorto, vista]);

  const mover = (de: number, para: number) => {
    if (para < 0 || para >= ordem.length || de === para) return;
    const nova = [...ordem];
    const [c] = nova.splice(de, 1);
    nova.splice(para, 0, c);
    setOrdem(nova);
    setAnuncio(`${TITULOS[c]}: posição ${para + 1} de ${nova.length}`);
  };

  const trecho = aberto.porto === idPorto && aberto.indice >= 0 ? trechos[aberto.indice] : undefined;
  const campos = Object.entries(tabelas.trechos.campos).filter(([nome]) => rotulos[nome] && nome !== 'classe_mapa');
  const valorCampo = (nome: string, def: { tipo: string; unidade?: string }, v: unknown) => {
    if (v === null || v === undefined || v === '') return '—';
    if (def.tipo === 'numero') return `${fmt(v, nome === 'ocupacao_pct' ? 1 : 2)}${def.unidade ? (def.unidade === '%' ? '%' : ` ${def.unidade}`) : ''}`;
    return String(v);
  };

  return (
    <div id="mapa-acessos-portuarios" className="grid scroll-mt-6 gap-6 lg:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-5 text-[13px] text-graf-secondary">
        <div>
          <label className="grid gap-1">
            <span className="font-semibold text-graf-deep">{rotulos.instalacao}</span>
            <SelectControl value={idPorto} onChange={selecionar} options={[{ value: '', label: '—' }, ...opcoes]} />
          </label>
          <p className="mt-2 mb-0">Selecione a instalação portuária para ver no mapa seus acessos rodoviários e, abaixo, os indicadores e os dados cadastrais.</p>
        </div>

        <div>
          <ol className="m-0 grid list-none gap-1.5 p-0">
            {ordem.map((c, i) => (
              <li
                key={c}
                tabIndex={0}
                draggable
                onDragStart={() => setArrastando(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  mover(arrastando, i);
                  setArrastando(-1);
                }}
                onKeyDown={(e) => {
                  const passo = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
                  if (!passo) return;
                  e.preventDefault();
                  mover(i, i + passo);
                }}
                aria-label={`${TITULOS[c]}, posição ${i + 1} de ${ordem.length}. Use as setas para cima e para baixo para mudar a ordem.`}
                className="flex cursor-grab items-center gap-2 border border-graf-border bg-white px-2.5 py-2"
              >
                <input type="checkbox" checked={ligadas[c]} onChange={() => setLigadas({ ...ligadas, [c]: !ligadas[c] })} aria-label={TITULOS[c]} />
                <span className="flex-1 font-medium text-graf-deep">{TITULOS[c]}</span>
                <span aria-hidden="true">⋮⋮</span>
              </li>
            ))}
          </ol>
          <div className="sr-only" aria-live="polite">{anuncio}</div>
        </div>

        <div className="grid gap-3">
          <div>
            <strong className="text-graf-deep">VMDA total (veículos/dia)</strong>
          </div>
          <div>
            <strong className="text-graf-deep">Capacidade diária por sentido (veículos/dia)</strong>
            <p className="mt-1 mb-0">Acima de 30.000, a espessura cresce 1 px a cada 5.000.</p>
          </div>
          <div>
            <strong className="text-graf-deep">Ocupação (VMDA ÷ capacidade)</strong>
            <ul className="mt-1 mb-0 grid list-none gap-1 p-0">
              {nomesFaixa.map(([k, nome]) => (
                <li key={k} className="flex items-center gap-1.5">
                  <i className="inline-block h-2.5 w-4" style={{ background: CORES_FAIXA[k] }} />
                  {nome}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="inline-block h-3 w-3 rounded-full bg-graf-deep" />
            <strong className="text-graf-deep">Instalação portuária selecionada</strong>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={el} className="h-[420px] border border-graf-grid bg-white md:h-[600px]" role="img" aria-label={instalacao ? `Mapa dos acessos de ${cleanLabel(String(instalacao.instalacao))}` : 'Mapa do Brasil'} />
        {!instalacao && (
          <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-fit max-w-[90%] bg-graf-deep px-3 py-2 text-[13px] text-white">
            Selecione uma instalação portuária na lista ao lado para ver os detalhes.
          </div>
        )}
        {instalacao && (
          <button
            onClick={() => setVista((v) => v + 1)}
            className="absolute top-3 right-3 border border-graf-border bg-white px-3 py-2 text-[13px] font-medium text-graf-deep hover:border-graf-deep"
          >
            Recentralizar
          </button>
        )}
        {trecho && (
          <div className="absolute right-3 bottom-3 max-h-[80%] w-[min(340px,calc(100%-24px))] overflow-y-auto border border-graf-grid bg-white p-3 text-[12px] text-graf-secondary shadow-[0_13px_34px_var(--graf-shadow)]">
            <div className="flex items-start justify-between gap-2">
              <strong className="text-graf-deep">Informações do link</strong>
              <button onClick={() => setAberto({ porto: '', indice: -1 })} aria-label="Fechar" className="text-graf-deep">×</button>
            </div>
            <dl className="mt-2 mb-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
              {campos.map(([nome, def]) => (
                <div key={nome} className="contents">
                  <dt>{rotulos[nome]}</dt>
                  <dd className="m-0 text-right font-medium text-graf-deep">{valorCampo(nome, def, trecho[nome])}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
