/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import PlotlyChart from './PlotlyChart';
import { BASE_LAYOUT } from './plotly';

/** Cores dos nós de cada camada, da esquerda para a direita. */
const NODE_PALETTES = [
  ['#d9edf6', '#c9e7d0', '#f8dfc5', '#e2d6eb', '#d8e5e4', '#f1d7d3'],
  ['#001E1D', '#17606A', '#3A7B80', '#456A7A', '#54595F', '#346B77'],
  ['#F5A855', '#dc8c4f', '#d66d52', '#e4a441', '#c75f50', '#d98355'],
];

/** Cor das ligações que saem de cada camada. */
const LINK_COLORS = ['rgba(110,193,228,.38)', 'rgba(245,168,85,.38)'];

type Props = {
  rows: any[];
  /** Colunas de cada camada, da esquerda para a direita (até 3). Os valores já devem vir limpos. */
  layers: string[];
  valueKey: string;
  /** Quantos caminhos completos mostrar, pelos maiores valores. */
  topN?: number;
  className?: string;
};

/** Fluxo em camadas: soma o valor por caminho completo e mostra os N maiores. */
export default function SankeyChart({ rows, layers, valueKey, topN = 100, className }: Props) {
  const traces = useMemo(() => {
    const sums: Record<string, number> = {};
    rows.forEach((r) => {
      const path = layers.map((k) => r[k]).join('|');
      sums[path] = (sums[path] || 0) + r[valueKey];
    });
    const flows = Object.entries(sums)
      .map(([path, value]) => ({ parts: path.split('|'), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN);

    const layerNodes = layers.map((_, l) => [...new Set(flows.map((f) => f.parts[l]))]);
    const nodes = layerNodes.flat();
    const index = new Map(nodes.map((n, i) => [n, i]));
    const nodeColors = layerNodes.flatMap((list, l) => {
      const palette = NODE_PALETTES[l % NODE_PALETTES.length];
      return list.map((_, i) => palette[i % palette.length]);
    });

    const links: any = { source: [], target: [], value: [], label: [], color: [] };
    flows.forEach((f) => {
      for (let i = 0; i < layers.length - 1; i++) {
        links.source.push(index.get(f.parts[i]));
        links.target.push(index.get(f.parts[i + 1]));
        links.value.push(f.value);
        links.label.push(`${f.parts[i]} → ${f.parts[i + 1]}`);
        links.color.push(LINK_COLORS[i % LINK_COLORS.length]);
      }
    });

    return [
      {
        type: 'sankey',
        orientation: 'h',
        node: { pad: 13, thickness: 16, line: { color: 'rgba(0,30,29,.24)', width: 0.5 }, label: nodes, color: nodeColors },
        link: {
          source: links.source,
          target: links.target,
          value: links.value,
          color: links.color,
          customdata: links.label,
          hovertemplate: '<b>%{customdata}</b><br>%{value:,.2f}<extra></extra>',
        },
      },
    ];
  }, [rows, layers, valueKey, topN]);

  const layout = useMemo(() => ({ ...BASE_LAYOUT, margin: { l: 10, r: 10, t: 12, b: 12 } }), []);

  return <PlotlyChart traces={traces} layout={layout} className={className} />;
}
