import fs from 'node:fs';
import path from 'node:path';
import { notFound, redirect } from 'next/navigation';

/**
 * Estudo mais recente: maior data_referencia do metadata do data.json; empate, slug em ordem alfabética.
 * Só conta estudo que já tem página gerada; entradas sem página (geração em andamento ou parada) ficam de fora.
 * Exceção registrada no ADR-003: a raiz lê só o metadata de cada estudo, para escolher o redirecionamento.
 */
function estudoMaisRecente() {
  const pasta = path.join(process.cwd(), 'content/reports');
  if (!fs.existsSync(pasta)) return undefined;
  const temPagina = (slug: string) => fs.existsSync(path.join(process.cwd(), 'app/reports', slug, 'page.tsx'));
  const estudos = fs
    .readdirSync(pasta, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(pasta, d.name, 'data.json')) && temPagina(d.name))
    .map((d) => {
      const dados = JSON.parse(fs.readFileSync(path.join(pasta, d.name, 'data.json'), 'utf8'));
      return { slug: d.name, data: String(dados.metadata?.data_referencia ?? '') };
    })
    .sort((a, b) => b.data.localeCompare(a.data) || a.slug.localeCompare(b.slug));
  return estudos[0]?.slug;
}

/** A raiz não tem conteúdo nem menu: redireciona para o estudo mais recente. */
export default function Home() {
  const slug = estudoMaisRecente();
  if (!slug) notFound();
  redirect(`/reports/${slug}`);
}
