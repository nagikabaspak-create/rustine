# Rustine

Panel interne **Rustine** pour Micha et Xian Mu : wallet Aurora / Vantage, ad accounts, top-ups, attribution locale « qui a dépensé quoi », et simulation Meta Ads.

UI sombre fintech (`#0B0F14` / `#121821` / accent `#5B8CFF`). Next.js App Router, Prisma **PostgreSQL**, sessions cookie.

Sans `AURORA_API_KEY` ni tokens Meta, l’app tourne entièrement en **mocks** (démo Vercel).

## Setup local (< 5 min)

PostgreSQL doit tourner (local, Docker, Neon, etc.).

```bash
pnpm install
cp .env.example .env
# Renseigner DATABASE_URL (Postgres) et AUTH_SECRET.
# Laisser AURORA_* et META_* vides pour les mocks.
pnpm prisma migrate deploy
pnpm db:seed
pnpm dev
```

Ouvrir [http://127.0.0.1:43147](http://127.0.0.1:43147).

`pnpm build` exécute generate + migrate + seed + `next build` (il faut un `DATABASE_URL` Postgres joignable).

### Comptes seed

| Email | Mot de passe | Rôle |
|---|---|---|
| `micha@rustine.local` | `RustineMicha!2026` | ADMIN |
| `xianmu@rustine.local` | `RustineXian!2026` | OPERATOR |

### Variables d’environnement

Voir `.env.example` (aucun secret réel dans le dépôt) :

- `DATABASE_URL` — PostgreSQL. Sur Vercel Postgres, `POSTGRES_PRISMA_URL` / `POSTGRES_URL` sont aussi acceptés au build.
- `AUTH_SECRET` — secret des cookies de session (min. 16 caractères)
- `AURORA_API_KEY` — header `X-API-Key`. **Vide = mocks locaux / DRY_RUN**
- `AURORA_BASE_URL` — défaut `https://vantage-api.agency-aurora.com`
- `META_ACCESS_TOKEN` / `META_PAGE_ACCESS_TOKEN` — **vide = module Meta en simulation**. Un token non vide bascule le client Graph en live
- `META_AD_ACCOUNT_ID`, `META_PAGE_ID`, `META_GRAPH_VERSION` (défaut `v21.0`)
- `META_WEBHOOK_VERIFY_TOKEN` — optionnel pour `GET /api/webhooks/meta`

## Vercel (Hobby)

1. Importer le repo GitHub `nagikabaspak-create/rustine`.
2. Provisionner **Neon** ou **Vercel Postgres** (gratuit) et définir `DATABASE_URL` (Production).
3. Définir `AUTH_SECRET` (ex. `openssl rand -base64 48`).
4. Laisser `AURORA_API_KEY`, `META_ACCESS_TOKEN` et `META_PAGE_ACCESS_TOKEN` **vides** pour la démo mock.
5. Framework : Next.js. Build : `pnpm build` (migrate + seed + next build).
6. Déployer Production. URL attendue : `https://rustine-*.vercel.app`.

## Scripts

```bash
pnpm dev          # http://127.0.0.1:43147
pnpm build        # postgres DATABASE_URL requis
pnpm test
pnpm verify       # build + tests + smoke login → RUSTINE_DONE.md
```

## Pages

- `/login` — connexion
- `/` — tableau de bord
- `/wallet` — ledger + colonne « Par qui »
- `/accounts` et `/accounts/[id]` — comptes, top-up, clear funds, BM share
- `/applications` — demandes + messages + création META
- `/spend` — split Micha / Xian Mu + CSV
- `/audit` — journal des mutations Rustine
- `/settings` — profil + mapping UUID Aurora optionnel
- `/meta/inbox` — commentaires ads/posts (simulation), réponse / masquage / suppression + suggestion IA (jamais auto-envoyée)
- `/meta/ads` — aperçu campagnes / pubs, pause / reprise
- `/meta/guardrails` — coupe-circuit, plafonds, explication rate limit ≠ token mort

Chaque mutation (top-up, clear-funds, BM share, application, actions Meta) écrit un `ActionLog` et, le cas échéant, une `SpendAttribution`.

OpenAPI Aurora : `docs/aurora-openapi.json`.

Le client Meta (`src/server/meta/`) lit les headers de throttle Graph, backoff sur 4 / 17 / 613 / 8000x, et **ne retry pas** l’erreur 190 (token invalide).
