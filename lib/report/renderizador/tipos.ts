import type { ReactNode } from 'react';

/** Tipos das entradas do estudo e da composição. Espelham os schemas de lib/report/schemas/. */

export type Formato = 'texto' | 'compact' | 'fob' | 'cleanLabel';
export type Linha = Record<string, unknown>;

export type Campo = { tipo: string; descricao: string; unidade?: string; nulo?: boolean };
export type Tabela = { descricao: string; chave?: string[]; campos: Record<string, Campo>; linhas: Linha[] };
export type Dados = {
  metadata: {
    data_referencia: string;
    periodo?: { inicio: string; fim: string };
    fontes: { nome: string; referencia: string }[];
  };
  tabelas: Record<string, Tabela>;
};

export type ValorRef = { id: string; tabela: string; campo: string; filtro?: Record<string, string | number>; formato: Formato };
export type Texto = { id: string; analise?: string; texto: string; valores?: ValorRef[] };
export type Metodologia = {
  analises: { id: string; titulo: string; tabelas: Record<string, { campos: string[] }> }[];
  leituras?: Texto[];
  conclusoes?: Texto[];
  ressalvas?: Texto[];
};

export type SecaoGuideline = {
  id: string;
  sobretitulo?: string;
  titulo?: string;
  intro?: string;
  analises?: { id: string; titulo?: string; descricao?: string; indicadores?: { campo: string; detalhe?: string }[] }[];
  leituras?: string[];
  conclusoes?: { id: string; titulo?: string; tipo?: 'destaque' }[];
  ressalvas?: string[];
};
export type Guideline = {
  slug: string;
  sobretitulo?: string;
  titulo: string;
  subtitulo: string;
  seo: { titulo?: string; descricao: string };
  meta?: { rotulo: string; leitura: string }[];
  rotulos?: Record<string, string>;
  secoes: SecaoGuideline[];
};

export type CampoFormatado = { campo: string; formato?: Formato };
export type Bloco =
  | { tipo: 'mensagem_chave'; analise: string; tabela: string; valor: CampoFormatado; leitura: string }
  | { tipo: 'indicadores'; analise: string; tabela: string; itens: (CampoFormatado & { mostrar_unidade?: boolean })[] }
  | { tipo: 'ranking'; analise: string; tabela: string; rotulo: CampoFormatado; valor: string; extra?: string; top?: number }
  | {
      tipo: 'serie_empilhada';
      analise: string;
      periodo: string;
      dimensoes: { tabela: string; campo: string; formato?: Formato }[];
      metricas: string[];
      top?: number;
    }
  | {
      tipo: 'fluxo';
      analise: string;
      tabela: string;
      camadas: CampoFormatado[];
      metricas: string[];
      filtro?: { campo: string; opcoes: (string | number)[] };
      top?: number;
    }
  | { tipo: 'destaque'; conclusao: string }
  | { tipo: 'nota'; leitura?: string; ressalvas?: string[] }
  | { tipo: 'grupo'; colunas: 2 | 3; blocos: Bloco[] }
  | {
      tipo: 'proprio';
      nome: string;
      analise: string;
      tabela?: string;
      tabelas?: string[];
      leituras?: string[];
      conclusoes?: string[];
      ressalvas?: string[];
      cabecalho?: true;
      props?: Record<string, unknown>;
    };

export type Composicao = { slug: string; secoes: { id: string; blocos: Bloco[] }[] };

/** Texto da metodologia entregue a um componente próprio: o conteúdo para exibir (com negrito) e o texto simples. */
export type TextoPronto = { conteudo: ReactNode; texto: string };

/**
 * Props que todo componente próprio recebe do renderizador (skill 03-gerar-componente).
 * Além destas, recebe o que estiver em props no bloco da composição.
 */
export type PropsProprio = {
  /** Linhas da tabela do bloco, quando ele declara tabela. */
  linhas?: Linha[];
  /** Tabelas declaradas no bloco, cada uma com campos e linhas. */
  tabelas: Record<string, Tabela>;
  /** Textos declarados no bloco, por id, já com os marcadores preenchidos. */
  textos: { leituras: Record<string, TextoPronto>; conclusoes: Record<string, TextoPronto>; ressalvas: Record<string, TextoPronto> };
  /** Nomes exibidos dos campos, do guideline. */
  rotulos: Record<string, string>;
  /** Título e descrição da análise do bloco na seção do guideline. */
  analise?: { titulo?: string; descricao?: string };
  /** Cabeçalho da seção, quando o bloco declara cabecalho: true; o componente o desenha. */
  secao?: { sobretitulo?: string; titulo?: string; intro?: string };
};
