type Props = {
  eyebrow: string;
  title: string;
};

/** Rótulo verde em caixa alta seguido do título da seção. */
export default function SectionHeading({ eyebrow, title }: Props) {
  return (
    <>
      <div className="mb-2 text-[11px] font-medium tracking-[0.14em] text-graf-accent uppercase">{eyebrow}</div>
      <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.15] font-semibold tracking-[-0.03em] text-graf-deep">
        {title}
      </h2>
    </>
  );
}
