/** Número compacto em pt-BR (ex.: 1,1 bi). */
export function compact(v: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v || 0);
}

/** Valor em dólares no formato compacto (ex.: US$ 1,1 bi). */
export const fob = (v: number) => `US$ ${compact(v)}`;
