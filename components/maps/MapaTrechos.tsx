/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { SelectControl } from '@/components/report/Controls';
import { useSelecao } from '@/components/report/Selecao';
import { COLORS } from '@/lib/report/tokens';
import MapaBase, { useMapa, type LatLon } from './MapaBase';

/** Um trecho já preparado pelo renderizador: traçado, nome, valor em cada camada (ou null) e valores da caixa. */
export type Trecho = {
  chave: string;
  linhas: LatLon[][];
  nome: string;
  camadas: ({ largura: number; texto: string } | null)[];
  detalhe: string[];
};
export type CamadaTrechos = { rotulo: string; titulo: string; cor: string; legenda: { texto: string; largura: number }[] };

type Props = {
  /** Pontos do seletor, em ordem alfabética. */
  pontos: { id: string; rotulo: string; ponto: LatLon | null }[];
  rotuloSeletor: string;
  rotuloPonto: string;
  /** Camadas na ordem inicial, a primeira por cima. */
  camadas: CamadaTrechos[];
  trechos: Trecho[];
  /** Rótulos da caixa de detalhe, na ordem de Trecho.detalhe. */
  detalhe: string[];
  /** Campo da seleção compartilhada (ex.: id_porto); sem ele, a seleção fica só no mapa. */
  selecao?: string;
};

const PONTO = -1;
const ESCOLHA = 'Escolha na lista…';
const VAZIO = 'Escolha na lista para ver os trechos no mapa.';
const DETALHE = 'Informações do trecho';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/**
 * Bloco mapa_trechos (ADR-007): seletor de ponto e os trechos dele em camadas de linhas, com espessura pelo valor.
 * O leitor liga e desliga camadas e muda a ordem (arrastando ou pelos botões); clicar num trecho abre os atributos.
 */
