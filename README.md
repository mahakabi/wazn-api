# wazn-api

Backend for **Wazn (وزن)** — a Riyadh-first marketplace for comparing gym membership prices.
NestJS 12 · TypeScript (strict) · PostgreSQL 16 + PostGIS · Prisma 7 · Redis (BullMQ, later).

## Requirements

- Node.js **24.9+** (Nest 12 packages are ESM-only; Jest needs Node 24.9+ to load them)
- Docker Desktop (Postgres + PostGIS, Redis)

## Setup

```bash
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npm install                 # also runs `prisma generate` (postinstall)
npm run db:up               # starts Postgres (host port 5433), Redis and Mailpit (http://localhost:8025)
npm run db:deploy           # applies prisma/migrations
npm run db:seed             # 5 sample gyms in Riyadh (idempotent)
npm run start:dev
```

Then open:

- http://localhost:3000/health → `{"status":"ok","checks":{"database":"up","redis":"up"}}`
- http://localhost:3000/docs (Swagger UI) · http://localhost:3000/docs-json (OpenAPI for client generation)

## Scripts

| Script                               | What it does                                                              |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `start:dev`                          | Run with watch                                                            |
| `build` / `start:prod`               | Compile to `dist/` / run compiled                                         |
| `lint` / `lint:fix`                  | ESLint (typescript-eslint strict, type-checked) + Prettier                |
| `format` / `format:check`            | Prettier                                                                  |
| `typecheck`                          | `tsc --noEmit`                                                            |
| `test` / `test:cov`                  | Unit tests (`src/**/*.spec.ts`)                                           |
| `test:e2e`                           | E2E tests (`test/*.e2e-spec.ts`) — needs Postgres + Redis up and migrated |
| `db:up` / `db:down`                  | Docker Compose services                                                   |
| `db:migrate`                         | `prisma migrate dev` — create a migration after editing the schema        |
| `db:deploy` / `db:reset` / `db:seed` | Apply migrations / drop + re-apply + seed / seed only                     |
| `db:studio`                          | Prisma Studio                                                             |

## Environment variables

See `.env.example`. Validated at boot by `src/config/env.schema.ts` (zod) — the app refuses to start on a missing or malformed value.

| Variable                                                                       | Required | Notes                                                  |
| ------------------------------------------------------------------------------ | -------- | ------------------------------------------------------ |
| `NODE_ENV`, `PORT`                                                             | no       | defaults `development`, `3000`                         |
| `CORS_ORIGINS`                                                                 | no       | comma-separated                                        |
| `DATABASE_URL`                                                                 | yes      | postgres URL                                           |
| `REDIS_URL`                                                                    | yes      | redis URL                                              |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                                      | yes      | ≥ 32 chars                                             |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | no       | default to Mailpit; set for production                 |
| `WHATSAPP_*`, `GOOGLE_MAPS_KEY`, `S3_*`, `LLM_API_KEY`                         | later    | used from later milestones                             |
| `SEED_ADMIN_EMAIL`                                                             | no       | email of the seeded admin (default `admin@wazn.local`) |

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

## Auth

Email + one-time code, then a JWT access token (15 min) and an opaque refresh token (30 days).
Email is the sign-in identity; phone is optional on the account and collected at booking.

| Endpoint                    | Notes                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `POST /v1/auth/otp/request` | `{ email, locale? }`. Emails a 6-digit code (Arabic or English).                           |
| `POST /v1/auth/otp/verify`  | `{ email, code, locale? }` → session. Creates a MEMBER on first sign-in (`isNewUser`).     |
| `POST /v1/auth/refresh`     | `{ refreshToken }` → new session. **Every refresh returns a new refresh token; store it.** |
| `POST /v1/auth/logout`      | `{ refreshToken }` → 204. Revokes that sign-in.                                            |
| `GET /v1/me`                | Bearer token required.                                                                     |

- **Secure by default:** a global guard requires `Authorization: Bearer <accessToken>` on every route; `@Public()` opts out.
- **OTP limits (per address, in Redis):** valid 5 min, 5 wrong attempts burns the code, 60 s resend cooldown, 5 codes per hour. Plus 20 requests/min per IP on `/auth` (in-memory).
- **Storage:** OTPs are stored as HMAC(email:code) in Redis; refresh tokens as HMAC in Postgres. Neither is stored in plain text.
- **Rotation + reuse detection:** a refresh token works once. Reusing an old one revokes every token from that sign-in.
- **Email in development:** everything goes to Mailpit (`npm run db:up` starts it). Open http://localhost:8025 to read the codes. In production, set the `SMTP_*` and `MAIL_FROM` variables for any provider.

