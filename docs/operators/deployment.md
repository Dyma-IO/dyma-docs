---
sidebar_position: 2
---

# Deployment

Each app runs as a PM2 process behind nginx on a self-managed VPS; the docs are static files. The
testnet stack is the only deployed environment today.

## Topology

| Service | Testnet host | Port | PM2 app | Health check |
|---|---|---|---|---|
| API | `testnet.api.dyma.io` | 4700 | `testnet-api` | `GET /v1/health/ready` (Postgres, Redis, workers) |
| Landing | `testnet.landing.dyma.io` | 4701 | `testnet-landing` | `GET /` |
| Earner app | `testnet.app.dyma.io` | 4702 | `testnet-app` | `GET /` |
| Admin | `testnet.admin.dyma.io` | 4703 | `testnet-admin` | `GET /login` |
| Studio | `testnet.studio.dyma.io` | 4704 | `testnet-studio` | `GET /login` |
| Docs | `testnet.docs.dyma.io` | static | — | `GET /docs/intro` |
| PostgreSQL 16 | local | 5432 | | |
| Redis 7 | local | 6379 (db 3) | | |

```
Browser ──► Next.js app (same-origin /api/* BFF, httpOnly session cookie)
              └─ server-side fetch ─► API /v1/... ─► Postgres, Redis (BullMQ), chain REST/RPC,
                                                     S3, SES, X/Discord/Telegram/GitHub/YouTube
```

## Release deploys

Every repository ships `deploy/deploy.sh` with the same model:

```
<APP_ROOT>/repo/                 git clone: fetched, never built, never served
<APP_ROOT>/releases/<id>/app/    one build per deploy (<id> = UTC time + commit)
<APP_ROOT>/current -> …          what PM2 (or nginx, for the docs) serves — switched atomically
<APP_ROOT>/previous -> …         rollback target
<APP_ROOT>/shared/.env           env file linked into each release (never in git)
```

1. Fetch the commit (`origin/main`, or `--ref`), export it into a **new release directory**.
2. dyma-shared is built **once per commit** into `/home/dyma/shared-builds/<sha>` (shared by every
   app deploy, under a lock) and copied next to the release.
3. `npm ci` and the build run inside the new release; the live one is never touched.
4. API only: when migrations are pending, a `pg_dump -Fc` backup is taken, then
   `prisma migrate deploy` runs — **after** the build succeeded.
5. `current` is switched atomically and PM2 reloads from it.
6. The health check must pass, then pass again after a stability delay with PM2 reporting the
   process online. Otherwise `current` is switched back and the previous release reloaded.
7. Old releases are pruned (current and previous are always kept).

`deploy/deploy.sh --rollback` switches back by hand, `--status` lists releases. The script re-runs
itself from the commit being deployed, so deploy changes apply on the next run. Migrations must stay
backward compatible: a rollback restores the code, not the schema (restore the dump with
`pg_restore` if a migration has to be undone). Each repository's `deploy/README.md` has the full
procedure, including the one-time move from the former in-place layout.

## nginx

Each repository has a vhost in `deploy/nginx/`. Two settings matter for Dyma:

**X-Forwarded-For.** Every vhost appends the peer address:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-Proto $scheme;
```

The API and the BFFs read the client address `TRUSTED_PROXY_HOPS` entries from the right (1 =
this nginx). With a CDN in front, set 2. The BFFs then forward it to the API as `X-Dyma-Client-IP`,
trusted only with the matching `X-Dyma-Bff-Key` (`BFF_SHARED_SECRET`).

**Server-sent events.** Submission and notification streams must not be buffered and must stay open
(the API pings every 25 seconds):

```nginx
location /v1/realtime/ {                 # API vhost; also /v1/notifications/stream
    proxy_pass http://dyma_api;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    gzip off;
    proxy_read_timeout 1h;
}
```

The client (`/api/stream/`) and Studio (`/api/studio/realtime/`) vhosts do the same for their
BFF streams, which also answer `X-Accel-Buffering: no`. The API vhost upgrades `/socket.io/` for
the Studio and admin realtime namespaces and allows 12 MB request bodies (uploads are capped at
10 MB). Testnet vhosts add `X-Robots-Tag: noindex`.

## WalletConnect

1. Create a project in WalletConnect Cloud (Reown) and add the app origins (earner app and Studio)
   to its allowed domains.
2. Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in the client and Studio env files (and
   `WALLETCONNECT_PROJECT_ID` in the API), then **rebuild** both apps: the id is baked into the
   bundle and switches the WalletConnect hosts into the CSP.

Without it, WalletConnect is hidden and only browser-extension wallets are offered.

## First boot of an environment

1. API env file, first deploy (migrates an empty database).
2. `npm run prisma:seed` in `<APP_ROOT>/current` (plans, task types, roles, Safrochain chains,
   settings, the bootstrap super admin).
3. Testnet only: `npm run prisma:seed:demo` (demo projects and personas; never on production).
4. Admin: sign in, enable 2FA, configure integrations, billing settings and — when the contracts are
   deployed — escrow contracts and keys ([Escrow operations](./escrow-operations)).

## CI

Every repository runs GitHub Actions on pull requests and `main` (Node 22). The API job runs lint,
`prisma validate`, migrations on an empty Postgres, a schema-drift check (`prisma migrate diff
--exit-code`), both seeds, the build, unit tests and a production-mode boot that must answer
`/v1/health/ready`. The apps typecheck, lint and build; dyma-shared runs its tests and checks its
package entries. Private sibling checkouts need the `DYMA_SHARED_CHECKOUT_TOKEN` secret.

## Operations checklist

- Nightly `pg_dump` to object storage, and a tested restore — the deploy dumps are a safety net only.
- `pm2 install pm2-logrotate`; uptime checks on each vhost and on `/v1/health/ready`.
- `BULLMQ_PREFIX` per environment when Redis is shared.
- Watch the admin inbox: escrow alerts, billing alerts, integration health.
