# BebeMais

Aplicacao web para catalogo, carrinho, checkout e administracao de um delivery de bebidas, construida com React, TypeScript, Vite e Supabase.

## Stack principal

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router DOM
- Supabase
- TanStack Query

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Estrutura do projeto

```text
src/
  app/            # Bootstrap da aplicacao: providers e rotas
  components/     # Componentes reutilizaveis, layouts e UI
  contexts/       # Estado global
  hooks/          # Hooks customizados
  integrations/   # Clientes externos e tipos
  lib/            # Helpers, cache e acesso a dados reutilizavel
  pages/          # Telas roteaveis
```

## Arquitetura

A organizacao arquitetural do frontend esta documentada em `docs/architecture.md`.

Pontos centrais:
- `src/main.tsx` sobe o app e trata o service worker.
- `src/App.tsx` monta a casca principal.
- `src/app/providers/` concentra providers globais.
- `src/app/routes/` agrupa a configuracao de rotas publicas e administrativas.
- `src/pages/` orquestra a experiencia e consome modulos reutilizaveis de `src/lib/`.

## Dados e integracoes

- O cliente do Supabase fica em `src/integrations/supabase/client.ts`.
- Tipos gerados ficam em `src/integrations/supabase/types.ts`.
- Modulos de acesso a dados reutilizaveis, como `src/lib/productsApi.ts`, devem ser preferidos em vez de duplicar fetch em paginas.
- O painel administrativo agora usa servicos em `src/lib/admin/` para centralizar queries e mutacoes.

## Proximos passos sugeridos

- Reduzir residuos de nomes herdados de versoes anteriores do produto.
- Evoluir o painel admin com hooks de React Query sobre `src/lib/admin/`.
- Adicionar testes para fluxos criticos de autenticacao, carrinho e administracao.
