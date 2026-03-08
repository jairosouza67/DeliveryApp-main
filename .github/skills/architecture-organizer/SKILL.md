---
name: architecture-organizer
description: 'Review, document, and reorganize the frontend architecture of this workspace. Use when the request mentions arquitetura, estrutura do projeto, rotas, providers, camadas, organizacao de pastas, or modularizacao.'
argument-hint: 'Describe the architectural area to review or reorganize'
user-invocable: true
disable-model-invocation: false
---

# Architecture Organizer

## When to Use
- Organizar a arquitetura do projeto
- Revisar estrutura de pastas e fronteiras entre camadas
- Separar rotas, providers e bootstrap da aplicacao
- Documentar convencoes arquiteturais do workspace

## Procedure
1. Ler `docs/architecture.md` para entender a estrutura atual.
2. Mapear os pontos de entrada em `src/main.tsx`, `src/App.tsx` e `src/app/`.
3. Verificar se telas em `src/pages/` estao assumindo responsabilidades de dados ou infraestrutura demais.
4. Extrair wiring global para `src/app/providers/` e organizacao de rotas para `src/app/routes/` quando necessario.
5. Atualizar a documentacao e as instrucoes do workspace quando a arquitetura mudar.
6. Validar com `npm run build` e, quando aplicavel, `npm run lint`.

## Outputs Esperados
- Estrutura mais previsivel para bootstrap, rotas e providers
- Regras de dependencia documentadas
- Menor acoplamento entre UI, paginas e integracoes
