'use client';

import { useSelecao } from './Selecao';

export type LinhaDistribuicao = { id?: string; categoria: string; valor: number; texto: string; cor: string };
export type CartaoDistribuicao = {
  titulo: string;
  /** Linhas já na ordem de exibição (maiores primeiro, ou a ordem das faixas). */
  linhas: LinhaDistribuicao[];
  top: number;
};

type Props = {
  cartoes: CartaoDistribuicao[];
  /** Campo da seleção compartilhada; com ele, cada cartão mostra só as linhas do id escolhido. */
  selecao?: string;
};

const SEM_DADOS = 'Sem dados para esta seleção.';

/** Grade de cartões com barras horizontais da distribuição de um valor por categoria. */
export default function Distribuicoes({ cartoes, selecao }: Props) {
  const [id] = useSelecao(selecao ?? '');
  if (selecao && !id) return null;
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cartoes.map((c) => {
        const linhas = (selecao ? c.linhas.filter((l) => l.id === id) : c.linhas).slice(0, c.top);
        const maior = Math.max(1, ...linhas.map((l) => l.valor));
        return (
          <article key={c.titulo} className="border border-graf-grid bg-white p-4">
            <h3 className="mb-3 text-[15px] font-semibold text-graf-deep">{c.titulo}</h3>
            {linhas.length ? (
              <ul className="m-0 grid list-none gap-2 p-0 text-[12px] text-graf-secondary">
                {linhas.map((l) => (
                  <li key={l.categoria}>
                    <span className="flex justify-between gap-2">
                      <span className="truncate" title={l.categoria}>
                        {l.categoria}
                      </span>
                      <b className="font-semibold whitespace-nowrap text-graf-deep">{l.texto}</b>
                    </span>
                    <span className="mt-0.5 block h-2 bg-graf-grid">
                      <span className="block h-2" style={{ width: `${(100 * l.valor) / maior}%`, background: l.cor }} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[12px] text-graf-text">{SEM_DADOS}</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
