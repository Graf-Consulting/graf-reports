/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import { AREA_PALETTE } from '@/lib/report/tokens';
import PlotlyChart from './PlotlyChart';
import { BASE_LAYOUT } from './plotly';

const identity = (v: string) => v;

type Props = {
  rows: any[];
  /** Coluna do período (eixo x). */
  periodKey: string;
  /** Coluna que define cada série. */
  seriesKey: string;
  valueKey: string;
  /** Quantas séries mostrar, escolhidas pelo maior total. */
  topN?: number;
  /** Ajusta o nome exibido de cada série. */
  formatLabel?: (value: string) => string;
  xAxisTitle?: string;
  yAxisTitle: string;
  className?: string;
};

/** Área empilhada por período com as N séries de maior total. */
export default function StackedAreaChart({
  rows,
  periodKey,
  seriesKey,
  valueKey,
  topN = 10,
  formatLabel = identity,
  xAxisTitle = 'Mês',
  yAxisTitle,
  className,
}: Props) {
  const traces = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach((r) => (totals[r[seriesKey]] = (totals[r[seriesKey]] || 0) + r[valueKey]));
    const selected = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map((x) => x[0]);
    const periods = [...new Set(rows.map((r) => r[periodKey]))].sort();
    return selected.map((item, i) => {
      const label = formatLabel(item);
      const color = AREA_PALETTE[i % AREA_PALETTE.length];
      return {
        type: 'scatter',
        mode: 'lines',
        x: periods,
        y: periods.map((p) => {
          const r = rows.find((c) => c[periodKey] === p && c[seriesKey] === item);
          return r ? r[valueKey] : 0;
        }),
        name: label,
        stackgroup: 'one',
        fillcolor: color,
        line: { color, width: 1.2 },
        opacity: 0.92,
        hovertemplate: `<b>${label}</b><br>%{x}<br>%{y:,.2f}<extra></extra>`,
      };
    });
  }, [rows, periodKey, seriesKey, valueKey, topN, formatLabel]);

  const layout = useMemo(
    () => ({
      ...BASE_LAYOUT,
      hovermode: 'x unified',
      margin: { l: 64, r: 20, t: 14, b: 105 },
      xaxis: { ...BASE_LAYOUT.xaxis, title: xAxisTitle },
      yaxis: { ...BASE_LAYOUT.yaxis, title: yAxisTitle, tickformat: '~s' },
      legend: { orientation: 'h', y: -0.28, x: 0, font: { size: 11 } },
    }),
    [xAxisTitle, yAxisTitle]
  );

  return <PlotlyChart traces={traces} layout={layout} className={className} />;
}
