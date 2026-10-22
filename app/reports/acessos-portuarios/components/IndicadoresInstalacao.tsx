'use client';

import { MetricCards, useSelecao } from '@/components/report';
import { ACCENT_SEQUENCE } from '@/lib/report/tokens';
import { comUnidade, decimal, inteiro } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';

const AGUARDANDO = 'Aguardando seleção';
const SEM_VALOR = '—';

// Vem de props na composição; o registro do renderizador tipa as props extras como opcionais.
type Props = PropsProprio & { selecao?: string };

/** Três cartões com os totais da instalação portuária escolhida no mapa; sem escolha, travessão. */
export function IndicadoresInstalacao({ tabelas, textos, rotulos, selecao = '' }: Props) {
  const [id] = useSelecao(selecao);
  const { campos, linhas } = tabelas.instalacoes;
  const linha = linhas.find((l) => l[selecao] === id);
  const km = (campo: string) => comUnidade(decimal(Number(linha?.[campo])), campos[campo]?.unidade);
  const parcela = linha?.participacao_70_pct;

  const itens = [
    {
      campo: 'extensao_total_km',
      leitura: 'detalhe-extensao-instalacao',
      complemento: linha && `${inteiro(Number(linha.links))} ${(rotulos.links ?? '').toLowerCase()}`.trim(),
    },
    {
      campo: 'extensao_70_km',
      leitura: 'detalhe-70-instalacao',
      complemento: typeof parcela === 'number' ? comUnidade(decimal(parcela), campos.participacao_70_pct?.unidade) : undefined,
    },
    { campo: 'extensao_sem_vmda_km', leitura: 'detalhe-sem-vmda-instalacao', complemento: undefined },
  ];

  return (
    <MetricCards
      items={itens.map((it, i) => ({
        label: rotulos[it.campo] ?? it.campo,
        accent: ACCENT_SEQUENCE[i % ACCENT_SEQUENCE.length],
        value: linha ? km(it.campo) : SEM_VALOR,
        detail: linha ? (
          <>
            {it.complemento && <>{it.complemento} </>}
            {textos.leituras[it.leitura]?.conteudo}
          </>
        ) : (
          AGUARDANDO
        ),
      }))}
    />
  );
}
