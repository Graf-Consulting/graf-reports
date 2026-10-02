export default function Header() {
  return (
    <>
      <div className="h-2 bg-[#61CE70]" />
      <header className="border-b border-[#e3e8e8] bg-white">
        <div className="mx-auto flex min-h-[78px] w-[min(1180px,calc(100%-48px))] items-center justify-between gap-6 md:min-h-[92px]">
          <a
            href="https://grafconsulting.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GRAF Infra Consulting"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://grafconsulting.com.br/wp-content/uploads/2024/07/graf-infra-consulting.svg"
              alt="GRAF Infra Consulting"
              className="block h-[50px] w-full max-w-[190px] object-contain object-left md:h-[58px] md:max-w-[240px]"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/graf-infra-consulting/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Acessar a página da GRAF Infra Consulting no LinkedIn"
            className="inline-flex items-center gap-2.5 border border-[#6EC1E4] px-3.5 py-2.5 text-xs font-medium tracking-wide text-[#001E1D] transition-colors hover:bg-[#6EC1E4] hover:text-white"
          >
            <span
              aria-hidden="true"
              className="grid h-[19px] w-[19px] place-items-center rounded-[2px] bg-[#0A66C2] text-[13px] font-bold leading-none text-white"
            >
              in
            </span>
            <span className="hidden sm:inline">Acompanhe a GRAF no LinkedIn</span>
          </a>
        </div>
      </header>
    </>
  );
}