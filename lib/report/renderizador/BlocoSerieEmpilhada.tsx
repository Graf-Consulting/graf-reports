'use client';

import { useState } from 'react';
import { StackedAreaChart } from '@/components/charts';
import { ChartCard, SelectControl, ToggleButton } from '@/components/report';
import type { Linha } from './tipos';

type Props = {
  titulo?: string;
  descricao?: string;
  periodo: string;
  /** Opções de dimensão, a primeira é a inicial. Rótulos já formatados nas linhas. */
  dimensoes: { campo: string; rotulo: string; linhas: Linha[] }[];
  /** Opções de métrica, a primeira é a inicial. */
  metricas: { campo: string; rotulo: string; eixo: string }[];
  top?: number;
};

/** Bloco serie_empilhada: área empilhada com troca de dimensão e de métrica. */
export default function BlocoSerieEmpilhada({ titulo, descricao, periodo, dimensoes, metricas, top }: Props) {
  const [dim, setDim] = useState(0);
  const [met, setMet] = useState(metricas[0].campo);
  const d = dimensoes[dim];
  const m = metricas.find((x) => x.campo === met) ?? metricas[0];

  return (
    <ChartCard
      title={titulo}
      description={descricao}
      controls={
        <>
          {dimensoes.length > 1 &&
            dimensoes.map((x, i) => (
              <ToggleButton key={x.campo} active={dim === i} onClick={() => setDim(i)}>
                {x.rotulo}
              </ToggleButton>
            ))}
          {metricas.length > 1 && (
            <SelectControl value={met} onChange={setMet} options={metricas.map((x) => ({ value: x.campo, label: x.rotulo }))} />
          )}
        </>
      }
    >
      <StackedAreaChart
        rows={d.linhas}
        periodKey={periodo}
        seriesKey={d.campo}
        valueKey={m.campo}
        topN={top}
        yAxisTitle={m.eixo}
        className="h-[350px] md:h-[395px]"
      />
    </ChartCard>
  );
}
