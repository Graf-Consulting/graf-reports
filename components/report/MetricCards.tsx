export type Metric = {
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  /** Cor da borda superior do cartão. */
  accent: string;
};

/** Grade de cartões de indicadores (até 4 por linha). */
export default function MetricCards({ items }: { items: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((m) => (
        <div
          key={m.label}
          className="min-h-[154px] border-t-4 bg-white p-[22px]"
          style={{ borderTopColor: m.accent }}
        >
          <div className="text-[11px] font-medium tracking-[0.08em] text-[#7A7A7A] uppercase">{m.label}</div>
          <div className="mt-3 mb-1.5 text-[28px] leading-none font-semibold tracking-[-0.04em] text-[#001E1D]">
            {m.value}
          </div>
          <div className="text-[13px] text-[#54595F]">{m.detail}</div>
        </div>
      ))}
    </div>
  );
}
