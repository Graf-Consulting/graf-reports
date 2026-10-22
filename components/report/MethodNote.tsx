import SectionHeading from './SectionHeading';

type Props = {
  eyebrow: string;
  title: string;
  /** Texto principal da nota. */
  children: React.ReactNode;
  /** Ressalvas listadas abaixo do texto. */
  caveats?: React.ReactNode[];
  /** Opcional. Ressalvas com marcador e espaço entre os itens; por padrão, sem marcador. */
  marcadores?: boolean;
};

/** Nota metodológica em fundo cinza: título à esquerda, texto e ressalvas à direita. */
export default function MethodNote({ eyebrow, title, children, caveats = [], marcadores = false }: Props) {
  return (
    <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
      <div className="grid gap-7 bg-graf-surface p-[34px] md:grid-cols-2">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </div>
        <div className="text-graf-secondary">
          <p className="m-0">{children}</p>
          {caveats.length > 0 && (
            <ul className={`mt-3 mb-0 pl-[19px] ${marcadores ? 'list-disc [&>li+li]:mt-2.5' : ''}`}>
              {caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
