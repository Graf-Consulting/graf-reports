type Props = {
  title?: string;
  description?: string;
  /** Barra de controles acima do gráfico (botões e seletores). */
  controls?: React.ReactNode;
  children: React.ReactNode;
};

/** Moldura branca com borda para um gráfico, com título e controles opcionais. */
export default function ChartCard({ title, description, controls, children }: Props) {
  return (
    <article className="border border-graf-grid bg-white p-4 md:p-6">
      {title && <h3 className="mb-1 text-[19px] font-semibold text-graf-deep">{title}</h3>}
      {description && <p className="mb-3 text-[13px] text-graf-text">{description}</p>}
      {controls && <div className="mb-4 flex flex-wrap gap-2">{controls}</div>}
      {children}
    </article>
  );
}
