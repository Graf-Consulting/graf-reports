'use client';

import { MetricCards, SectionHeading } from '@/components/report';
import { cleanLabel } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';
import { ACCENT_SEQUENCE } from '@/lib/report/tokens';
import { corDaFaixa, fmt, porOrdem, type Linha } from './faixas';
import { useSelecao } from './Selecao';

const SEM_VALOR = '—';
const AGUARDANDO = 'Aguardando seleção';

/** Distribuições por atributo, com quantas categorias cada cartão mostra (as maiores). */
const DISTRIBUICOES = [
  { dimensao: 'Superfície', top: 5 },
  { dimensao: 'Jurisdição', top: 5 },
  { dimensao: 'Classificação', top: 5 },
  { dimensao: 'Velocidade', top: 6 },
];

function Barras({ titulo, itens }: { titulo: string; itens: { nome: string; valor: number; cor?: string }[] }) {
  const max = Math.max(...itens.map((i) => i.valor), 0) || 1;
  return (
    <article className="border border-graf-grid bg-white p-4">
      <h3 className="mb-3 text-[15px] font-semibold text-graf-deep">{titulo}</h3>
      <ul className="m-0 grid list-none gap-2 p-0 text-[12px] text-graf-secondary">
        {itens.map((i) => (
          <li key={i.nome}>
            <span className="flex justify-between gap-2">
              <span>{i.nome}</span>
              <span>{fmt(i.valor, 1)} km</span>
            </span>
            <span className="mt-0.5 block h-2 bg-graf-grid">
              <span className="block h-2 bg-graf-primary" style={{ width: `${(i.valor / max) * 100}%`, background: i.cor }} />
            </span>
          </li>
        ))}
        {!itens.length && <li>{SEM_VALOR}</li>}
      </ul>
    </article>
  );
}

export function IndicadoresInstalacao({ tabelas, textos, rotulos, secao }: PropsProprio) {
  const { idPorto } = useSelecao();
  const por = (nome: string): Linha[] => tabelas[nome].linhas.filter((l) => String(l.id_porto) === idPorto);
  const inst = tabelas.instalacoes.linhas.find((i) => String(i.id_porto) === idPorto);
  const nome = inst ? cleanLabel(String(inst.instalacao)) : '';
  const num = (campo: string, casas = 1) => (inst && inst[campo] !== null && inst[campo] !== undefined ? `${fmt(inst[campo], casas)} km` : SEM_VALOR);
  const detalhe = (id: string) => (inst ? textos.leituras[id]?.conteudo : AGUARDANDO);

  const rodovias = [...por('instalacao_rodovia')].sort((a, b) => Number(b.ocupacao_maxima_pct) - Number(a.ocupacao_maxima_pct));
  const dist = (dimensao: string) => por('instalacao_distribuicao').filter((l) => l.dimensao === dimensao);

  return (
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] pt-[60px]">
      <SectionHeading eyebrow={secao?.sobretitulo ?? ''} title={secao?.titulo ?? ''} />
      <p className="mt-3 mb-7 max-w-[800px] text-graf-text" aria-live="polite">
        {secao?.intro}
        {nome && <> Instalação portuária selecionada: <strong className="font-semibold text-graf-deep">{nome}</strong>.</>}
      </p>

      <MetricCards
        items={[
          {
            label: rotulos.extensao_total_km,
            value: num('extensao_total_km'),
            detail: inst ? <>{fmt(inst.links)} links. {textos.leituras['detalhe-extensao-instalacao']?.conteudo}</> : AGUARDANDO,
            accent: ACCENT_SEQUENCE[0],
          },
          {
            label: rotulos.extensao_70_km,
            value: num('extensao_70_km'),
            detail: inst ? <>{fmt(inst.participacao_70_pct, 1)}% {textos.leituras['detalhe-70-instalacao']?.conteudo}</> : AGUARDANDO,
            accent: ACCENT_SEQUENCE[1],
          },
          {
            label: rotulos.extensao_sem_vmda_km,
            value: num('extensao_sem_vmda_km'),
            detail: detalhe('detalhe-sem-vmda-instalacao'),
            accent: ACCENT_SEQUENCE[2],
          },
        ]}
      />

      {inst && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DISTRIBUICOES.map((d) => (
              <Barras
                key={d.dimensao}
                titulo={d.dimensao}
                itens={dist(d.dimensao)
                  .map((l) => ({ nome: String(l.categoria), valor: Number(l.extensao_km) }))
                  .sort((a, b) => b.valor - a.valor)
                  .slice(0, d.top)}
              />
            ))}
            <Barras
              titulo={rotulos.faixa}
              itens={[...por('instalacao_faixa')].sort(porOrdem).map((l) => ({ nome: String(l.faixa), valor: Number(l.extensao_km), cor: corDaFaixa(Number(l.ordem)) }))}
            />
          </div>

          <article className="mt-4 border border-graf-grid bg-white p-4">
            <h3 className="mb-1 text-[15px] font-semibold text-graf-deep">{rotulos.rodovia}</h3>
            <p className="mb-3 text-[12px] text-graf-text">Média ponderada pela extensão e máximo entre os links de cada rodovia.</p>
            <div className="max-h-[320px] overflow-auto">
              <table className="w-full border-collapse text-left text-[13px] text-graf-secondary">
                <thead>
                  <tr className="border-b border-graf-grid text-graf-deep">
                    <th className="py-1.5 pr-3 font-semibold">{rotulos.rodovia}</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">{rotulos.ocupacao_media_pct}</th>
                    <th className="py-1.5 text-right font-semibold">{rotulos.ocupacao_maxima_pct}</th>
                  </tr>
                </thead>
                <tbody>
                  {rodovias.map((r) => (
                    <tr key={String(r.rodovia)} className="border-b border-graf-grid last:border-b-0">
                      <td className="py-1.5 pr-3">{String(r.rodovia)}</td>
                      <td className="py-1.5 pr-3 text-right">{fmt(r.ocupacao_media_pct, 1)}%</td>
                      <td className={`py-1.5 text-right ${Number(r.ocupacao_maxima_pct) > 100 ? 'font-semibold text-graf-deep' : ''}`}>
                        {fmt(r.ocupacao_maxima_pct, 1)}%{Number(r.ocupacao_maxima_pct) > 100 ? ' ▲' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </section>
  );
}
