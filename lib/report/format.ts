/** Número compacto em pt-BR (ex.: 1,1 bi). */
export function compact(v: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v || 0);
}

/** Valor em dólares no formato compacto (ex.: US$ 1,1 bi). */
export const fob = (v: number) => `US$ ${compact(v)}`;

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Data AAAA-MM-DD no formato curto em pt-BR (ex.: 2026-09-10 → 10 set. 2026). */
export function dataCurta(iso: string) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]}. ${ano}`;
}

/**
 * Rótulo sem o código numérico do início (ex.: "0927800 - ITAJAI" → "ITAJAI").
 * Vazio vira "Não informado". Fallback para dados que não chegam limpos no data.json.
 */
export const cleanLabel = (v: string) => String(v || 'Não informado').replace(/^\s*\d+\s*-\s*/, '');
