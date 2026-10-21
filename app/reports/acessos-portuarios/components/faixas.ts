import { AREA_PALETTE } from '@/lib/report/tokens';

export type Linha = Record<string, unknown>;

/** Seis faixas de ocupação, do verde (0% a 20%) ao vermelho (acima de 100%), pela ordem do campo ordem. */
export const CORES_FAIXA = [6, 1, 3, 11, 5, 7].map((i) => AREA_PALETTE[i]);

export const corDaFaixa = (ordem: number) => CORES_FAIXA[Math.min(Math.max(ordem, 1), CORES_FAIXA.length) - 1];

const numero = (v: unknown) => (typeof v === 'number' ? v : Number(v));

/** Número em pt-BR com o máximo de casas pedido. */
export const fmt = (v: unknown, casas = 0) =>
  numero(v).toLocaleString('pt-BR', { maximumFractionDigits: casas });

/** Valor de um campo de texto da linha; vazio vira travessão. */
export const texto = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v));

/** Linhas de uma tabela agrupadas pelo id da instalação portuária. */
export function porPorto(linhas: Linha[]) {
  const m = new Map<string, Linha[]>();
  for (const l of linhas) {
    const k = String(l.id_porto);
    m.set(k, [...(m.get(k) ?? []), l]);
  }
  return m;
}

export const porOrdem = (a: Linha, b: Linha) => numero(a.ordem) - numero(b.ordem);
