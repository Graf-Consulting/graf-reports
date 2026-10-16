// Validação de um estudo: schemas de lib/report/schemas/ e checagens entre arquivos.
// Regras descritas nas skills 01-validar-entradas e 05-conferir-report e no ADR-002.
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import yaml from 'js-yaml';

const RAIZ = path.resolve(import.meta.dirname, '..');
const ajv = new Ajv({ allErrors: true, strict: false });
const schemas = Object.fromEntries(
  ['data', 'guideline', 'metodologia', 'composicao'].map((n) => [
    n,
    ajv.compile(JSON.parse(fs.readFileSync(path.join(RAIZ, 'lib/report/schemas', `${n}.schema.json`), 'utf8'))),
  ])
);

/** Tipos de campo aceitos por cada formato; null aceita qualquer tipo. */
const FORMATO_TIPO = { texto: null, fob: ['numero'], compact: ['numero'], cleanLabel: ['texto'] };

/** Formato do valor de cada tipo de campo do data.json. */
const VALOR_DO_TIPO = {
  texto: (v) => typeof v === 'string',
  numero: (v) => typeof v === 'number',
  data: (v) => typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v),
  mes: (v) => typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v),
  ano: (v) => Number.isInteger(v) && v >= 1000 && v <= 9999,
  geo_ponto: (v) => Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'number'),
  geo_linhas: (v) =>
    Array.isArray(v) && v.every((l) => Array.isArray(l) && l.every((p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'number'))),
};

const MARCADOR = /\{([a-z][a-z0-9_]*)\}/g;
const COM_CODIGO = /^\s*\d+\s*-\s*/;

/** Mensagem do ajv em português. */
function traduzir(e) {
  const p = e.params;
  switch (e.keyword) {
    case 'required': return `falta a propriedade obrigatória "${p.missingProperty}"`;
    case 'additionalProperties': return `propriedade não permitida "${p.additionalProperty}"`;
    case 'pattern': return 'não segue o formato esperado';
    case 'enum': return `valor não permitido; use um destes: ${p.allowedValues.join(', ')}`;
    case 'const': return `deve ser "${p.allowedValue}"`;
    case 'type': return `deve ser do tipo ${p.type}`;
    case 'minItems': return `deve ter pelo menos ${p.limit} item(ns)`;
    case 'maxItems': return `deve ter no máximo ${p.limit} itens`;
    case 'minLength': return p.limit === 1 ? 'não pode ficar vazio' : `deve ter pelo menos ${p.limit} caracteres`;
    case 'maxLength': return `deve ter no máximo ${p.limit} caracteres`;
    case 'minProperties': return `deve ter pelo menos ${p.limit} item(ns)`;
    case 'uniqueItems': return 'tem itens repetidos';
    case 'minimum': return `deve ser no mínimo ${p.limit}`;
    case 'not': return 'valor não permitido aqui';
    default: return e.message;
  }
}

function errosDoSchema(validar, arquivo, doc) {
  if (validar(doc)) return [];
  // "if" só repete o erro do "then"; o erro útil já vem na lista.
  return validar.errors.filter((e) => e.keyword !== 'if').map((e) => ({ arquivo, local: e.instancePath || '/', msg: traduzir(e) }));
}

function separarMarkdown(md, arquivo) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { erro: { arquivo, local: 'cabeçalho', msg: 'cabeçalho YAML ausente (entre linhas ---)' } };
  try {
    return { cabecalho: yaml.load(m[1]) ?? {}, corpo: m[2] };
  } catch (err) {
    return { erro: { arquivo, local: 'cabeçalho', msg: `YAML inválido: ${err.reason ?? err.message} (linha ${(err.mark?.line ?? 0) + 1}). Textos com dois-pontos vão entre aspas.` } };
  }
}

const idsDe = (lista) => (lista ?? []).map((x) => (typeof x === 'string' ? x : x.id));

/** Lê os arquivos de um estudo. A composição é opcional: antes da geração, ela ainda não existe. */
export function carregar(slug, raiz = RAIZ) {
  const entradas = path.join(raiz, 'content/reports', slug);
  const ler = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  return {
    slug,
    data: ler(path.join(entradas, 'data.json')),
    guideline: ler(path.join(entradas, 'guideline.md')),
    metodologia: ler(path.join(entradas, 'metodologia.md')),
    composicao: ler(path.join(raiz, 'app/reports', slug, 'composicao.json')),
  };
}

