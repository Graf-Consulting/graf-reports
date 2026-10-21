'use client';

import type { PropsProprio } from '@/lib/report/renderizador';

type Props = PropsProprio & { itens: { leitura: string; abertura: string }[] };

/** Lista de tópicos, cada um com a abertura em negrito e o texto de uma leitura da metodologia. */
export function TopicosSobreAnalise({ textos, itens }: Props) {
  return (
    <ul className="mb-8 grid list-none gap-3 p-0 text-graf-secondary">
      {itens.map((it) => (
        <li key={it.leitura}>
          <strong className="font-semibold text-graf-deep">{it.abertura}.</strong> {textos.leituras[it.leitura]?.conteudo}
        </li>
      ))}
    </ul>
  );
}
