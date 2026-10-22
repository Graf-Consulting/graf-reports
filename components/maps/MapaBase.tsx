/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { COLORS } from '@/lib/report/tokens';
import { CARTO_ATRIBUICAO, CARTO_KEY, CARTO_URL, loadLeaflet } from './leaflet';

export type LatLon = [number, number];

type Mapa = { L: any; mapa: any };
const Contexto = createContext<Mapa | null>(null);

/** Leaflet e o mapa criado pelo MapaBase, para as camadas desenharem nele. */
export function useMapa(): Mapa {
  const m = useContext(Contexto);
  if (!m) throw new Error('useMapa só funciona dentro do MapaBase');
  return m;
}

type Props = {
  /** Pontos que a vista inicial enquadra. */
  limites: LatLon[];
  /** Pontos que a vista enquadra agora (ex.: a seleção); o botão de recentralizar volta a eles. */
  foco?: LatLon[];
  /** Zoom máximo ao enquadrar. */
  zoomMaximo?: number;
  /** Zoom pela roda do mouse; desligado por padrão, para não prender a rolagem da página. */
  rolagem?: boolean;
  className?: string;
  children?: ReactNode;
};

const BOTAO_CENTRO =
  '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="9" r="5"/><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none"/><path d="M9 1v3M9 14v3M1 9h3M14 9h3"/></svg>';

/**
 * Mapa do kit (ADR-007): Leaflet com o fundo claro do CARTO, zoom, atribuição e botão de recentralizar.
 * Sem a chave do CARTO (build do GitHub, ambiente local), desenha as camadas sobre fundo neutro.
 * As camadas são filhos que usam useMapa().
 */
export default function MapaBase({ limites, foco, zoomMaximo = 12, rolagem = false, className = '', children }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Mapa | null>(null);
  const [erro, setErro] = useState(false);
  const alvo = useRef<LatLon[]>(limites);

  useEffect(() => {
    let mapa: any;
    let cancelado = false;
    loadLeaflet()
      .then((L) => {
        if (cancelado || !el.current) return;
        mapa = L.map(el.current, { scrollWheelZoom: rolagem, zoomSnap: 0.25 });
        if (CARTO_KEY) L.tileLayer(`${CARTO_URL}?key=${CARTO_KEY}`, { subdomains: 'abcd', maxZoom: 20, attribution: CARTO_ATRIBUICAO }).addTo(mapa);
        const Centro = L.Control.extend({
          options: { position: 'topleft' },
          onAdd() {
            const caixa = L.DomUtil.create('div', 'leaflet-bar');
            const b = L.DomUtil.create('button', '', caixa);
            b.type = 'button';
            b.title = 'Recentralizar';
            b.setAttribute('aria-label', 'Recentralizar');
            b.style.cssText = `width:30px;height:30px;display:grid;place-items:center;cursor:pointer;background:${COLORS.white};color:${COLORS.deep}`;
            b.innerHTML = BOTAO_CENTRO;
            L.DomEvent.disableClickPropagation(caixa);
            L.DomEvent.on(b, 'click', () => enquadrar(L, mapa, alvo.current, zoomMaximo));
            return caixa;
          },
        });
        new Centro().addTo(mapa);
        enquadrar(L, mapa, limites, zoomMaximo);
        setEstado({ L, mapa });
      })
      .catch(() => setErro(true));
    return () => {
      cancelado = true;
      mapa?.remove();
    };
    // O mapa é criado uma vez; limites e foco mudam a vista nos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chaveFoco = JSON.stringify(foco ?? null);
  useEffect(() => {
    alvo.current = foco?.length ? foco : limites;
    if (estado) enquadrar(estado.L, estado.mapa, alvo.current, zoomMaximo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, chaveFoco]);

  return (
    <div className={`relative ${className}`}>
      <div ref={el} className="absolute inset-0 bg-graf-surface" />
      {!CARTO_KEY && estado && (
        <p className="pointer-events-none absolute right-2 bottom-6 z-500 m-0 bg-white/90 px-2 py-1 text-[11px] text-graf-text">
          Fundo de ruas indisponível neste ambiente
        </p>
      )}
      {erro && <p className="absolute inset-0 m-0 grid place-items-center p-4 text-center text-[13px] text-graf-text">Não foi possível carregar o mapa.</p>}
      {estado && <Contexto.Provider value={estado}>{children}</Contexto.Provider>}
    </div>
  );
}

function enquadrar(L: any, mapa: any, pontos: LatLon[], zoomMaximo: number) {
  if (!pontos.length) return;
  if (pontos.length === 1) return mapa.setView(pontos[0], zoomMaximo);
  mapa.fitBounds(L.latLngBounds(pontos).pad(0.15), { maxZoom: zoomMaximo });
}