export default function MapaTrechos({ pontos, rotuloSeletor, rotuloPonto, camadas, trechos, detalhe, selecao }: Props) {
  const [compartilhada, setCompartilhada] = useSelecao(selecao ?? '');
  const [local, setLocal] = useState('');
  const [id, setId] = selecao ? [compartilhada, setCompartilhada] : [local, setLocal];

  const [ordem, setOrdem] = useState<number[]>([PONTO, ...camadas.map((_, i) => i)]);
  const [ligadas, setLigadas] = useState<Record<number, boolean>>({});
  const [anuncio, setAnuncio] = useState('');
  const [arrastando, setArrastando] = useState<number | null>(null);

  const ponto = pontos.find((p) => p.id === id);
  const doPonto = useMemo(() => trechos.filter((t) => t.chave === id), [trechos, id]);
  const foco = useMemo(() => [...doPonto.flatMap((t) => t.linhas.flat()), ...(ponto?.ponto ? [ponto.ponto] : [])], [doPonto, ponto]);
  const nome = (k: number) => (k === PONTO ? rotuloPonto : camadas[k].rotulo);
  const ligada = (k: number) => ligadas[k] !== false;

  const mover = (de: number, para: number) => {
    if (para < 0 || para >= ordem.length || de === para) return;
    const nova = [...ordem];
    const [k] = nova.splice(de, 1);
    nova.splice(para, 0, k);
    setOrdem(nova);
    setAnuncio(`${nome(k)}: posição ${para + 1} de ${nova.length}`);
  };

  return (
    // No celular: seletor, mapa e depois camadas e legenda; no desktop, painel à esquerda e mapa à direita.
    <div data-selecao={selecao} className="grid scroll-mt-6 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-6">
      <label className="grid gap-1 text-[13px] font-semibold text-graf-deep lg:col-start-1 lg:row-start-1">
        {rotuloSeletor}
        <SelectControl value={id} onChange={setId} options={[{ value: '', label: ESCOLHA }, ...pontos.map((p) => ({ value: p.id, label: p.rotulo }))]} />
      </label>

      <div className="grid content-start gap-5 text-[13px] text-graf-secondary max-lg:order-last lg:col-start-1 lg:row-start-2">
        <ol className="m-0 grid list-none gap-1.5 p-0" aria-label="Camadas, a primeira por cima">
          {ordem.map((k, i) => (
            <li
              key={k}
              draggable
              onDragStart={() => setArrastando(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastando !== null) mover(arrastando, i);
                setArrastando(null);
              }}
              className="flex cursor-grab items-center gap-2 border border-graf-border bg-white px-2.5 py-2"
            >
              <input type="checkbox" checked={ligada(k)} onChange={() => setLigadas({ ...ligadas, [k]: !ligada(k) })} aria-label={`Mostrar ${nome(k)}`} />
              <i
                className={`inline-block h-3 w-3 shrink-0 ${k === PONTO ? 'rounded-full' : ''}`}
                style={{ background: k === PONTO ? COLORS.deep : camadas[k].cor }}
                aria-hidden="true"
              />
              <span className="flex-1 font-medium text-graf-deep">{nome(k)}</span>
              <span className="text-[11px] text-graf-text">{i === 0 ? 'topo' : i === ordem.length - 1 ? 'base' : `${i + 1}ª`}</span>
              <button type="button" onClick={() => mover(i, i - 1)} disabled={i === 0} aria-label={`Subir ${nome(k)}`} className="px-1 disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => mover(i, i + 1)} disabled={i === ordem.length - 1} aria-label={`Descer ${nome(k)}`} className="px-1 disabled:opacity-30">
                ↓
              </button>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">
          {anuncio}
        </p>

        <div className="grid gap-3">
          {camadas.map((c) => (
            <div key={c.titulo}>
              <strong className="text-graf-deep">{c.titulo}</strong>
              <ul className="mt-1 mb-0 grid list-none gap-1 p-0">
                {c.legenda.map((l) => (
                  <li key={l.texto} className="flex items-center gap-2">
                    <i className="inline-block w-7 shrink-0" style={{ height: l.largura, background: c.cor }} aria-hidden="true" />
                    {l.texto}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <i className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS.deep }} aria-hidden="true" />
            <strong className="text-graf-deep">{rotuloPonto}</strong>
          </div>
        </div>
      </div>

      <MapaBase
        limites={pontos.flatMap((p) => (p.ponto ? [p.ponto] : []))}
        foco={foco}
        zoomMaximo={13}
        rolagem
        className="h-105 border border-graf-grid md:h-155 lg:col-start-2 lg:row-span-2 lg:row-start-1"
      >
        <CamadasTrechos ordem={ordem} ligada={ligada} camadas={camadas} trechos={doPonto} ponto={ponto} detalhe={detalhe} />
        {!ponto && (
          <p className="pointer-events-none absolute inset-x-0 top-3 z-500 mx-auto w-fit max-w-[90%] bg-graf-deep px-3 py-2 text-center text-[13px] text-white">
            {VAZIO}
          </p>
        )}
      </MapaBase>
    </div>
  );
}

type Camadas = {
  ordem: number[];
  ligada: (k: number) => boolean;
  camadas: CamadaTrechos[];
  trechos: Trecho[];
  ponto?: { rotulo: string; ponto: LatLon | null };
  detalhe: string[];
};

/** Um painel do Leaflet por camada, para a ordem de desenho seguir a lista. */
function CamadasTrechos({ ordem, ligada, camadas, trechos, ponto, detalhe }: Camadas) {
  const { L, mapa } = useMapa();
  const paineis = useMemo(() => {
    const p: Record<number, { grupo: any; render: any; nome: string }> = {};
    for (const k of [PONTO, ...camadas.map((_, i) => i)]) {
      const nome = `camada${k === PONTO ? 'Ponto' : k}`;
      if (!mapa.getPane(nome)) mapa.createPane(nome);
      p[k] = { grupo: L.layerGroup().addTo(mapa), render: L.svg({ pane: nome }), nome };
    }
    return p;
  }, [L, mapa, camadas]);

  useEffect(() => () => Object.values(paineis).forEach((p) => p.grupo.remove()), [paineis]);

  useEffect(() => {
    ordem.forEach((k, i) => {
      mapa.getPane(paineis[k].nome).style.zIndex = String(400 + (ordem.length - i) * 10);
      if (ligada(k)) paineis[k].grupo.addTo(mapa);
      else paineis[k].grupo.remove();
    });
  }, [mapa, paineis, ordem, ligada]);

  useEffect(() => {
    Object.values(paineis).forEach((p) => p.grupo.clearLayers());
    const caixa = (t: Trecho) =>
      `<strong style="display:block;margin-bottom:6px;color:${COLORS.deep}">${DETALHE}</strong>` +
      `<table style="border-collapse:collapse;font-size:12px;color:${COLORS.secondary}">` +
      detalhe.map((r, i) => `<tr><td style="padding:2px 8px 2px 0">${esc(r)}</td><td style="padding:2px 0;text-align:right;color:${COLORS.deep};font-weight:600">${esc(t.detalhe[i])}</td></tr>`).join('') +
      '</table>';
    for (const t of trechos)
      t.camadas.forEach((v, k) => {
        if (!v) return;
        const p = paineis[k];
        L.polyline(t.linhas, { pane: p.nome, renderer: p.render, color: camadas[k].cor, weight: v.largura, opacity: 0.85, lineCap: 'round' })
          .bindTooltip(`<b>${esc(t.nome)}</b><br>${esc(camadas[k].rotulo)}: ${esc(v.texto)}`, { sticky: true, direction: 'top' })
          .bindPopup(caixa(t), { maxWidth: 360, maxHeight: 320 })
          .addTo(p.grupo);
      });
    if (ponto?.ponto) {
      const p = paineis[PONTO];
      L.circleMarker(ponto.ponto, { pane: p.nome, renderer: p.render, radius: 8, color: COLORS.white, weight: 2, fillColor: COLORS.deep, fillOpacity: 1 })
        .bindTooltip(esc(ponto.rotulo), { direction: 'top' })
        .addTo(p.grupo);
    }
  }, [L, paineis, camadas, trechos, ponto, detalhe]);

  return null;
}
