# Akshara Tools

## Local setup
- `npm install`
- create `.env` from `.env.example`
- set `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PIN` for super admin access
- set Turso variables:
  - `TURSO_DATABASE_URL` (or `VITE_TURSO_DATABASE_URL` for local testing)
  - `TURSO_AUTH_TOKEN` (or `VITE_TURSO_AUTH_TOKEN`)
- run database migrations: `npm run db:migrate`
- run `npm run dev`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run test:coverage`
- `npm run db:migrate`

## Database migrations
- SQL migrations live in `db/migrations`
- Files run in lexical order (e.g. `0001_...sql`, `0002_...sql`)
- Runner tracks applied files in `_migrations` table

## Current progress
- Foundation scaffold started from PRD task sequence
- Config-first architecture in place to avoid hardcoded business values
- Salary calculator starter and protected admin route are live
