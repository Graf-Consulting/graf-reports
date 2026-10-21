'use client';

import { compact } from '@/lib/report/format';
import type { PropsProprio } from '@/lib/report/renderizador';

type Props = PropsProprio & { valor: string };

/** Mensagem-chave com o número grande e a conclusão ao lado; o kit só aceita uma leitura, e aqui o texto é uma conclusão. */
export function MensagemChaveConclusao({ linhas, tabelas, textos, valor }: Props) {
  const numero = linhas?.[0]?.[valor];
  const unidade = tabelas.resumo?.campos[valor]?.unidade;
  const conclusao = Object.values(textos.conclusoes)[0];
  return (
    <div className="relative z-20 mx-auto -mt-6 w-[min(1180px,calc(100%-48px))]">
      <div className="grid gap-4 border-l-[7px] border-graf-orange bg-white p-6 shadow-[0_13px_34px_var(--graf-shadow)] md:grid-cols-[auto_1fr] md:items-center md:gap-[18px] md:px-7 md:py-6">
        <div className="text-[38px] leading-none font-semibold text-graf-orange">
          {compact(Number(numero))}
          {unidade && <span className="ml-1.5 text-[18px]">{unidade}</span>}
        </div>
        <p className="m-0 text-graf-secondary">{conclusao?.conteudo}</p>
      </div>
    </div>
  );
}
