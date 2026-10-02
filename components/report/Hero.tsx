type MetaItem = { label: string; value: React.ReactNode };

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Linha de metadados abaixo do subtítulo (base, período, recorte). */
  meta?: MetaItem[];
};

/** Faixa de abertura do report, em fundo escuro. */
export default function Hero({ eyebrow, title, subtitle, meta = [] }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#001E1D] text-white">
      <div
        aria-hidden="true"
        className="absolute -top-[150px] -right-[120px] h-[480px] w-[480px] rounded-full border-[72px] border-[#6EC1E4]/20"
      />
      <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] py-[52px] md:py-[72px] md:pb-16">
        <div className="mb-4 text-xs font-medium tracking-[0.14em] text-[#6EC1E4] uppercase">{eyebrow}</div>
        <h1 className="max-w-[900px] text-[clamp(33px,5vw,58px)] leading-[1.04] font-semibold tracking-[-0.04em] text-white">
          {title}
        </h1>
        <p className="mt-6 max-w-[760px] text-base leading-relaxed text-[#d7e8e7] md:text-[19px]">{subtitle}</p>
        {meta.length > 0 && (
          <div className="mt-[30px] flex flex-wrap gap-x-[26px] gap-y-3 text-[13px] text-[#b8d1d0]">
            {meta.map((m) => (
              <span key={m.label}>
                <strong className="font-semibold text-white">{m.label}:</strong> {m.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