Error codes: `INVALID_EMAIL`, `OTP_COOLDOWN`, `OTP_TOO_MANY_REQUESTS`, `INVALID_OTP` (`details.attemptsLeft`), `OTP_EXPIRED`, `OTP_ATTEMPTS_EXCEEDED`, `INVALID_REFRESH_TOKEN`, `UNAUTHENTICATED`, `RATE_LIMITED`.

## Member API (v1)

All prices are whole SAR. Times are UTC ISO strings (show in Asia/Riyadh). Full schemas: `/docs`.

| Endpoint                                                                | Auth      | Notes                                                                                                     |
| ----------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `GET /v1/branches/nearby?lat&lng&radiusKm&gender&months&hasOffer&limit` | public    | Map. Nearest first (PostGIS `ST_DWithin`, default 10 km, max 50). `gender=WOMEN/MEN` also includes MIXED. |
| `GET /v1/branches/search?q&…`                                           | public    | Gym name (EN/AR) or district. Same filters.                                                               |
| `GET /v1/branches/:id`                                                  | public    | Gym page: plans (1/3/6/12), live offer, terms, `verifiedDaysAgo`, `isPriceStale`, `twelveMonthCost`.      |
| `GET /v1/compare?ids=a,b[,c,d]`                                         | public    | 2–4 branches, cheapest 12-month plan each, `bestValueBranchId`.                                           |
| `PATCH /v1/me`                                                          | member    | `{ name?, locale?, phone?, whatsappOptIn? }`. Phone is required before the first booking.                 |
| `POST /v1/bookings`                                                     | member    | `{ planId }` → locks today's price (offer if live), code `WZ-XXXX`, valid `code_validity_days`.           |
| `GET /v1/me/bookings`, `GET /v1/me/bookings/:id`                        | member    | Newest first. Status is already `EXPIRED` once past expiry.                                               |
| `POST /v1/bookings/:id/cancel`                                          | member    | Only while `ISSUED`.                                                                                      |
| `GET /v1/me/saved`, `PUT/DELETE /v1/me/saved/:branchId`                 | member    | `{ alertMode: BELOW_PRICE \| ANY_OFFER \| OFF, alertBelow? }`                                             |
| `POST /v1/reports`                                                      | member    | `{ type, branchId, bookingId?, details }`. `PRICE_MISMATCH` needs the booking.                            |
| `POST /v1/gym/codes/verify`                                             | gym staff | `{ code }` (lenient: `7k42` works). Masked phone + first name.                                            |
| `POST /v1/gym/codes/:code/confirm`                                      | gym staff | Atomic ISSUED → CONFIRMED; commission = locked price × gym rate (or default), exact to the halala.        |

Rules worth knowing:

- **Featured plan** (map pin / list row): the requested `months`, otherwise the lowest monthly price.
- **Offers** count only when `LIVE` (admin-approved) and inside `[startsAt, endsAt)`.
- **12-month cost** = joining fee + first term (offer price if live) + renewal price for the remaining terms.
- **Booking**: partner gyms only; one active booking per plan per member; the code is the QR content.
- **Staff scope**: staff only see codes of their gym, and of their branch if they have one. Other gyms' codes return `BOOKING_NOT_FOUND`.
- **Expiry**: reads treat overdue `ISSUED` as `EXPIRED`; a cron (`@nestjs/schedule`, every 10 min) updates stored rows.

## Seed data

5 gyms / 6 branches / 24 plans in Al Malqa, Al Narjis, Al Yasmin and Hittin. Includes a stale price (Iron Yard, verified 45 days ago), live offers, a `PENDING_REVIEW` low-confidence offer, and Pulse Fitness staff for every role:

Sign in with any of these (codes arrive in Mailpit):

| Email                       | Role                          |
| --------------------------- | ----------------------------- |
| `SEED_ADMIN_EMAIL`          | Admin                         |
| `owner@pulse.test`          | Pulse owner                   |
| `hittin.manager@pulse.test` | Pulse branch manager (Hittin) |
| `malqa.desk@pulse.test`     | Pulse front desk (Al Malqa)   |
| `sara@member.test`          | Member                        |

## Commits

Conventional Commits, enforced by commitlint. Pre-commit runs lint-staged (ESLint + Prettier).
