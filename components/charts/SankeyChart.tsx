/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from 'react';
import PlotlyChart from './PlotlyChart';
import { BASE_LAYOUT } from './plotly';
import {
  SANKEY_LINK_COLORS as LINK_COLORS,
  SANKEY_NODE_LINE,
  SANKEY_NODE_PALETTES as NODE_PALETTES,
} from '@/lib/report/tokens';

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
        node: { pad: 13, thickness: 16, line: { color: SANKEY_NODE_LINE, width: 0.5 }, label: nodes, color: nodeColors },
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
