'use client';

import { SectionHeading } from '@/components/report';
import { cleanLabel } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';
import { texto } from './faixas';
import { useSelecao } from './Selecao';

const SEM_SELECAO = 'Selecione uma instalação portuária para ver os dados cadastrais.';

export function CadastroInstalacao({ tabelas, rotulos, secao }: PropsProprio) {
  const { idPorto } = useSelecao();
  const inst = tabelas.instalacoes.linhas.find((i) => String(i.id_porto) === idPorto);
  // Atributos cadastrais: de codigo em diante, na ordem da tabela, com nome em rotulos.
  const nomes = Object.keys(tabelas.instalacoes.campos);
  const campos = nomes.slice(nomes.indexOf('codigo')).filter((c) => rotulos[c]);
  const titulo = inst ? `${secao?.titulo ?? ''}: ${cleanLabel(String(inst.instalacao))}` : (secao?.titulo ?? '');

  return (
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] pt-[60px]">
      <SectionHeading eyebrow={secao?.sobretitulo ?? ''} title={titulo} />
      <p className="mt-3 mb-7 max-w-[800px] text-graf-text">{secao?.intro}</p>
      {inst ? (
        <table className="w-full border-collapse bg-white text-left text-[14px] text-graf-secondary">
          <tbody>
            {campos.map((c) => (
              <tr key={c} className="border-b border-graf-grid">
                <th scope="row" className="w-[34%] py-2 pr-4 pl-3 align-top font-semibold text-graf-deep">{rotulos[c]}</th>
                <td className="py-2 pr-3 break-words">{texto(inst[c])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="m-0 border border-graf-grid bg-white p-4 text-graf-secondary">{SEM_SELECAO}</p>
      )}
    </section>
  );
}
