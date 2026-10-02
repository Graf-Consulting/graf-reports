import SectionHeading from './SectionHeading';

type Props = {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
};

/** Seção padrão do report: rótulo, título, introdução e conteúdo. */
export default function ReportSection({ eyebrow, title, intro, children }: Props) {
  return (
    <section className="mx-auto pt-[60px] w-[min(1180px,calc(100%-48px))]">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <p className="mt-3 mb-7 max-w-[800px] text-[#7A7A7A]">{intro}</p>
      {children}
    </section>
  );
}
