# My Split Bill

## Overview
Fullstack split-bill app built on Next.js 15 (App Router). Frontend and backend live in the same codebase.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: NextAuth v5 (Credentials provider, JWT session)
- **Validation**: Zod v4 + React Hook Form
- **Package Manager**: pnpm

## Project Structure
```
src/
├── app/                # Next.js routing only (pages, layouts, API routes)
│   ├── (auth)/         # Auth pages (login, register) — centered layout
│   ├── (dashboard)/    # Protected pages — dashboard layout
│   └── api/auth/       # NextAuth API routes
├── features/           # Feature modules (auth, bills, groups, etc.)
│   └── auth/           # components/, actions/, schemas/
├── shared/             # Cross-feature shared code
│   ├── components/ui/  # Reusable UI primitives (button, input, modal)
│   ├── constants/      # App-wide constants (routes, general-keys)
│   └── lib/            # Utility functions (cn helper, general lookup)
├── db/                 # Database layer
│   ├── schema/         # Drizzle table schemas (users, general, transactions, …)
│   └── migrations/     # Generated migration files
├── lib/                # App-wide config (auth.ts)
└── middleware.ts       # Auth route protection
```

## Key Commands
```bash
pnpm dev            # Start dev server (Turbopack)
pnpm build          # Production build
pnpm lint           # Run ESLint
pnpm db:generate    # Generate Drizzle migrations from schema changes
pnpm db:migrate     # Run pending migrations
pnpm db:studio      # Open Drizzle Studio (DB GUI)
```

## Conventions
- **Feature-based structure**: Each feature has its own folder under `src/features/` with `components/`, `actions/`, `schemas/`, and `types.ts` when needed.
- **Routing stays thin**: `src/app/` only handles routing. Business logic (including server actions) lives in `src/features/`.
- **Server Actions** for form submissions and mutations (not REST API routes).
- **Zod schemas** for all validation (shared between client and server).
- **Drizzle schema** defined in `src/db/schema/` — run `pnpm db:generate` after changes.
- **Route paths** are centralised in `src/shared/constants/routes.ts` (`ROUTES.login`, `ROUTES.dashboard`, …). Don't hard-code `/login`, `/register`, `/dashboard` inline. Exception: `middleware.ts` `config.matcher` must stay as static literals (Next.js requirement).
- **General table keys** are centralised in `src/shared/constants/general-keys.ts` (`GENERAL_KEYS`). Use `getGeneralValue` / `getGeneralList` from `src/shared/lib/general.ts` to query.
- Import alias: `@/*` maps to `./src/*`.

## General Lookup Table (`general`)
A generic key-value store in the database for config and option lists.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | auto-generated |
| `key` | varchar(100) | groups related rows — not unique |
| `value` | text | the stored value |
| `created_at` / `updated_at` | timestamp | auto-set |

**Singletons** (one row per key, e.g. admin email):
```sql
INSERT INTO general (key, value) VALUES ('auth.admin_email', 'admin@yourcompany.com');
```

**Option lists** (multiple rows share the same key, e.g. select options):
```sql
INSERT INTO general (key, value) VALUES ('gender', 'male'), ('gender', 'female');
```

Query helpers: `getGeneralValue(key)` returns the first match; `getGeneralList(key)` returns all rows for that key.

## Domain Tables

Core tables for the split-bill feature (all use UUID PKs, `created_at` / `updated_at` timestamps, hard delete).

| Table | Schema file | Notes |
|---|---|---|
| `transaction_statuses` | `src/db/schema/transaction-statuses.ts` | Lookup table — seed with `pending`, `settled`, etc. |
| `transactions` | `src/db/schema/transactions.ts` | Owner (`user_id` → `users.id`), status FK, `service_charge` + `tax_charge` (numeric 10,2) |
| `transaction_items` | `src/db/schema/transaction-items.ts` | Line items belonging to a transaction |
| `transaction_item_add_ons` | `src/db/schema/transaction-item-add-ons.ts` | Optional add-ons per item (e.g. extra sauce) |
| `transaction_item_users` | `src/db/schema/transaction-item-users.ts` | People sharing an item — `display_name` is free-text (allows non-registered users) |

FK chain: `transactions` → `transaction_items` → `transaction_item_add_ons` / `transaction_item_users`.

## Auth Flow
- **Registration** (`/register`) creates users with `isActive: false` (matches the schema default). Admin must flip `users.is_active` to `true` before the user can log in.
- **Login** (`/login`) pre-checks credentials in the server action. If the password is correct but the account is inactive, it fetches the admin contact email from the `general` table (key: `auth.admin_email`, fallback: `admin@example.com`) and returns it in the error message; otherwise `signIn("credentials", …)` is called. NextAuth's `authorize()` also rejects inactive users as a second layer of defense.
- **Sign-out** goes through `signOutAction` in `src/features/auth/actions/sign-out.ts`.
- **Middleware** (`src/middleware.ts`) redirects authenticated users away from `/login` and `/register`, and unauthenticated users to `/login` for any protected route.

## Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate with `openssl rand -base64 32`)
- `AUTH_URL` — App URL (http://localhost:3000 for dev)
