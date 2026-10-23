import type { PropsProprio } from '@/lib/report/renderizador';

/** Abertura de cada tópico: a primeira frase do texto, em negrito. */
function abertura(texto: string) {
  const fim = texto.search(/\.(\s|$)/);
  return fim < 0 ? [texto, ''] : [texto.slice(0, fim + 1), texto.slice(fim + 1)];
}

/** Lista de tópicos com as leituras da seção, na ordem em que o bloco as declara. */
export function TopicosLeituras({ textos }: PropsProprio) {
  return (
    <ul className="mb-8 list-disc space-y-3 pl-5 text-graf-secondary">
      {Object.entries(textos.leituras).map(([id, leitura]) => {
        const [inicio, resto] = abertura(leitura.texto);
        return (
          <li key={id}>
            <strong className="font-semibold text-graf-deep">{inicio}</strong>
            {resto}
          </li>
        );
      })}
    </ul>
  );
}
