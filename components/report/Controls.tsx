'use client';

type ToggleProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

/** Botão de filtro; o ativo ganha borda escura e negrito. */
export function ToggleButton({ active, onClick, children }: ToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-2 text-[13px] text-graf-deep ${
        active ? 'border-graf-deep font-bold' : 'border-graf-border bg-white font-medium hover:border-graf-deep'
      }`}
    >
      {children}
    </button>
  );
}

type SelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
};

/** Seletor no mesmo estilo dos botões de filtro. */
export function SelectControl<T extends string>({ value, onChange, options }: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="border border-graf-border bg-white px-3 py-2 text-[13px] font-medium text-graf-deep"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
