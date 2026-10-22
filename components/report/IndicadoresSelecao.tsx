'use client';

import type { ReactNode } from 'react';
import MetricCards from './MetricCards';
import { useSelecao } from './Selecao';

export const AGUARDANDO = 'Aguardando seleção';
export const SEM_VALOR = '—';

type Props = {
  /** Um cartão por indicador: nome, cor e detalhe (leitura da metodologia). */
  itens: { label: string; accent: string; detalhe: ReactNode }[];
  /** Por id selecionado, o valor e o complemento de cada cartão, na ordem de itens. */
  valores: Record<string, { valor: string; complemento?: string }[]>;
  /** Campo da seleção compartilhada (ADR-007). */
  selecao: string;
};

/** Cartões de indicadores que mostram a linha escolhida na seleção da página; sem escolha, travessão. */
export default function IndicadoresSelecao({ itens, valores, selecao }: Props) {
  const [id] = useSelecao(selecao);
  const linha = valores[id];
  return (
    <MetricCards
      items={itens.map((it, i) => ({
        label: it.label,
        accent: it.accent,
        value: linha ? linha[i].valor : SEM_VALOR,
        detail: linha ? (
          <>
            {linha[i].complemento && <>{linha[i].complemento} </>}
            {it.detalhe}
          </>
        ) : (
          AGUARDANDO
        ),
      }))}
    />
  );
}
