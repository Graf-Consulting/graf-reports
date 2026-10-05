type Props = {
  /** Abertura em negrito, por exemplo "Leitura prioritária." */
  title: string;
  children: React.ReactNode;
};

/** Caixa de destaque com borda verde, usada para a leitura principal de uma seção. */
export default function Callout({ title, children }: Props) {
  return (
    <div className="mt-5 border-l-4 border-[#61CE70] bg-[#f2fbf3] p-5 text-[#54595F] md:p-6">
      <strong className="font-semibold text-[#001E1D]">{title}</strong> {children}
    </div>
  );
}

/** Trecho em negrito dentro de um Callout. */
export function Emphasis({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-[#001E1D]">{children}</strong>;
}
