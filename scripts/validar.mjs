// Uso: npm run validar               valida todos os estudos de content/reports/
//      npm run validar -- <slug>     valida um estudo
// Sai com código 1 se algum estudo tiver erro. Avisos não reprovam.
import { carregar, listarEstudos, validarEstudo } from './validacao.mjs';

const slugs = process.argv.slice(2);
const estudos = slugs.length ? slugs : listarEstudos();
if (!estudos.length) {
  console.log('Nenhum estudo em content/reports/.');
  process.exit(0);
}

let reprovados = 0;
for (const slug of estudos) {
  const c = carregar(slug);
  if (c.data === null && c.guideline === null && c.metodologia === null) {
    console.log(`\n✗ ${slug}: pasta content/reports/${slug}/ não encontrada`);
    reprovados++;
    continue;
  }
  const { erros, avisos, composicao } = validarEstudo(c);
  const situacaoComposicao = { aprovada: 'composição aprovada', reprovada: 'composição reprovada', ausente: 'sem composição ainda' }[composicao];
  console.log(`\n${erros.length ? '✗' : '✓'} ${slug}: ${erros.length ? `${erros.length} erro(s)` : 'entradas aprovadas'}${erros.length ? '' : `, ${situacaoComposicao}`}`);
  for (const x of erros) console.log(`  erro   ${x.arquivo} · ${x.local}: ${x.msg}`);
  for (const x of avisos) console.log(`  aviso  ${x.arquivo} · ${x.local}: ${x.msg}`);
  if (erros.length) reprovados++;
}
console.log(`\n${estudos.length - reprovados} de ${estudos.length} estudo(s) aprovado(s).`);
process.exit(reprovados ? 1 : 0);