/** Valida as três entradas. Devolve erros (reprovam) e avisos (não reprovam). */
export function validarEntradas(c) {
  const erros = [];
  const avisos = [];
  const e = (arquivo, local, msg) => erros.push({ arquivo, local, msg });

  for (const [nome, arq] of [['data', 'data.json'], ['guideline', 'guideline.md'], ['metodologia', 'metodologia.md']])
    if (!c[nome]?.trim()) e(arq, 'arquivo', 'arquivo ausente ou vazio');
  if (erros.length) return { erros, avisos };

  let D;
  try {
    D = JSON.parse(c.data);
  } catch (err) {
    e('data.json', 'arquivo', `JSON inválido: ${err.message}`);
    return { erros, avisos };
  }
  const g = separarMarkdown(c.guideline, 'guideline.md');
  const m = separarMarkdown(c.metodologia, 'metodologia.md');
  for (const x of [g, m]) if (x.erro) erros.push(x.erro);
  if (erros.length) return { erros, avisos };

  erros.push(...errosDoSchema(schemas.data, 'data.json', D));
  erros.push(...errosDoSchema(schemas.guideline, 'guideline.md', g.cabecalho));
  erros.push(...errosDoSchema(schemas.metodologia, 'metodologia.md', m.cabecalho));
  if (erros.length) return { erros, avisos };

  const T = D.tabelas, G = g.cabecalho, M = m.cabecalho;

  // data.json: chave, campos descritos, tipos, nulos e rótulos sujos
  for (const [t, tab] of Object.entries(T)) {
    const chave = tab.chave ?? [];
    for (const k of chave) if (!tab.campos[k]) e('data.json', `tabelas.${t}.chave`, `campo "${k}" não está em campos`);
    const vistos = new Set();
    const sujos = {};
    tab.linhas.forEach((l, i) => {
      if (chave.length) {
        const k = JSON.stringify(chave.map((x) => l[x]));
        if (vistos.has(k)) e('data.json', `tabelas.${t}.linhas[${i}]`, `chave repetida ${k}`);
        vistos.add(k);
      }
      for (const [campo, v] of Object.entries(l)) {
        const def = tab.campos[campo];
        if (!def) { e('data.json', `tabelas.${t}.linhas[${i}]`, `campo "${campo}" não está descrito em campos`); continue; }
        if (v === null) { if (!def.nulo) e('data.json', `tabelas.${t}.linhas[${i}].${campo}`, 'valor nulo em campo sem "nulo": true'); continue; }
        if (!VALOR_DO_TIPO[def.tipo](v)) e('data.json', `tabelas.${t}.linhas[${i}].${campo}`, `valor ${JSON.stringify(v)} não segue o tipo ${def.tipo}`);
        else if (def.tipo === 'texto' && (v.trim() === '' || COM_CODIGO.test(v))) sujos[campo] = (sujos[campo] ?? 0) + 1;
      }
    });
    for (const [campo, n] of Object.entries(sujos))
      avisos.push({ arquivo: 'data.json', local: `tabelas.${t}.${campo}`, msg: `${n} valor(es) vazios ou com código no início; o ideal é entregar o rótulo limpo` });
  }

  // guideline.md: slug
  if (G.slug !== c.slug) e('guideline.md', 'slug', `"${G.slug}" diferente do nome da pasta "${c.slug}"`);

  // metodologia.md: ids únicos e subseção de cada análise no corpo
  for (const nome of ['analises', 'leituras', 'conclusoes', 'ressalvas']) {
    const s = new Set();
    for (const id of idsDe(M[nome])) { if (s.has(id)) e('metodologia.md', nome, `id repetido "${id}"`); s.add(id); }
  }
  const secaoAnalises = m.corpo.split(/^## /m).find((s) => s.startsWith('Análises')) ?? '';
  const subtitulos = [...secaoAnalises.matchAll(/^### (.+?)\s*$/gm)].map((x) => x[1]);
  for (const a of M.analises)
    if (!subtitulos.includes(a.titulo)) e('metodologia.md', 'corpo', `análise "${a.id}" sem subseção "### ${a.titulo}" em "## Análises"`);

  // Coerência entre arquivos
  const citaTabelas = (arquivo, local, cit) => {
    for (const [t, { campos }] of Object.entries(cit)) {
      if (!T[t]) { e(arquivo, local, `tabela "${t}" não existe no data.json`); continue; }
      for (const f of campos) if (!T[t].campos[f]) e(arquivo, local, `campo "${t}.${f}" não existe no data.json`);
    }
  };
  citaTabelas('guideline.md', 'tabelas', G.tabelas);
  (G.componentes_novos ?? []).forEach((cn, i) => citaTabelas('guideline.md', `componentes_novos[${i}]`, cn.tabelas));
  const todosCampos = new Set(Object.values(T).flatMap((t) => Object.keys(t.campos)));
  for (const f of Object.keys(G.rotulos ?? {})) if (!todosCampos.has(f)) e('guideline.md', 'rotulos', `campo "${f}" não existe no data.json`);
  M.analises.forEach((a) => citaTabelas('metodologia.md', `analises.${a.id}`, a.tabelas));

  const idsM = {
    analises: new Set(idsDe(M.analises)),
    leituras: new Set(idsDe(M.leituras)),
    conclusoes: new Set(idsDe(M.conclusoes)),
    ressalvas: new Set(idsDe(M.ressalvas)),
  };
  const exibidas = new Set();
  const analisePorId = Object.fromEntries(M.analises.map((a) => [a.id, a]));
  for (const s of G.secoes) {
    for (const a of s.analises ?? []) {
      exibidas.add(a.id);
      if (!idsM.analises.has(a.id)) { e('guideline.md', `secoes.${s.id}.analises`, `análise "${a.id}" não existe na metodologia`); continue; }
      for (const ind of a.indicadores ?? []) {
        const local = `secoes.${s.id}.analises.${a.id}.indicadores.${ind.campo}`;
        if (!Object.values(analisePorId[a.id].tabelas).some((t) => t.campos.includes(ind.campo))) e('guideline.md', local, `campo "${ind.campo}" não é usado pela análise "${a.id}"`);
        if (!G.rotulos?.[ind.campo]) e('guideline.md', local, `campo "${ind.campo}" sem nome em rotulos`);
        if (ind.detalhe && !idsM.leituras.has(ind.detalhe)) e('guideline.md', local, `leitura "${ind.detalhe}" não existe na metodologia`);
      }
    }
    for (const tipo of ['leituras', 'conclusoes', 'ressalvas'])
      for (const id of idsDe(s[tipo])) if (!idsM[tipo].has(id)) e('guideline.md', `secoes.${s.id}.${tipo}`, `"${id}" não existe na metodologia`);
  }
  (G.meta ?? []).forEach((mt, i) => { if (!idsM.leituras.has(mt.leitura)) e('guideline.md', `meta[${i}]`, `leitura "${mt.leitura}" não existe na metodologia`); });

  const ressalvasCitadas = new Set(G.secoes.flatMap((s) => idsDe(s.ressalvas)));
  const textosDosDados = new Set(Object.values(T).flatMap((t) => t.linhas.flatMap((l) => Object.values(l).filter((v) => typeof v === 'string' && v.length >= 4))));
  for (const tipo of ['leituras', 'conclusoes', 'ressalvas']) {
    for (const item of M[tipo] ?? []) {
      const local = `${tipo}.${item.id}`;
      if (item.analise && !idsM.analises.has(item.analise)) e('metodologia.md', local, `análise "${item.analise}" não existe`);
      if (tipo === 'ressalvas' && item.analise && !ressalvasCitadas.has(item.id) && !exibidas.has(item.analise))
        e('metodologia.md', local, `ressalva sem lugar: não é citada no guideline e a análise "${item.analise}" não aparece em nenhuma seção`);

      const marcadores = [...item.texto.matchAll(MARCADOR)].map((x) => x[1]);
      const declarados = (item.valores ?? []).map((v) => v.id);
      for (const mk of marcadores) if (!declarados.includes(mk)) e('metodologia.md', local, `marcador {${mk}} sem item em valores`);
      for (const d of declarados) if (!marcadores.includes(d)) e('metodologia.md', local, `valor "${d}" não é usado no texto`);

      for (const v of item.valores ?? []) {
        const lv = `${local}.valores.${v.id}`;
        const tab = T[v.tabela];
        if (!tab) { e('metodologia.md', lv, `tabela "${v.tabela}" não existe no data.json`); continue; }
        const def = tab.campos[v.campo];
        if (!def) { e('metodologia.md', lv, `campo "${v.tabela}.${v.campo}" não existe no data.json`); continue; }
        const linhas = tab.linhas.filter((l) => Object.entries(v.filtro ?? {}).every(([k, x]) => l[k] === x));
        if (linhas.length !== 1) e('metodologia.md', lv, `o filtro seleciona ${linhas.length} linhas; deve selecionar exatamente 1`);
        const aceitos = FORMATO_TIPO[v.formato];
        if (aceitos && !aceitos.includes(def.tipo)) e('metodologia.md', lv, `formato "${v.formato}" incompatível com o tipo ${def.tipo}`);
      }

      // Valores dos dados escritos à mão. Anos (19xx, 20xx) são permitidos.
      const semMarcadores = item.texto.replace(MARCADOR, '');
      for (const n of semMarcadores.match(/\d[\d.,]*\d|\d/g) ?? [])
        if (!/^(19|20)\d{2}$/.test(n)) e('metodologia.md', local, `número "${n}" escrito no texto; use um marcador`);
      for (const v of textosDosDados) if (semMarcadores.includes(v)) e('metodologia.md', local, `valor dos dados "${v}" escrito no texto; use um marcador`);
    }
  }
  return { erros, avisos, entradas: { D, G, M } };
}

/** Valida a composição contra o schema e contra as entradas já validadas. */
export function validarComposicao(texto, { D, G, M }) {
  const erros = [];
  const e = (local, msg) => erros.push({ arquivo: 'composicao.json', local, msg });
  let C;
  try {
    C = JSON.parse(texto);
  } catch (err) {
    e('arquivo', `JSON inválido: ${err.message}`);
    return erros;
  }
  erros.push(...errosDoSchema(schemas.composicao, 'composicao.json', C));
  if (erros.length) return erros;
  // Formatação fixa, para a mesma composição gerar sempre o mesmo arquivo (RNF-04).
  if (texto.replace(/\r\n/g, '\n') !== JSON.stringify(C, null, 2) + '\n')
    e('arquivo', 'fora da formatação padrão: indentação de 2 espaços, um item por linha e quebra de linha no fim (saída de JSON.stringify(composicao, null, 2))');

  const T = D.tabelas;
  const analises = Object.fromEntries(M.analises.map((a) => [a.id, a]));
  const secaoG = Object.fromEntries(G.secoes.map((s) => [s.id, s]));

  if (C.slug !== G.slug) e('slug', `"${C.slug}" diferente do slug do guideline "${G.slug}"`);
  const ordemC = C.secoes.map((s) => s.id).join(', '), ordemG = G.secoes.map((s) => s.id).join(', ');
  if (ordemC !== ordemG) e('secoes', `seções (${ordemC}) diferentes das do guideline, na ordem (${ordemG})`);

  const usados = new Set();
  const ressalvasExibidas = new Set();
  const campo = (local, tabela, nome, analise, formato) => {
    const tab = T[tabela];
    if (!tab) return e(local, `tabela "${tabela}" não existe no data.json`);
    const def = tab.campos[nome];
    if (!def) return e(local, `campo "${tabela}.${nome}" não existe no data.json`);
    if (analises[analise] && !(analises[analise].tabelas[tabela]?.campos ?? []).includes(nome))
      e(local, `campo "${tabela}.${nome}" não é usado pela análise "${analise}"`);
    const aceitos = formato && FORMATO_TIPO[formato];
    if (aceitos && !aceitos.includes(def.tipo)) e(local, `formato "${formato}" incompatível com o tipo ${def.tipo} de "${nome}"`);
  };
  const rotulo = (local, nome, papel) => { if (!G.rotulos?.[nome]) e(local, `${papel} "${nome}" sem nome em rotulos no guideline`); };

  const bloco = (b, s, local) => {
    const sg = secaoG[s.id] ?? {};
    const citada = (tipo, id, nomeTipo) => {
      usados.add(`${tipo}:${id}`);
      if (!idsDe(sg[tipo]).includes(id)) e(local, `${nomeTipo} "${id}" não é citada na seção "${s.id}" do guideline`);
    };
    if (b.analise) {
      usados.add(`analises:${b.analise}`);
      if (!analises[b.analise]) e(local, `análise "${b.analise}" não existe na metodologia`);
      else if (!idsDe(sg.analises).includes(b.analise)) e(local, `análise "${b.analise}" não é citada na seção "${s.id}" do guideline`);
    }
    switch (b.tipo) {
      case 'mensagem_chave':
        campo(local, b.tabela, b.valor.campo, b.analise, b.valor.formato);
        citada('leituras', b.leitura, 'leitura');
        break;
      case 'indicadores': {
        b.itens.forEach((it) => {
          campo(local, b.tabela, it.campo, b.analise, it.formato);
          rotulo(local, it.campo, 'indicador');
          // Unidade no cartão: só com formato compact e campo com unidade (fob já mostra US$).
          const unidade = T[b.tabela]?.campos[it.campo]?.unidade;
          const deve = it.formato === 'compact' && Boolean(unidade);
          if (deve && !it.mostrar_unidade) e(local, `indicador "${it.campo}" usa compact e tem unidade "${unidade}": declare "mostrar_unidade": true`);
          if (!deve && it.mostrar_unidade) e(local, `indicador "${it.campo}" não deve ter "mostrar_unidade": só vale para formato compact com unidade`);
        });
        const ind = (sg.analises ?? []).find((a) => a.id === b.analise)?.indicadores ?? [];
        const esperado = ind.map((i) => i.campo).join(', '), atual = b.itens.map((i) => i.campo).join(', ');
        if (esperado !== atual) e(local, `itens (${atual}) diferentes dos indicadores do guideline (${esperado})`);
        break;
      }
      case 'ranking':
        campo(local, b.tabela, b.rotulo.campo, b.analise, b.rotulo.formato);
        campo(local, b.tabela, b.valor, b.analise);
        rotulo(local, b.valor, 'campo');
        if (b.extra) { campo(local, b.tabela, b.extra, b.analise); rotulo(local, b.extra, 'campo'); }
        break;
      case 'serie_empilhada':
        for (const d of b.dimensoes) {
          campo(local, d.tabela, d.campo, b.analise, d.formato);
          campo(local, d.tabela, b.periodo, b.analise);
          b.metricas.forEach((mt) => campo(local, d.tabela, mt, b.analise));
          rotulo(local, d.campo, 'dimensão');
        }
        b.metricas.forEach((mt) => rotulo(local, mt, 'métrica'));
        break;
      case 'fluxo':
        b.camadas.forEach((cm) => campo(local, b.tabela, cm.campo, b.analise, cm.formato));
        b.metricas.forEach((mt) => { campo(local, b.tabela, mt, b.analise); rotulo(local, mt, 'métrica'); });
        if (b.filtro) {
          campo(local, b.tabela, b.filtro.campo, b.analise);
          const existentes = new Set((T[b.tabela]?.linhas ?? []).map((l) => l[b.filtro.campo]));
          for (const o of b.filtro.opcoes) if (o !== 'todos' && !existentes.has(o)) e(local, `opção de filtro ${JSON.stringify(o)} não existe em "${b.filtro.campo}"`);
        }
        break;
      case 'destaque':
        citada('conclusoes', b.conclusao, 'conclusão');
        break;
      case 'nota':
        if (b.leitura) citada('leituras', b.leitura, 'leitura');
        for (const r of b.ressalvas ?? []) { citada('ressalvas', r, 'ressalva'); ressalvasExibidas.add(r); }
        break;
      case 'grupo':
        b.blocos.forEach((x, i) => bloco(x, s, `${local}.blocos[${i}]`));
        break;
      case 'proprio':
        if (b.tabela && !T[b.tabela]) e(local, `tabela "${b.tabela}" não existe no data.json`);
        break;
    }
  };
  C.secoes.forEach((s) => s.blocos.forEach((b, i) => bloco(b, s, `secoes.${s.id}.blocos[${i}]`)));

  // Leituras exibidas fora dos blocos: topo (meta) e detalhe dos indicadores
  (G.meta ?? []).forEach((mt) => usados.add(`leituras:${mt.leitura}`));
  G.secoes.forEach((s) => (s.analises ?? []).forEach((a) => (a.indicadores ?? []).forEach((i) => i.detalhe && usados.add(`leituras:${i.detalhe}`))));

  // Tudo o que o guideline cita em cada seção aparece na composição
  const nomes = { analises: 'análise', leituras: 'leitura', conclusoes: 'conclusão', ressalvas: 'ressalva' };
  for (const sg of G.secoes)
    for (const tipo of Object.keys(nomes))
      for (const id of idsDe(sg[tipo])) if (!usados.has(`${tipo}:${id}`)) e(`secoes.${sg.id}`, `${nomes[tipo]} "${id}" citada no guideline e não exibida`);
  // Toda ressalva da metodologia aparece no report (ADR-002)
  for (const r of M.ressalvas ?? []) if (!ressalvasExibidas.has(r.id)) e('ressalvas', `ressalva "${r.id}" não aparece no report`);
  return erros;
}

/** Valida um estudo inteiro: entradas e, se existir, composição. */
export function validarEstudo(c) {
  const { erros, avisos, entradas } = validarEntradas(c);
  let composicao = 'ausente';
  if (!erros.length && c.composicao !== null) {
    const ec = validarComposicao(c.composicao, entradas);
    erros.push(...ec);
    composicao = ec.length ? 'reprovada' : 'aprovada';
  }
  return { erros, avisos, composicao };
}

/** Slugs dos estudos com pasta em content/reports/. */
export function listarEstudos(raiz = RAIZ) {
  const dir = path.join(raiz, 'content/reports');
  return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
}
