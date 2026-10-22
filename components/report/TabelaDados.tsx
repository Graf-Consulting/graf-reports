'use client';

import { BAND_PALETTE } from '@/lib/report/tokens';
import { useSelecao } from './Selecao';

type Props = {
  titulo?: string;
  descricao?: string;
  colunas: { rotulo: string; numero: boolean }[];
  /** Linhas já ordenadas; destaque marca as células acima do limite declarado. */
  linhas: { id?: string; celulas: string[]; destaque: boolean[] }[];
  /** Campo da seleção compartilhada; com ele, a tabela mostra só as linhas do id escolhido. */
  selecao?: string;
};

const AGUARDANDO = 'Aguardando seleção.';
const SEM_DADOS = 'Sem dados para esta seleção.';
/** Cor das células em destaque: a faixa mais alta da escala sequencial. */
const COR_DESTAQUE = BAND_PALETTE[BAND_PALETTE.length - 1];

/** Tabela simples com rolagem interna quando é longa; células acima do limite saem em destaque. */
export default function TabelaDados({ titulo, descricao, colunas, linhas, selecao }: Props) {
  const [id] = useSelecao(selecao ?? '');
  const visiveis = selecao ? linhas.filter((l) => l.id === id) : linhas;
  const vazio = selecao && !id ? AGUARDANDO : !visiveis.length ? SEM_DADOS : '';
  return (
    <article className="mt-6 border border-graf-grid bg-white p-4">
      {titulo && <h3 className="mb-1 text-[15px] font-semibold text-graf-deep">{titulo}</h3>}
      {descricao && <p className="mb-3 text-[12px] text-graf-text">{descricao}</p>}
      {vazio ? (
        <p className="m-0 text-[13px] text-graf-text">{vazio}</p>
      ) : (
        <div className="max-h-90 overflow-auto">
          <table className="w-full border-collapse text-[13px] text-graf-secondary">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-graf-grid text-graf-deep">
                {colunas.map((c) => (
                  <th key={c.rotulo} scope="col" className={`py-1.5 pr-3 font-semibold last:pr-0 ${c.numero ? 'text-right' : 'text-left'}`}>
                    {c.rotulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l, i) => (
                <tr key={i} className="border-b border-graf-grid last:border-b-0">
                  {l.celulas.map((v, j) => (
                    <td
                      key={j}
                      className={`py-1.5 pr-3 last:pr-0 ${colunas[j].numero ? 'text-right' : 'text-left'} ${l.destaque[j] ? 'font-semibold' : ''}`}
                      style={l.destaque[j] ? { color: COR_DESTAQUE } : undefined}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
