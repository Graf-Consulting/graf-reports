/** Paleta GRAF compartilhada pelos reports. Única fonte de cor do site (docs/guidelines/). */
export const COLORS = {
  primary: '#6EC1E4',
  secondary: '#54595F',
  text: '#7A7A7A',
  accent: '#61CE70',
  white: '#FFFFFF',
  orange: '#F5A855',
  deep: '#001E1D',
  dark: '#0D0E0E',
  grid: '#e3e8e8',
  /** Borda dos controles (botões e seletores). */
  border: '#cfd8d9',
  /** Fundo da nota metodológica. */
  surface: '#f3f6f6',
  /** Fundo da caixa de destaque. */
  accentSurface: '#f2fbf3',
  /** Texto sobre fundo escuro: subtítulo do topo. */
  onDark: '#d7e8e7',
  /** Texto secundário sobre fundo escuro: metadados do topo. */
  onDarkMuted: '#b8d1d0',
  /** Texto do rodapé. */
  footerText: '#d6dfdf',
  /** Cor da marca LinkedIn, no botão do cabeçalho. */
  linkedin: '#0A66C2',
  /** Sombra do cartão da mensagem-chave (deep a 12%). */
  shadow: 'rgba(0,30,29,0.12)',
};

/** Cores de destaque usadas em sequência pelos blocos (cartões de indicador, rankings). */
export const ACCENT_SEQUENCE = [COLORS.primary, COLORS.accent, COLORS.orange, COLORS.secondary];

/** Cores das séries em gráficos de área empilhada. */
export const AREA_PALETTE = [
  '#1B998B', '#FFD166', '#2D6A4F', '#FF9F1C', '#0077B6', '#E63946',
  '#52B788', '#D62828', '#023E8A', '#48CAE4', '#9D4EDD', '#F77F00',
];

/** Faixas em escala sequencial, da menor para a maior (ex.: faixas de ocupação nos mapas). */
export const BAND_PALETTE = ['#6EC1E4', '#52B788', '#FFD166', '#FF9F1C', '#E63946', '#8B1E24'];

/** Cores das camadas de linhas nos mapas, na ordem das camadas declarada na composição. */
export const MAP_LAYER_PALETTE = ['#E63946', '#2D6A4F', '#0077B6', '#9D4EDD', '#F77F00'];

/** Cores dos nós de cada camada do Sankey, da esquerda para a direita. */
export const SANKEY_NODE_PALETTES = [
  ['#d9edf6', '#c9e7d0', '#f8dfc5', '#e2d6eb', '#d8e5e4', '#f1d7d3'],
  ['#001E1D', '#17606A', '#3A7B80', '#456A7A', '#54595F', '#346B77'],
  ['#F5A855', '#dc8c4f', '#d66d52', '#e4a441', '#c75f50', '#d98355'],
];

/** Cor das ligações que saem de cada camada do Sankey. */
export const SANKEY_LINK_COLORS = ['rgba(110,193,228,.38)', 'rgba(245,168,85,.38)'];

/** Contorno dos nós do Sankey (deep a 24%). */
export const SANKEY_NODE_LINE = 'rgba(0,30,29,.24)';

/**
 * Cores como variáveis CSS (--graf-<nome>), publicadas em app/layout.tsx.
 * O globals.css as registra no tema do Tailwind, para os componentes usarem classes como bg-graf-deep.
 */
export const CSS_VARS = Object.fromEntries(
  Object.entries(COLORS).map(([nome, valor]) => [`--graf-${nome.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`)}`, valor])
);
