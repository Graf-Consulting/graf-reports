import type { CamadaTrechos, LatLon, PontoRosca, Trecho } from '@/components/maps';
import { comUnidade, decimal, inteiro } from '../format';
import { AREA_PALETTE, BAND_PALETTE, MAP_LAYER_PALETTE } from '../tokens';
import { formatar, tituloEixo } from './textos';
import type { Bloco, Campo, Dados, Espessura, Linha } from './tipos';

type Roscas = Extract<Bloco, { tipo: 'mapa_roscas' }>;
type Trechos = Extract<Bloco, { tipo: 'mapa_trechos' }>;
type Rotulo = (campo: string) => string;

/** Quantos degraus de espessura a legenda mostra quando a camada usa passo. */
const DEGRAUS = 6;
/** Espessura máxima de uma linha, em px. */
const LARGURA_MAXIMA = 16;

const tabela = (dados: Dados, nome: string) => {
  const t = dados.tabelas[nome];
  if (!t) throw new Error(`tabela "${nome}" não existe no data.json`);
  return t;
};
const vazio = (v: unknown) => v === null || v === undefined || v === '';
const ehPonto = (v: unknown): v is LatLon => Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'number');

/** Pontos, filtros, legenda e rótulos do bloco mapa_roscas, com os números já formatados. */
export function dadosRoscas(b: Roscas, dados: Dados, rotulo: Rotulo, rotulos: Record<string, string>) {
  const T = tabela(dados, b.tabela), F = tabela(dados, b.fatias.tabela);
  const un = (campos: Record<string, Campo>, c: string) => campos[c]?.unidade;

  const categorias = [...new Map(F.linhas.map((l) => [String(l[b.fatias.categoria]), Number(l[b.fatias.ordem])])).entries()].sort((x, y) => x[1] - y[1]).map(([c]) => c);
  const paleta = categorias.length <= BAND_PALETTE.length ? BAND_PALETTE : AREA_PALETTE;
  const cor = (c: string) => paleta[categorias.indexOf(c) % paleta.length];

  const porId = new Map<string, Linha[]>();
  for (const l of F.linhas) porId.set(String(l[b.id]), [...(porId.get(String(l[b.id])) ?? []), l]);

  const ordenar = (x: Linha, y: Linha) => {
    for (const c of b.ordem) {
      const d = (Number(y[c]) || 0) - (Number(x[c]) || 0);
      if (d) return d;
    }
    return 0;
  };

  const pontos: PontoRosca[] = T.linhas
    .filter((l) => ehPonto(l[b.ponto]))
    .sort(ordenar)
    .map((l) => ({
      id: String(l[b.id]),
      rotulo: formatar(l[b.rotulo.campo], b.rotulo.formato),
      ponto: l[b.ponto] as LatLon,
      tamanho: Number(l[b.tamanho.campo]) || 0,
      tamanhoTexto: comUnidade(formatar(l[b.tamanho.campo], b.tamanho.formato), un(T.campos, b.tamanho.campo)),
      filtros: Object.fromEntries((b.filtros ?? []).map((f) => [f, vazio(l[f]) ? '' : String(l[f])])),
      fatias: [...(porId.get(String(l[b.id])) ?? [])]
        .sort((x, y) => Number(x[b.fatias.ordem]) - Number(y[b.fatias.ordem]))
        .map((f) => ({
          categoria: String(f[b.fatias.categoria]),
          cor: cor(String(f[b.fatias.categoria])),
          valor: Number(f[b.fatias.valor.campo]) || 0,
          valorTexto: comUnidade(formatar(f[b.fatias.valor.campo], b.fatias.valor.formato), un(F.campos, b.fatias.valor.campo)),
          parcelaTexto: b.fatias.parcela ? comUnidade(decimal(Number(f[b.fatias.parcela]), 1), un(F.campos, b.fatias.parcela)) : undefined,
        })),
    }));

  return {
    pontos,
    filtros: (b.filtros ?? []).map((f) => ({ campo: f, rotulo: rotulo(f) })),
    legenda: categorias.map((c) => ({ categoria: c, cor: cor(c) })),
    rotulos: {
      categoria: rotulo(b.fatias.categoria),
      valor: rotulo(b.fatias.valor.campo),
      parcela: b.fatias.parcela ? rotulo(b.fatias.parcela) : undefined,
      total: rotulo(b.tamanho.campo),
      contagem: rotulos[b.tabela],
    },
  };
}

