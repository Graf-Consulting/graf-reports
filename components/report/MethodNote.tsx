import SectionHeading from './SectionHeading';

type Props = {
  eyebrow: string;
  title: string;
  /** Texto principal da nota. */
  children: React.ReactNode;
  /** Ressalvas listadas abaixo do texto. */
  caveats?: string[];
};

/** Nota metodológica em fundo cinza: título à esquerda, texto e ressalvas à direita. */
export default function MethodNote({ eyebrow, title, children, caveats = [] }: Props) {
  return (
    <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
      <div className="grid gap-7 bg-[#f3f6f6] p-[34px] md:grid-cols-2">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </div>
        <div className="text-[#54595F]">
          <p className="m-0">{children}</p>
          {caveats.length > 0 && (
            <ul className="mt-3 mb-0 pl-[19px]">
              {caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
