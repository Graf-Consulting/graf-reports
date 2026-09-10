import type { Metadata } from 'next';
import Report from './report';

export const metadata: Metadata = {
  title: 'Impacto das restrições da União Europeia | GRAF Infra Consulting',
  description:
    'Análise de exposição das exportações brasileiras de produtos de origem animal às restrições da União Europeia.',
};

export default function Page() {
  return <Report />;
}