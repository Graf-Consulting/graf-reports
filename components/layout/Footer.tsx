export default function Footer() {
  return (
    <footer className="mt-[60px] bg-[#0D0E0E] py-[30px] text-[13px] text-[#d6dfdf]">
      <div className="mx-auto flex w-[min(1180px,calc(100%-48px))] flex-col justify-between gap-4 md:flex-row">
        <div>
          <strong className="font-semibold text-white">GRAF Infra Consulting</strong> · Inteligência em
          Consultoria e Engenharia
        </div>
        <div>Fonte: Comex Stat · Elaboração analítica: 10 set. 2026</div>
      </div>
    </footer>
  );
}