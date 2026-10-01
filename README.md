# single page reporting environment
Aplicação Next.js para publicação de estudos e relatórios independentes.

Cada estudo é disponibilizado como uma experiência própria dentro da aplicação, utilizando componentes e recursos compartilhados quando aplicável.

## Estrutura
```
graf-reports/
├── app/
│   ├── layout.tsx          
│   ├── page.tsx
│   ├── globals.css
│   └── reports/
│       └── report-1/
│           ├── data.ts
│           ├── page.tsx     
│           └── reports.tsx
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
├── public/
└── package.json
```

## Organização
- app/ — estrutura de páginas e rotas da aplicação.
- app/reports/ — estudos publicados na aplicação, cada um em sua própria rota.
- components/ — componentes compartilhados entre os estudos.
- public/ — arquivos públicos e recursos estáticos.
- package.json — dependências e configurações do projeto.

## Documentação
Constule em [documentação do projeto](./docs/README.md)