type Props = {
  /** Valor em destaque à esquerda. */
  value: React.ReactNode;
  children: React.ReactNode;
};

/** Cartão com a mensagem principal do estudo, sobreposto ao fim do Hero. */
export default function KeyMessage({ value, children }: Props) {
  return (
    <div className="relative z-20 mx-auto -mt-6 w-[min(1180px,calc(100%-48px))]">
      <div className="grid gap-4 border-l-[7px] border-[#F5A855] bg-white p-6 shadow-[0_13px_34px_rgba(0,30,29,0.12)] md:grid-cols-[80px_1fr] md:gap-[18px] md:px-7 md:py-6">
        <div className="text-[38px] leading-none font-semibold text-[#F5A855]">{value}</div>
        <p className="m-0 text-[#54595F]">{children}</p>
      </div>
    </div>
  );
}
