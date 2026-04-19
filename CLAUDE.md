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
│   ├── constants/      # App-wide constants (routes, etc.)
│   └── lib/            # Utility functions (cn helper)
├── db/                 # Database layer
│   ├── schema/         # Drizzle table schemas
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
- Import alias: `@/*` maps to `./src/*`.

## Auth Flow
- **Registration** (`/register`) creates users with `isActive: false` (matches the schema default). Admin must flip `users.is_active` to `true` before the user can log in.
- **Login** (`/login`) pre-checks credentials in the server action. If the password is correct but the account is inactive, it returns a specific "contact <admin-email>" error (address comes from `AUTH_ADMIN_EMAIL`); otherwise `signIn("credentials", …)` is called. NextAuth's `authorize()` also rejects inactive users as a second layer of defense.
- **Sign-out** goes through `signOutAction` in `src/features/auth/actions/sign-out.ts` (not an inline server action in the layout).
- **Middleware** (`src/middleware.ts`) redirects authenticated users away from `/login` and `/register`, and unauthenticated users to `/login` for any protected route.

## Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate with `openssl rand -base64 32`)
- `AUTH_URL` — App URL (http://localhost:3000 for dev)
- `AUTH_ADMIN_EMAIL` — Address shown to users when their account is inactive (fallback: `admin@example.com`)
