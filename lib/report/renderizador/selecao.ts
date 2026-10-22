import type { CartaoDistribuicao } from '@/components/report';
import { comUnidade } from '../format';
import { ACCENT_SEQUENCE, BAND_PALETTE } from '../tokens';
import { formatar } from './textos';
import type { Bloco, CampoFormatado, Dados, Linha, Tabela } from './tipos';

type Distribuicoes = Extract<Bloco, { tipo: 'distribuicoes' }>;
type TabelaBloco = Extract<Bloco, { tipo: 'tabela' }>;
type Ficha = Extract<Bloco, { tipo: 'ficha' }>;
type Indicadores = Extract<Bloco, { tipo: 'indicadores' }>;
type Rotulo = (campo: string) => string;

const SEM_VALOR = '—';
const vazio = (v: unknown) => v === null || v === undefined || v === '';

const tabela = (dados: Dados, nome: string) => {
  const t = dados.tabelas[nome];
  if (!t) throw new Error(`tabela "${nome}" não existe no data.json`);
  return t;
};

/** Valor no formato declarado, com a unidade do campo depois (fob já traz US$); vazio vira travessão. */
export function exibir(t: Tabela, c: CampoFormatado, v: unknown) {
  if (vazio(v)) return SEM_VALOR;
  const texto = formatar(v, c.formato);
  return c.formato === 'fob' ? texto : comUnidade(texto, t.campos[c.campo]?.unidade);
}

/** Por id da seleção, o valor e o complemento de cada cartão do bloco indicadores com selecao. */
export function valoresIndicadores(b: Indicadores & { selecao: string }, dados: Dados) {
  const t = tabela(dados, b.tabela);
  const comUn = (it: Indicadores['itens'][number], v: unknown) => {
    if (vazio(v)) return SEM_VALOR;
    const texto = formatar(v, it.formato);
    const u = it.mostrar_unidade ? t.campos[it.campo]?.unidade : undefined;
    return comUnidade(texto, u);
  };
  return Object.fromEntries(
    t.linhas.map((l) => [
      String(l[b.selecao]),
      b.itens.map((it) => ({ valor: comUn(it, l[it.campo]), complemento: it.complemento ? exibir(t, it.complemento, l[it.complemento.campo]) : undefined })),
    ])
  );
}

/** Cartões do bloco distribuicoes, com as linhas já ordenadas, formatadas e coloridas. */
export function dadosDistribuicoes(b: Distribuicoes, dados: Dados, rotulo: Rotulo): CartaoDistribuicao[] {
  return b.cartoes.map((c, i) => {
    const t = tabela(dados, c.tabela);
    const filtradas = t.linhas.filter((l) => Object.entries(c.filtro ?? {}).every(([k, v]) => l[k] === v));
    const ordenadas = c.ordem
      ? [...filtradas].sort((x, y) => Number(x[c.ordem!]) - Number(y[c.ordem!]))
      : [...filtradas].sort((x, y) => (Number(y[c.valor.campo]) || 0) - (Number(x[c.valor.campo]) || 0));
    // Com ordem, as categorias são faixas e ganham as cores da escala sequencial; sem ordem, a cor de destaque do cartão.
    const posicoes = c.ordem ? [...new Set(filtradas.map((l) => Number(l[c.ordem!])))].sort((x, y) => x - y) : [];
    const cor = (l: Linha) => (c.ordem ? BAND_PALETTE[posicoes.indexOf(Number(l[c.ordem])) % BAND_PALETTE.length] : ACCENT_SEQUENCE[i % ACCENT_SEQUENCE.length]);
    return {
      titulo: c.filtro ? Object.values(c.filtro).join(' · ') : rotulo(c.categoria.campo),
      top: c.top,
      linhas: ordenadas.map((l) => ({
        id: b.selecao ? String(l[b.selecao]) : undefined,
        categoria: formatar(l[c.categoria.campo], c.categoria.formato),
        valor: Number(l[c.valor.campo]) || 0,
        texto: exibir(t, c.valor, l[c.valor.campo]),
        cor: cor(l),
      })),
    };
  });
}

/** Colunas e linhas do bloco tabela, ordenadas e formatadas, com as células em destaque marcadas. */
export function dadosTabela(b: TabelaBloco, dados: Dados, rotulo: Rotulo) {
  const t = tabela(dados, b.tabela);
  const sinal = b.ordem.direcao === 'desc' ? -1 : 1;
  const numero = (c: string) => t.campos[c]?.tipo === 'numero';
  const ordenadas = [...t.linhas].sort((x, y) => {
    const a = x[b.ordem.campo], z = y[b.ordem.campo];
    return sinal * (numero(b.ordem.campo) ? (Number(a) || 0) - (Number(z) || 0) : String(a ?? '').localeCompare(String(z ?? ''), 'pt-BR'));
  });
  return {
    colunas: b.colunas.map((c) => ({ rotulo: rotulo(c.campo), numero: numero(c.campo) })),
    linhas: ordenadas.map((l) => ({
      id: b.selecao ? String(l[b.selecao]) : undefined,
      celulas: b.colunas.map((c) => exibir(t, c, l[c.campo])),
      destaque: b.colunas.map((c) => Boolean(b.destaque && c.campo === b.destaque.campo && Number(l[c.campo]) > b.destaque.acima_de)),
    })),
  };
}

/** Rótulos e, por id da seleção, o nome e os valores dos atributos do bloco ficha. */
export function dadosFicha(b: Ficha, dados: Dados, rotulo: Rotulo) {
  const t = tabela(dados, b.tabela);
  return {
    rotulos: b.campos.map(rotulo),
    linhas: Object.fromEntries(
      t.linhas.map((l) => [
        String(l[b.selecao]),
        { nome: formatar(l[b.nome.campo], b.nome.formato), valores: b.campos.map((c) => exibir(t, { campo: c, formato: t.campos[c]?.tipo === 'numero' ? 'decimal' : undefined }, l[c])) },
      ])
    ),
  };
}
