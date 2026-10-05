/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import PlotlyChart from './PlotlyChart';
import { BASE_LAYOUT } from './plotly';

type Props = {
  rows: any[];
  /** Coluna com o rótulo de cada barra. */
  labelKey: string;
  /** Coluna que define a ordem e o comprimento das barras. */
  valueKey: string;
  /** Coluna extra exibida no hover (via customdata). */
  extraKey?: string;
  color: string;
  topN?: number;
  xAxisTitle: string;
  hovertemplate: string;
  className?: string;
};

/** Barras horizontais com os N maiores valores, o maior no topo. */
export default function RankingChart({
  rows,
  labelKey,
  valueKey,
  extraKey,
  color,
  topN = 10,
  xAxisTitle,
  hovertemplate,
  className,
}: Props) {
  const traces = useMemo(() => {
    const top = rows
      .slice()
      .sort((a, b) => b[valueKey] - a[valueKey])
      .slice(0, topN)
      .reverse();
    return [
      {
        type: 'bar',
        orientation: 'h',
        x: top.map((r) => r[valueKey]),
        y: top.map((r) => r[labelKey]),
        customdata: extraKey ? top.map((r) => r[extraKey]) : undefined,
        marker: { color },
        hovertemplate,
      },
    ];
  }, [rows, labelKey, valueKey, extraKey, color, topN, hovertemplate]);

  const layout = useMemo(
    () => ({
      ...BASE_LAYOUT,
      margin: { l: 150, r: 14, t: 8, b: 52 },
      xaxis: { ...BASE_LAYOUT.xaxis, title: xAxisTitle, tickformat: '~s' },
      yaxis: { ...BASE_LAYOUT.yaxis, automargin: true },
    }),
    [xAxisTitle]
  );

  return <PlotlyChart traces={traces} layout={layout} className={className} />;
}
