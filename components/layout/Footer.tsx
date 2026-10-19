type Props = {
  /** Fonte dos dados do estudo, por exemplo "Comex Stat". */
  fonte?: string;
  /** Data da elaboração analítica, já formatada, por exemplo "10 set. 2026". */
  elaboracao?: string;
};

/** Rodapé do site. Em páginas de estudo, mostra a fonte e a data dos dados daquele estudo. */
export default function Footer({ fonte, elaboracao }: Props) {
  const creditos = [fonte && `Fonte: ${fonte}`, elaboracao && `Elaboração analítica: ${elaboracao}`].filter(Boolean).join(' · ');
  return (
    <footer className="mt-[60px] bg-graf-dark py-[30px] text-[13px] text-graf-footer-text">
      <div className="mx-auto flex w-[min(1180px,calc(100%-48px))] flex-col justify-between gap-4 md:flex-row">
        <div>
          <strong className="font-semibold text-white">GRAF Infra Consulting</strong> · Inteligência em
          Consultoria e Engenharia
        </div>
        {creditos && <div>{creditos}</div>}
      </div>
    </footer>
  );
}
