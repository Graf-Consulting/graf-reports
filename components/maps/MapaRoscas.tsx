/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { SelectControl } from '@/components/report/Controls';
import { irParaSelecao, useSelecao } from '@/components/report/Selecao';
import { COLORS } from '@/lib/report/tokens';
import MapaBase, { useMapa, type LatLon } from './MapaBase';

export type Fatia = { categoria: string; cor: string; valor: number; valorTexto: string; parcelaTexto?: string };
export type PontoRosca = {
  id: string;
  rotulo: string;
  ponto: LatLon;
  tamanho: number;
  tamanhoTexto: string;
  filtros: Record<string, string>;
  fatias: Fatia[];
};

type Props = {
  titulo?: string;
  descricao?: string;
  /** Pontos já na ordem da lista (maiores primeiro). */
  pontos: PontoRosca[];
  filtros: { campo: string; rotulo: string }[];
  legenda: { categoria: string; cor: string }[];
  rotulos: { categoria: string; valor: string; parcela?: string; total: string; contagem?: string };
  /** Campo da seleção compartilhada que o clique publica (ex.: id_porto). */
  selecao?: string;
};

const SEM_FILTRO = '';
const ROTULO_SEM_FILTRO = 'Sem filtro';
const ROTULO_VER = 'Ver detalhes';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/**
 * Bloco mapa_roscas (ADR-007): uma rosca por ponto, dividida por categoria e com área proporcional ao tamanho;
 * filtros em cascata, lista ao lado com barra empilhada e caixa com os valores ao clicar.
 */
