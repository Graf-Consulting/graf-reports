/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
import { PLOT_CONFIG, loadPlotly } from './plotly';

type Props = {
  traces: any[];
  layout: any;
  className?: string;
};

/** Base de todos os gráficos do kit: carrega o Plotly e redesenha quando traces ou layout mudam. */
export default function PlotlyChart({ traces, layout, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadPlotly().then((Plotly) => {
      if (!cancelled && ref.current) Plotly.react(ref.current, traces, layout, PLOT_CONFIG);
    });
    return () => {
      cancelled = true;
    };
  }, [traces, layout]);

  return <div ref={ref} className={className} />;
}
