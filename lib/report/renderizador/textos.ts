import { cleanLabel, compact, fob, inteiro } from '../format';
import type { Dados, Formato, Linha, Texto, ValorRef } from './tipos';

/** Exibe um valor no formato declarado na composição ou na metodologia. */
export function formatar(valor: unknown, formato: Formato = 'texto'): string {
  if (formato === 'compact') return compact(Number(valor));
  if (formato === 'inteiro') return inteiro(Number(valor));
  if (formato === 'fob') return fob(Number(valor));
  if (formato === 'cleanLabel') return cleanLabel(String(valor ?? ''));
  return String(valor ?? '');
}

/** A única linha que o filtro seleciona; sem filtro, a tabela precisa ter uma linha só. */
function linhaUnica(dados: Dados, ref: Pick<ValorRef, 'tabela' | 'filtro'>, origem: string): Linha {
  const tabela = dados.tabelas[ref.tabela];
  if (!tabela) throw new Error(`${origem}: tabela "${ref.tabela}" não existe no data.json`);
  const linhas = tabela.linhas.filter((l) => Object.entries(ref.filtro ?? {}).every(([k, v]) => l[k] === v));
  if (linhas.length !== 1) throw new Error(`${origem}: o filtro seleciona ${linhas.length} linhas em "${ref.tabela}"; deve selecionar 1`);
  return linhas[0];
}

/** Valor de um campo numa tabela de uma linha. */
export function valorUnico(dados: Dados, tabela: string, campo: string, origem: string): unknown {
  return linhaUnica(dados, { tabela }, origem)[campo];
}

export type Parte = { texto: string; formato?: Formato; marcador?: boolean; negrito?: boolean };

/**
 * Trechos do texto da metodologia, com cada marcador {id} preenchido.
 * Trechos entre **asteriscos duplos** vêm com negrito: true; é a única marcação aceita nos textos.
 */
export function partes(item: Texto, dados: Dados): Parte[] {
  return item.texto.split('**').flatMap((pedaco, i) =>
    pedaco.split(/(\{[a-z][a-z0-9_]*\})/).filter(Boolean).map((trecho): Parte => {
      const negrito = i % 2 === 1;
      const m = trecho.match(/^\{([a-z][a-z0-9_]*)\}$/);
      if (!m) return { texto: trecho, negrito };
      const ref = item.valores?.find((v) => v.id === m[1]);
      if (!ref) throw new Error(`"${item.id}": marcador {${m[1]}} sem item em valores`);
      return { texto: formatar(linhaUnica(dados, ref, `"${item.id}"`)[ref.campo], ref.formato), formato: ref.formato, marcador: true, negrito };
    })
  );
}

/** Texto da metodologia com cada marcador {id} preenchido pelo valor do data.json, sem marcação de negrito. */
export function preencher(item: Texto, dados: Dados): string {
  return partes(item, dados).map((p) => p.texto).join('');
}

const MOEDAS = ['US$', 'R$', '€', '£'];

/** Título de eixo com a unidade entre parênteses, por exemplo "Valor FOB (US$)". */
export function tituloEixo(rotulo: string, unidade?: string) {
  return unidade ? `${rotulo} (${unidade})` : rotulo;
}

/** Trecho de hovertemplate do Plotly com a unidade antes (moeda) ou depois do valor. */
export function valorHover(variavel: string, unidade?: string) {
  const v = `%{${variavel}:,.0f}`;
  if (!unidade) return v;
  return MOEDAS.includes(unidade) ? `${unidade} ${v}` : `${v} ${unidade}`;
}
