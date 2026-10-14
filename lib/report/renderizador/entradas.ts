import fs from 'node:fs';
import yaml from 'js-yaml';

/**
 * Lê o cabeçalho YAML (entre as linhas ---) de um arquivo Markdown no build.
 * Só para server components: quem chama passa o caminho dos arquivos do próprio estudo.
 */
export function lerCabecalho<T>(caminho: string): T {
  const md = fs.readFileSync(caminho, 'utf8');
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`${caminho}: cabeçalho YAML ausente`);
  return yaml.load(m[1]) as T;
}