export default function MapaRoscas({ titulo, descricao, pontos, filtros, legenda, rotulos, selecao }: Props) {
  const [escolhas, setEscolhas] = useState<string[]>(filtros.map(() => SEM_FILTRO));
  const [, selecionar] = useSelecao(selecao ?? '');

  const passa = (p: PontoRosca, ate: number) => filtros.slice(0, ate).every((f, i) => !escolhas[i] || p.filtros[f.campo] === escolhas[i]);
  const visiveis = pontos.filter((p) => passa(p, filtros.length));
  const opcoes = filtros.map((f, i) => [...new Set(pontos.filter((p) => passa(p, i)).map((p) => p.filtros[f.campo]))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR')));
  const maior = Math.max(1, ...visiveis.map((p) => p.tamanho));

  const abrir = (id: string) => {
    if (!selecao) return;
    selecionar(id);
    irParaSelecao(selecao);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 text-[13px] text-graf-secondary">
        {filtros.map((f, i) => (
          <label key={f.campo} className="grid gap-1 font-medium">
            {f.rotulo}
            <SelectControl
              value={escolhas[i]}
              onChange={(v) => setEscolhas(escolhas.map((e, j) => (j === i ? v : j > i ? SEM_FILTRO : e)))}
              options={[{ value: SEM_FILTRO, label: ROTULO_SEM_FILTRO }, ...opcoes[i].map((o) => ({ value: o, label: o }))]}
            />
          </label>
        ))}
        {rotulos.contagem && (
          <span className="pb-2" aria-live="polite">
            {visiveis.length} {rotulos.contagem.charAt(0).toLowerCase() + rotulos.contagem.slice(1)}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <MapaBase limites={pontos.map((p) => p.ponto)} foco={visiveis.map((p) => p.ponto)} zoomMaximo={9} className="h-[380px] border border-graf-grid md:h-[540px]">
          <CamadaRoscas pontos={visiveis} maior={Math.max(1, ...pontos.map((p) => p.tamanho))} rotulos={rotulos} aoAbrir={selecao ? abrir : undefined} />
        </MapaBase>

        <div className="border border-graf-grid bg-white">
          {(titulo || descricao) && (
            <div className="border-b border-graf-grid px-4 py-3">
              {titulo && <h3 className="m-0 text-[15px] font-semibold text-graf-deep">{titulo}</h3>}
              {descricao && <p className="mt-1 mb-0 text-[12px] text-graf-text">{descricao}</p>}
            </div>
          )}
          <ol className="m-0 max-h-[480px] list-none overflow-y-auto p-0">
            {visiveis.map((p) => (
              <li key={p.id} className="border-b border-graf-grid last:border-b-0">
                <button
                  type="button"
                  onClick={() => abrir(p.id)}
                  disabled={!selecao}
                  title={p.fatias.map((f) => `${f.categoria}: ${f.valorTexto}`).join(' | ')}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-2 text-left text-[12px] text-graf-secondary enabled:hover:bg-graf-surface"
                >
                  <span className="truncate font-medium text-graf-deep">{p.rotulo}</span>
                  <b className="font-semibold text-graf-deep">{p.tamanhoTexto}</b>
                  <span className="col-span-2 flex h-2.5 overflow-hidden bg-graf-grid" style={{ width: `${Math.max(2, (100 * p.tamanho) / maior)}%` }} aria-hidden="true">
                    {p.fatias.map((f) => (p.tamanho ? <i key={f.categoria} style={{ width: `${(100 * f.valor) / p.tamanho}%`, background: f.cor }} /> : null))}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ul className="mt-4 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[12px] text-graf-secondary" aria-label={rotulos.categoria}>
        {legenda.map((l) => (
          <li key={l.categoria} className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5" style={{ background: l.cor }} />
            {l.categoria}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Camada = { pontos: PontoRosca[]; maior: number; rotulos: Props['rotulos']; aoAbrir?: (id: string) => void };

/** Desenha as roscas no MapaBase; as maiores ficam por baixo. */
function CamadaRoscas({ pontos, maior, rotulos, aoAbrir }: Camada) {
  const { L, mapa } = useMapa();
  const grupo = useMemo(() => L.layerGroup().addTo(mapa), [L, mapa]);

  useEffect(() => () => void grupo.remove(), [grupo]);

  useEffect(() => {
    const clique = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-abrir]');
      if (b && aoAbrir) aoAbrir(b.dataset.abrir ?? '');
    };
    const el = mapa.getContainer() as HTMLElement;
    el.addEventListener('click', clique);
    return () => el.removeEventListener('click', clique);
  }, [mapa, aoAbrir]);

  useEffect(() => {
    grupo.clearLayers();
    [...pontos]
      .sort((a, b) => b.tamanho - a.tamanho)
      .forEach((p) => {
        const m = L.marker(p.ponto, { icon: rosca(L, p, maior), title: p.rotulo, keyboard: true });
        m.bindTooltip(esc(p.rotulo), { direction: 'top' });
        m.bindPopup(caixa(p, rotulos, Boolean(aoAbrir)), { minWidth: 260 });
        grupo.addLayer(m);
      });
  }, [L, grupo, pontos, maior, rotulos, aoAbrir]);

  return null;
}

function rosca(L: any, p: PontoRosca, maior: number) {
  const d = Math.round(26 + 38 * Math.sqrt(p.tamanho / maior));
  const r = d / 2, ri = r * 0.52;
  const pt = (a: number, rr: number) => `${(r + rr * Math.cos(a)).toFixed(2)} ${(r + rr * Math.sin(a)).toFixed(2)}`;
  let a0 = -Math.PI / 2, fatias = '';
  if (p.tamanho > 0)
    for (const f of p.fatias) {
      if (!f.valor) continue;
      const parte = f.valor / p.tamanho;
      if (parte >= 0.9999) {
        fatias += `<circle cx="${r}" cy="${r}" r="${(r + ri) / 2}" fill="none" stroke="${f.cor}" stroke-width="${r - ri}"/>`;
        continue;
      }
      const a1 = a0 + parte * 2 * Math.PI, g = parte > 0.5 ? 1 : 0;
      fatias += `<path d="M${pt(a0, r)} A${r} ${r} 0 ${g} 1 ${pt(a1, r)} L${pt(a1, ri)} A${ri} ${ri} 0 ${g} 0 ${pt(a0, ri)}Z" fill="${f.cor}"/>`;
      a0 = a1;
    }
  else fatias = `<circle cx="${r}" cy="${r}" r="${(r + ri) / 2}" fill="none" stroke="${COLORS.border}" stroke-width="${r - ri}"/>`;
  const svg =
    `<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}" aria-hidden="true"><circle cx="${r}" cy="${r}" r="${r}" fill="${COLORS.white}"/>` +
    `${fatias}<circle cx="${r}" cy="${r}" r="${Math.max(2.5, ri * 0.35)}" fill="${COLORS.deep}"/></svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [d, d], iconAnchor: [r, r], popupAnchor: [0, -r] });
}

function caixa(p: PontoRosca, rotulos: Props['rotulos'], comBotao: boolean) {
  const td = 'padding:3px 6px;border-bottom:1px solid ' + COLORS.grid;
  const linhas = p.fatias
    .map(
      (f) =>
        `<tr><td style="${td}"><i style="display:inline-block;width:10px;height:10px;margin-right:6px;background:${f.cor}"></i>${esc(f.categoria)}</td>` +
        `<td style="${td};text-align:right">${esc(f.valorTexto)}</td>${rotulos.parcela ? `<td style="${td};text-align:right">${esc(f.parcelaTexto ?? '')}</td>` : ''}</tr>`
    )
    .join('');
  const cab = `<tr><th style="${td};text-align:left">${esc(rotulos.categoria)}</th><th style="${td};text-align:right">${esc(rotulos.valor)}</th>${rotulos.parcela ? `<th style="${td};text-align:right">${esc(rotulos.parcela)}</th>` : ''}</tr>`;
  const total = `<tr><td style="padding:3px 6px"><b>${esc(rotulos.total)}</b></td><td style="padding:3px 6px;text-align:right"><b>${esc(p.tamanhoTexto)}</b></td>${rotulos.parcela ? '<td></td>' : ''}</tr>`;
  const botao = comBotao
    ? `<button type="button" data-abrir="${esc(p.id)}" style="margin-top:8px;padding:6px 10px;border:1px solid ${COLORS.deep};background:${COLORS.white};color:${COLORS.deep};font-weight:600;cursor:pointer">${ROTULO_VER}</button>`
    : '';
  return `<div style="font-family:inherit;font-size:12px;color:${COLORS.secondary}"><strong style="display:block;margin-bottom:6px;color:${COLORS.deep};font-size:13px">${esc(p.rotulo)}</strong><table style="border-collapse:collapse;width:100%">${cab}${linhas}${total}</table>${botao}</div>`;
}
