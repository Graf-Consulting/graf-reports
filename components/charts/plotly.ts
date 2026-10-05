/* eslint-disable @typescript-eslint/no-explicit-any */
import { COLORS } from '@/lib/report/tokens';

export const PLOT_CONFIG = { displayModeBar: false, responsive: true };

export const BASE_LAYOUT: any = {
  paper_bgcolor: COLORS.white,
  plot_bgcolor: COLORS.white,
  font: { family: 'Montserrat, sans-serif', color: COLORS.secondary },
  margin: { l: 54, r: 20, t: 18, b: 60 },
  hoverlabel: { bgcolor: COLORS.deep, font: { color: COLORS.white } },
  xaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, linecolor: COLORS.grid },
  yaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, linecolor: COLORS.grid },
};

/** Carrega o Plotly via CDN uma única vez por página. */
export function loadPlotly(): Promise<any> {
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
