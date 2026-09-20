# Rustine — agent workstreams

## A — Scaffold
- [x] Next.js App Router + TypeScript + Tailwind + shadcn/ui
- [x] Prisma PostgreSQL, env, README, OpenAPI copy

## B — Aurora SDK
- [x] Typed client `src/server/aurora/client.ts`
- [x] Mocks + envelope unwrap + 429 retry
- [x] Unit tests for validate + unwrap

## C — Auth + shell UI
- [x] Cookie sessions, seed users
- [x] Login, sidebar, topbar, dark fintech theme

## D — Wallet + Spend
- [x] Wallet ledger + attribution column
- [x] Spend by user (charts + CSV)

## E — Accounts + mutations
- [x] List/detail, top-up, clear-funds, BM share
- [x] ActionLog + SpendAttribution

## F — Applications
- [x] List, detail, messages, create (META begin+create)

## G — QA
- [x] `pnpm test`, `pnpm build`, `pnpm verify`
- [x] `RUSTINE_DONE.md`
