import type { ReactNode } from 'react';

type Props = {
  /** Um tópico por item: abertura em negrito e o texto. */
  items: { titulo?: string; conteudo: ReactNode }[];
};

/** Lista de tópicos curtos, cada um com a abertura em negrito. */
export default function Topicos({ items }: Props) {
  return (
    <ul className="mb-7 grid max-w-[900px] gap-3 text-graf-secondary">
      {items.map((t, i) => (
        <li key={i}>
          {t.titulo && <strong className="font-semibold text-graf-deep">{/[.!?:]$/.test(t.titulo) ? t.titulo : `${t.titulo}.`} </strong>}
          {t.conteudo}
        </li>
      ))}
    </ul>
  );
}