/** Largura e texto de um trecho numa camada; null quando o trecho não tem valor nela. */
function valorCamada(l: Linha, campo: string, esp: Espessura, unidade?: string) {
  const v = l[campo];
  if (vazio(v)) return null;
  if ('passo' in esp) {
    const n = Number(v);
    return { largura: Math.min(LARGURA_MAXIMA, 2 + Math.ceil(Math.max(0, n - esp.passo) / esp.passo)), texto: comUnidade(inteiro(n), unidade) };
  }
  const classe = String(l[esp.classe] ?? '');
  const i = esp.classes.indexOf(classe);
  return { largura: 2 + Math.max(0, i), texto: `${classe || '—'} (${comUnidade(decimal(Number(v), 1), unidade)})` };
}

function legenda(esp: Espessura) {
  if (!('passo' in esp)) return esp.classes.map((c, i) => ({ texto: c, largura: 2 + i }));
  const p = esp.passo;
  return [
    ...Array.from({ length: DEGRAUS }, (_, i) => ({ texto: i === 0 ? `até ${inteiro(p)}` : `${inteiro(i * p + 1)} a ${inteiro((i + 1) * p)}`, largura: 2 + i })),
    { texto: `acima de ${inteiro(DEGRAUS * p)}`, largura: 2 + DEGRAUS },
  ];
}

/** Valor de um campo na caixa de detalhe do trecho. */
function valorDetalhe(def: Campo | undefined, v: unknown) {
  if (vazio(v)) return '—';
  if (def?.tipo === 'numero') return comUnidade(decimal(Number(v), 2), def.unidade);
  return String(v);
}

/** Pontos do seletor, camadas e trechos do bloco mapa_trechos, com larguras e textos já calculados. */
export function dadosTrechos(b: Trechos, dados: Dados, rotulo: Rotulo, rotulos: Record<string, string>) {
  const P = tabela(dados, b.pontos.tabela), T = tabela(dados, b.tabela);

  const pontos = P.linhas
    .map((l) => ({ id: String(l[b.pontos.id]), rotulo: formatar(l[b.pontos.rotulo.campo], b.pontos.rotulo.formato), ponto: ehPonto(l[b.pontos.ponto]) ? (l[b.pontos.ponto] as LatLon) : null }))
    .sort((x, y) => x.rotulo.localeCompare(y.rotulo, 'pt-BR'));

  const camadas: CamadaTrechos[] = b.camadas.map((c, i) => ({
    rotulo: rotulo(c.campo),
    titulo: tituloEixo(rotulo(c.campo), T.campos[c.campo]?.unidade),
    cor: MAP_LAYER_PALETTE[i % MAP_LAYER_PALETTE.length],
    legenda: legenda(c.espessura),
  }));

  const trechos: Trecho[] = T.linhas
    .filter((l) => Array.isArray(l[b.linhas]))
    .map((l) => ({
      chave: String(l[b.chave]),
      linhas: l[b.linhas] as LatLon[][],
      nome: `${rotulo(b.nome)}: ${vazio(l[b.nome]) ? '—' : String(l[b.nome])}`,
      camadas: b.camadas.map((c) => valorCamada(l, c.campo, c.espessura, T.campos[c.campo]?.unidade)),
      detalhe: b.detalhe.map((d) => valorDetalhe(T.campos[d], l[d])),
    }));

  return {
    pontos,
    rotuloSeletor: rotulo(b.pontos.rotulo.campo),
    rotuloPonto: rotulos[b.pontos.ponto] ?? rotulo(b.pontos.rotulo.campo),
    camadas,
    trechos,
    detalhe: b.detalhe.map(rotulo),
  };
}
