# Project Guidelines

## Architecture
Use `src/app/` for application bootstrap only: providers, routing and global wiring.
Keep route screens in `src/pages/` and shared presentation in `src/components/`.
Prefer reusable data-access and business helpers in `src/lib/` instead of querying Supabase directly inside pages.
Treat `src/integrations/` as the boundary for external services and generated client types.
See `docs/architecture.md` for the current layering and dependency rules.

## Build And Test
Install dependencies with `npm install`.
Run the dev server with `npm run dev`.
Validate changes with `npm run build` and `npm run lint` when the edited files are covered by ESLint.

## Conventions
Preserve the existing alias style with `@/` imports.
Keep pages focused on composition and user flow; move reusable async logic, cache and transformations into `src/lib/`.
When adding routes, update the grouped route modules under `src/app/routes/` instead of expanding a single large router file.
