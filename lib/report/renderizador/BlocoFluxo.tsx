'use client';

import { useMemo, useState } from 'react';
import { SankeyChart } from '@/components/charts';
import { ChartCard, SelectControl, ToggleButton } from '@/components/report';
import type { Linha } from './tipos';

type Props = {
  titulo?: string;
  descricao?: string;
  camadas: string[];
  /** Opções de métrica, a primeira é a inicial. */
  metricas: { campo: string; rotulo: string }[];
  /** Filtro opcional; "todos" mostra todas as linhas. A primeira opção é a inicial. */
  filtro?: { campo: string; opcoes: { valor: string; rotulo: string }[] };
  linhas: Linha[];
  top?: number;
};

/** Bloco fluxo: Sankey em camadas com troca de métrica e filtro opcional. */
export default function BlocoFluxo({ titulo, descricao, camadas, metricas, filtro, linhas, top }: Props) {
  const [met, setMet] = useState(metricas[0].campo);
  const [valorFiltro, setValorFiltro] = useState(filtro?.opcoes[0].valor ?? 'todos');

  const visiveis = useMemo(
    () => (!filtro || valorFiltro === 'todos' ? linhas : linhas.filter((l) => String(l[filtro.campo]) === valorFiltro)),
    [linhas, filtro, valorFiltro]
  );

  return (
    <ChartCard
      title={titulo}
      description={descricao}
      controls={
        <>
          {metricas.length > 1 &&
            metricas.map((x) => (
              <ToggleButton key={x.campo} active={met === x.campo} onClick={() => setMet(x.campo)}>
                {x.rotulo}
              </ToggleButton>
            ))}
          {filtro && (
            <SelectControl
              value={valorFiltro}
              onChange={setValorFiltro}
              options={filtro.opcoes.map((o) => ({ value: o.valor, label: o.rotulo }))}
            />
          )}
        </>
      }
    >
      <SankeyChart rows={visiveis} layers={camadas} valueKey={met} topN={top} className="h-[540px] md:h-[610px]" />
    </ChartCard>
  );
}
