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
- **State**: Zustand v5 (with `persist` middleware to localStorage — used for multi-page bill draft)
- **Package Manager**: pnpm

## Project Structure
```
src/
├── app/                # Next.js routing only (pages, layouts, API routes)
│   ├── (auth)/         # Auth pages (login, register) — centered layout
│   ├── (dashboard)/    # Protected pages — dashboard layout
│   └── api/auth/       # NextAuth API routes
├── features/           # Feature modules (auth, bills, groups, etc.)
│   └── auth/           # components/, actions/, schemas/, repositories/
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
- **Feature-based structure**: Each feature has its own folder under `src/features/` with `components/`, `actions/`, `schemas/`, `repositories/`, and `types.ts` when needed.
- **Routing stays thin**: `src/app/` only handles routing. Business logic (including server actions) lives in `src/features/`.
- **Repository pattern**: All database queries live in `repositories/` inside each feature (e.g. `src/features/auth/repositories/user-repository.ts`). Server actions and other callers must never query the database directly — always go through repository functions.
- **Server Actions** for form submissions and mutations (not REST API routes). Actions handle validation and business logic but delegate data access to repositories.
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
| `transaction_statuses` | `src/db/schema/transaction-statuses.ts` | Lookup table — seed with `OPEN`, etc. |
| `transaction_item_types` | `src/db/schema/transaction-item-types.ts` | Lookup table — seed with `ITEM`, `TAX`, `SERVICE_CHARGE`, `ADDITIONAL` |
| `transactions` | `src/db/schema/transactions.ts` | Owner (`user_id` → `users.id`), status FK |
| `transaction_items` | `src/db/schema/transaction-items.ts` | Line items; `type_id` FK → `transaction_item_types`; `quantity` int; `price` is negative for ADDITIONAL discount rows |
| `transaction_item_add_ons` | `src/db/schema/transaction-item-add-ons.ts` | Optional add-ons per item; `quantity` int |
| `transaction_item_users` | `src/db/schema/transaction-item-users.ts` | People sharing an item — `display_name` is free-text (allows non-registered users) |

FK chain: `transactions` → `transaction_items` (→ `transaction_item_types`) → `transaction_item_add_ons` / `transaction_item_users`.

## Bill Creation Flow

Two-page flow, state persisted in Zustand store (`bill-draft-v1` localStorage key, cleared on submit):

1. **Create Bill** (`/dashboard/bills/new`) — fill title, items (with add-ons, qty, price), tax/service charge (flat Rp), additional charges (toggle Charge/Discount). Live total shown in `BillSummary`. Validates with `billDraftSchema` before navigating.
   - **Scan Bill** button in the Items section header opens a modal to upload or capture a receipt photo. Gemini AI extracts the receipt into structured JSON and populates the draft store via `loadDraft()`. If the draft is non-empty, the user must confirm before replacing.
2. **Split Bill** (`/dashboard/bills/new/split`) — add customers (display name only), each customer selects which ITEM rows they share. TAX/SERVICE/ADDITIONAL auto-assigned to all customers. Validation: every item needs ≥1 customer. Submits via `createBillAction`.

**Persistence model**: TAX, SERVICE_CHARGE, ADDITIONAL are stored as `transaction_items` rows — same query pattern as ITEM for per-customer split calculation.

Feature module: `src/features/bills/` — `components/`, `stores/`, `schemas/`, `actions/`, `repositories/`, `lib/`, `types.ts`.

Key files:
- Store: `src/features/bills/stores/bill-draft-store.ts` — includes `loadDraft(ScanBillResult)` to atomically populate from AI scan
- Calculations: `src/features/bills/lib/calculations.ts`
- Repo (DB transaction): `src/features/bills/repositories/bill-repository.ts`
- Scan action: `src/features/bills/actions/scan-bill.ts` — server action; accepts `image` File via FormData, calls Gemini API, returns `ScanBillResult`
- Scan modal: `src/features/bills/components/scan-bill-modal.tsx`
- Scan schema: `src/features/bills/schemas/scan-bill-schema.ts`

## AI Bill Scanning (Gemini)

Receipt scanning uses the Google Gemini API (`@google/genai` SDK).

- **Env var**: `GEMINI_API_KEY` — required for the scan feature.
- **Model**: stored in `general` table under key `gemini.model` (default `gemini-2.5-flash`, seeded by `src/db/seed.ts`). Change the DB row to switch models without redeployment.
- **General key**: `GENERAL_KEYS.geminiModel` = `"gemini.model"`.
- Image is passed as base64 `inlineData`. Response is forced to JSON via `responseMimeType: "application/json"` + `responseJsonSchema`.
- Max image size enforced client-side and server-side: 8 MB.

## Bill Detail (Public)

Bill detail pages are publicly accessible at `/bills/[id]` — no login required. The UUID in the URL is the access secret (URL-as-secret, no separate share-link table).

- Route: `src/app/bills/[id]/page.tsx` + `layout.tsx` (public layout, outside `(dashboard)` group)
- Header is adaptive: logged-in users see UserMenu + back-to-dashboard button; anonymous visitors see "Sign in" and "Create account" CTAs.
- Share button (`src/features/bills/components/share-bill-button.tsx`) in the detail hero card uses Web Share API on mobile, clipboard copy with 2s "Copied ✓" feedback on desktop.
- `ROUTES.billDetail(id)` resolves to `/bills/${id}`.
- `findBillByIdWithDetails(billId)` (no `userId` param) — public lookup, returns `ownerId` field. Owner-scoped reads (`findBillsByUserId`) are unchanged.

## Auth Flow
- **Registration** (`/register`) creates users with `isActive: false` (matches the schema default). Admin must flip `users.is_active` to `true` before the user can log in.
- **Login** (`/login`) pre-checks credentials in the server action. If the password is correct but the account is inactive, it fetches the admin contact email from the `general` table (key: `auth.admin_email`, fallback: `admin@example.com`) and returns it in the error message; otherwise `signIn("credentials", …)` is called. NextAuth's `authorize()` also rejects inactive users as a second layer of defense.
- **Sign-out** goes through `signOutAction` in `src/features/auth/actions/sign-out.ts`.
- **Change password** (`/dashboard/change-password`) verifies the current password via `bcrypt.compare`, hashes the new one, updates `users.password` (and `updated_at` manually — Drizzle does not auto-update), then signs the user out and redirects to `/login`. Accessible from the username dropdown in the dashboard header.
- **Middleware** (`src/middleware.ts`) redirects authenticated users away from `/login` and `/register`, and unauthenticated users to `/login` for any protected route. The `/dashboard/:path*` matcher automatically covers `/dashboard/change-password` — no middleware change needed for new dashboard sub-routes.

## Environment Variables
See `.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate with `openssl rand -base64 32`)
- `AUTH_URL` — App URL (http://localhost:3000 for dev)
