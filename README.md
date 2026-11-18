# wazn-api

Backend for **Wazn (وزن)** — a Riyadh-first marketplace for comparing gym membership prices.
NestJS 12 · TypeScript (strict) · PostgreSQL 16 + PostGIS · Prisma 7 · Redis (BullMQ, later).

## Requirements

- Node.js **24.9+** (Nest 12 packages are ESM-only; Jest needs Node 24.9+ to load them)
- Docker Desktop (Postgres + PostGIS, Redis)

## Setup (PowerShell)

```powershell
npm install                 # also runs `prisma generate` (postinstall)
Copy-Item .env.example .env
npm run db:up               # starts wazn-postgres + wazn-redis
npm run db:deploy           # applies prisma/migrations
npm run db:seed             # 5 sample gyms in Riyadh (idempotent)
npm run start:dev
```

Then open:

- http://localhost:3000/health → `{"status":"ok","checks":{"database":"up"}}`
- http://localhost:3000/docs (Swagger UI) · http://localhost:3000/docs-json (OpenAPI for client generation)

## Scripts

| Script                               | What it does                                                       |
| ------------------------------------ | ------------------------------------------------------------------ |
| `start:dev`                          | Run with watch                                                     |
| `build` / `start:prod`               | Compile to `dist/` / run compiled                                  |
| `lint` / `lint:fix`                  | ESLint (typescript-eslint strict, type-checked) + Prettier         |
| `format` / `format:check`            | Prettier                                                           |
| `typecheck`                          | `tsc --noEmit`                                                     |
| `test` / `test:cov`                  | Unit tests (`src/**/*.spec.ts`)                                    |
| `test:e2e`                           | E2E tests (`test/*.e2e-spec.ts`) — needs the DB up and seeded      |
| `db:up` / `db:down`                  | Docker Compose services                                            |
| `db:migrate`                         | `prisma migrate dev` — create a migration after editing the schema |
| `db:deploy` / `db:reset` / `db:seed` | Apply migrations / drop + re-apply + seed / seed only              |
| `db:studio`                          | Prisma Studio                                                      |

## Environment variables

See `.env.example`. Validated at boot by `src/config/env.schema.ts` (zod) — the app refuses to start on a missing or malformed value.

| Variable                                                                   | Required | Notes                            |
| -------------------------------------------------------------------------- | -------- | -------------------------------- |
| `NODE_ENV`, `PORT`                                                         | no       | defaults `development`, `3000`   |
| `CORS_ORIGINS`                                                             | no       | comma-separated                  |
| `DATABASE_URL`                                                             | yes      | postgres URL                     |
| `REDIS_URL`                                                                | yes      | redis URL                        |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                                  | yes      | ≥ 32 chars                       |
| `SMS_PROVIDER_KEY`, `WHATSAPP_*`, `GOOGLE_MAPS_KEY`, `S3_*`, `LLM_API_KEY` | later    | used from later milestones       |
| `SEED_ADMIN_PHONE`                                                         | no       | E.164 phone for the seeded admin |

## Architecture

Clean Architecture per feature module. Dependencies point inward:
`presentation → application → domain ← infrastructure`.

```
src/
  config/                 env schema (zod) + typed AppConfigService
  common/
    domain/               DomainError, ErrorKind (framework-free)
    presentation/         ApiExceptionFilter → { code, message, details? }, ValidationPipe
    infrastructure/prisma PrismaService (the only PrismaClient)
  modules/<feature>/
    domain/               entities, value objects, repository interfaces, domain errors
    application/          one use case per action
    infrastructure/       Prisma repositories, external clients
    presentation/         controllers + DTOs (class-validator, Swagger)
  generated/prisma/       Prisma client (generated, git-ignored)
prisma/
  schema.prisma, migrations/, seed.ts, seed-data.ts
```

### Conventions

- **Errors**: throw a subclass of `DomainError` with a stable `code` and an `ErrorKind`; the filter maps the kind to HTTP status. Clients localize by `code`.
- **Versioning**: URI versioning, default `v1` (`/v1/...`). `/health` and `/docs` are unversioned.
- **Money**: whole SAR `Int` for prices; `Decimal` for commission. No floats for money.
- **Time**: stored in UTC; clients display Asia/Riyadh.
- **Geo**: `branches.location` is a PostGIS `geography(Point,4326)` **generated from `lat`/`lng`** (GiST-indexed). Write `lat`/`lng`; query `location` with `ST_DWithin`.
- Rules Prisma can't model (CHECK constraints, generated columns) live in the migration SQL. "One LIVE offer per plan" is enforced in the offers use cases.

## Seed data

5 gyms / 6 branches / 24 plans in Al Malqa, Al Narjis, Al Yasmin and Hittin. Includes a stale price (Iron Yard, verified 45 days ago), live offers, a `PENDING_REVIEW` low-confidence offer, and Pulse Fitness staff for every role:

| Phone              | Role                          |
| ------------------ | ----------------------------- |
| `SEED_ADMIN_PHONE` | Admin                         |
| `+966500000002`    | Pulse owner                   |
| `+966500000003`    | Pulse branch manager (Hittin) |
| `+966500000004`    | Pulse front desk (Al Malqa)   |
| `+966500000010`    | Member                        |

## Commits

Conventional Commits, enforced by commitlint. Pre-commit runs lint-staged (ESLint + Prettier).
