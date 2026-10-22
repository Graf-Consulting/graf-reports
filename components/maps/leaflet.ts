/* eslint-disable @typescript-eslint/no-explicit-any */

/** Leaflet 1.9.4 por CDN, com verificação de integridade (ADR-007). Não é dependência npm. */
const VERSAO = '1.9.4';
const JS = { src: `https://unpkg.com/leaflet@${VERSAO}/dist/leaflet.js`, sri: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=' };
const CSS = { href: `https://unpkg.com/leaflet@${VERSAO}/dist/leaflet.css`, sri: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=' };

let carregando: Promise<any> | null = null;

/** Carrega o Leaflet e o CSS dele uma única vez por página. */
export function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (carregando) return carregando;
  carregando = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = CSS.href;
      l.integrity = CSS.sri;
      l.crossOrigin = '';
      l.dataset.leaflet = 'true';
      document.head.appendChild(l);
    }
    const s = document.createElement('script');
    s.src = JS.src;
    s.integrity = JS.sri;
    s.crossOrigin = '';
    s.dataset.leaflet = 'true';
    s.onload = () => resolve((window as any).L);
    s.onerror = () => {
      carregando = null;
      reject(new Error('não foi possível carregar o Leaflet'));
    };
    document.head.appendChild(s);
  });
  return carregando;
}

/** Chave do fundo de ruas do CARTO, da variável de ambiente da Vercel; vazia fora dela. */
export const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? '';

/** Fundo claro do CARTO (o mesmo do painel de referência). */
export const CARTO_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const CARTO_ATRIBUICAO = '© OpenStreetMap contributors © CARTO';
