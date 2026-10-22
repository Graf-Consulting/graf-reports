'use client';

import ReportSection from './ReportSection';
import { useSelecao } from './Selecao';

type Props = {
  /** Rótulos dos atributos, na ordem. */
  rotulos: string[];
  /** Por id, o nome exibido e os valores dos atributos, na ordem dos rótulos. */
  linhas: Record<string, { nome: string; valores: string[] }>;
  /** Campo da seleção compartilhada (ADR-007). */
  selecao: string;
  /** Com o cabeçalho da seção, a ficha o desenha e acrescenta o nome escolhido ao título. */
  secao?: { sobretitulo?: string; titulo?: string; intro?: string };
};

const AGUARDANDO = 'Selecione um item para ver os dados.';

/** Atributos da linha escolhida na seleção da página, em duas colunas. */
export default function Ficha({ rotulos, linhas, selecao, secao }: Props) {
  const [id] = useSelecao(selecao);
  const linha = linhas[id];
  const conteudo = linha ? (
    <table className="w-full border-collapse bg-white text-left text-[14px] text-graf-secondary">
      <tbody>
        {rotulos.map((r, i) => (
          <tr key={r} className="border-b border-graf-grid last:border-b-0">
            <th scope="row" className="w-[34%] py-2 pr-4 pl-3 align-top font-semibold text-graf-deep">
              {r}
            </th>
            <td className="py-2 pr-3 break-words">{linha.valores[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="m-0 border border-graf-grid bg-white p-4 text-graf-secondary">{AGUARDANDO}</p>
  );
  if (!secao) return conteudo;
  const titulo = linha && secao.titulo ? `${secao.titulo}: ${linha.nome}` : (secao.titulo ?? '');
  return (
    <ReportSection eyebrow={secao.sobretitulo ?? ''} title={titulo} intro={secao.intro ?? ''}>
      {conteudo}
    </ReportSection>
  );
}
