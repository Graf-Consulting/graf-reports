import path from 'node:path';
import type { Metadata } from 'next';
import { lerCabecalho, Renderizador, type Composicao, type Dados, type Guideline, type Metodologia } from '@/lib/report/renderizador';
import data from '@/content/reports/acessos-portuarios/data.json';
import composicao from './composicao.json';
import { proprios } from './components';

const pasta = path.join(process.cwd(), 'content/reports/acessos-portuarios');
const guideline = lerCabecalho<Guideline>(path.join(pasta, 'guideline.md'));
const metodologia = lerCabecalho<Metodologia>(path.join(pasta, 'metodologia.md'));

export const metadata: Metadata = {
  title: guideline.seo.titulo ?? guideline.titulo,
  description: guideline.seo.descricao,
};

export default function Page() {
  return (
    <Renderizador
      composicao={composicao as Composicao}
      dados={data as unknown as Dados}
      guideline={guideline}
      metodologia={metodologia}
      proprios={proprios}
    />
  );
}
