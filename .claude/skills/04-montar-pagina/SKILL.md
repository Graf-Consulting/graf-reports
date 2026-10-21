---
name: 04-montar-pagina
description: Cria a página fina de um estudo (app/reports/<slug>/page.tsx), que lê a composição e as entradas do estudo no build, declara os metadados de SEO do guideline e chama o renderizador, sem layout escrito à mão. Use na primeira geração do estudo, depois de 02-compor-report.
---

# 04-montar-pagina

## Objetivo

Criar a rota do estudo. A página lê os quatro arquivos do estudo, declara os metadados e entrega tudo ao renderizador. Não há layout escrito à mão (ADR-004).

## Quando usar

Na primeira geração do estudo, depois de `02-compor-report` produzir um `composicao.json` válido. Em regenerações e ajustes, a página não muda; o que muda é a composição ou as entradas.

Esta etapa é determinística e pode virar script (ADR-005).

## Entrada

- O `slug` do estudo.
- `app/reports/<slug>/composicao.json`.
- `content/reports/<slug>/data.json`, `guideline.md` e `metodologia.md` (ADR-003).
- O renderizador em `lib/report/renderizador/`.
- Se houver componentes próprios, o registro local em `app/reports/<slug>/components/index.ts`.

## Pré-requisitos

Pare e diga o que falta se `composicao.json` não existir ou não tiver passado na validação.

Se `app/reports/<slug>/page.tsx` já existir, não sobrescreva. Pare e sinalize, porque a página só é criada na primeira geração e pode ter ajuste manual (RF-16).

## Procedimento

Escreva `app/reports/<slug>/page.tsx` exatamente neste formato, trocando só o slug:

```tsx
import path from 'node:path';
import type { Metadata } from 'next';
import { lerCabecalho, Renderizador, type Composicao, type Dados, type Guideline, type Metodologia } from '@/lib/report/renderizador';
import data from '@/content/reports/<slug>/data.json';
import composicao from './composicao.json';

const pasta = path.join(process.cwd(), 'content/reports/<slug>');
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
    />
  );
}
```

Se o estudo tiver componentes próprios, importe o registro local e passe ao renderizador: `import { proprios } from './components';` e `proprios={proprios}`. Se o registro também exportar um `Provedor` (estado compartilhado entre componentes, skill `03-gerar-componente`), importe-o junto e passe `provedor={Provedor}`.

## Saída

`app/reports/<slug>/page.tsx`.

## Regras

- Nenhum bloco, estilo, texto ou cálculo na página. Tudo isso vem da composição e das entradas pelo renderizador.
- A página é server component, sem `'use client'`.
- Só a página do próprio estudo lê `content/reports/<slug>/` (ADR-003).
- Nada que dependa de servidor em produção: sem rotas de API, server actions, cookies, headers, `revalidate` ou renderização dinâmica (`output: 'export'`).
- Não altere arquivos fora de `app/reports/<slug>/`.
