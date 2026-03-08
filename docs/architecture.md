# Arquitetura do BebeMais

## Visao geral

O frontend segue uma arquitetura em camadas leve para separar bootstrap da aplicacao, composicao de tela, acesso a dados e integracoes externas.

```text
src/
  app/            # Bootstrap da aplicacao: providers, router e configuracao global
  pages/          # Telas roteaveis; orquestram casos de uso e composicao da UI
  components/     # Componentes reutilizaveis, layout, guards e UI shadcn
  contexts/       # Estado global de sessao e carrinho
  hooks/          # Hooks de composicao e adaptadores de estado
  lib/            # Casos de uso, cache, helpers de dominio e acesso a dados reutilizavel
  integrations/   # Clientes externos e tipos gerados (Supabase)
```

## Fluxo principal

1. `src/main.tsx` sobe o React e registra o service worker em producao.
2. `src/App.tsx` monta a casca da aplicacao.
3. `src/app/providers/AppProviders.tsx` aplica providers globais.
4. `src/app/routes/AppRouter.tsx` resolve a arvore de rotas.
5. `src/pages/*` monta a tela usando componentes, hooks e funcoes de `src/lib/`.

## Regras de dependencia

- `src/app/` pode depender de qualquer camada inferior, mas nao deve conter regras de negocio.
- `src/pages/` pode importar `components`, `hooks`, `contexts` e `lib`; deve evitar acesso direto a `supabase` quando houver ou puder existir um modulo reutilizavel em `lib`.
- `src/components/` nao deve importar paginas.
- `src/lib/` pode importar `integrations` e outros helpers de `lib`, mas nao deve depender de `pages` ou componentes visuais.
- `src/integrations/` concentra clientes externos e tipos gerados; essa camada nao conhece UI.

## Modulos por dominio

- `src/lib/admin/` concentra consultas, mutacoes e assinaturas realtime do painel administrativo.
- Páginas administrativas devem consumir essa camada em vez de usar `supabase` diretamente.
- `src/lib/productsApi.ts` continua sendo o modulo compartilhado do catalogo publico e pode ser encapsulado por servicos admin quando necessario.

## Convencoes praticas

- Novos providers globais entram em `src/app/providers/`.
- Novas rotas entram em `src/app/routes/` e devem ser agrupadas por contexto (`public`, `admin`, etc.).
- Paginas devem ficar finas: fetch, cache e transformacoes reutilizaveis devem migrar para `src/lib/`.
- Componentes grandes e especificos de uma pagina podem evoluir para subpastas de feature no futuro, mas a tela continua sendo o ponto de orquestracao.

## Debito tecnico atual

- Ainda existem nomes e documentos herdados de outro produto em alguns arquivos legados.
- O painel administrativo ainda pode evoluir para hooks com React Query para padronizar cache, loading e invalidacao.
- O dashboard ainda recalcula metricas no cliente; uma agregacao no backend reduziria custo de leitura.
