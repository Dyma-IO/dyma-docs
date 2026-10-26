---
description: How Dyma UTXO is deployed, as a stack of its own built from Dyma's code.
---

import {Host} from '@site/src/components/Edition';

# Deployment

Dyma UTXO is a stack of its own built from Dyma's code: the API, the landing page, the earner app,
Studio, Admin and these docs, on its own domain and subdomains, with its own services, database,
Redis, secrets, integrations and certificates. It may share a server with another deployment, never
anything else. The procedures below are those of every Dyma deployment; Dyma UTXO's step-by-step
production runbook (provisioning, DNS, certificates, secrets, go-live checks) is kept in Dyma's
private operations repository.

## The hosts

| Host | App | Health check |
|---|---|---|
| <Host /> | landing (`dyma-landing`) | `GET /` |
| <Host sub="app" /> | earner app (`dyma-client`) | `GET /` |
| <Host sub="studio" /> | Studio (`dyma-studio`) | `GET /login` |
| <Host sub="admin" /> | Admin (`dyma-admin`) | `GET /login` |
| <Host sub="api" /> | API (`dyma-api`) | `GET /v1/health/ready` (Postgres, Redis, workers) |
| <Host sub="docs" /> | these docs (`dyma-docs`), static files | `GET /docs/intro` |

## Release deploys

Every repository ships `deploy/deploy.sh` with the same model:

```
<APP_ROOT>/repo/                 git clone: fetched, never built, never served
<APP_ROOT>/releases/<id>/app/    one build per deploy (<id> = UTC time + commit)
<APP_ROOT>/current -> …          what the service (or nginx, for the docs) serves, switched atomically
<APP_ROOT>/previous -> …         rollback target
<APP_ROOT>/shared/.env           env file linked into each release (never in git)
```

1. Fetch the commit (`origin/main`, or `--ref`) and export it into a **new release directory**.
2. `npm ci` and the build run inside the new release; the live one is never touched. The edition is
   part of the environment: `DYMA_EDITION=utxo` in the API's env file, `NEXT_PUBLIC_DYMA_EDITION=utxo`
   when the apps are built.
3. API only: when migrations are pending, a database backup is taken, then `prisma migrate deploy`
   runs, **after** the build succeeded.
4. `current` is switched atomically and the service restarts from it.
5. The health check must pass, or `current` is switched back and the previous release restarted.
6. Old releases are pruned (current and previous are always kept).

`deploy/deploy.sh --rollback` switches back by hand, `--status` lists releases. Migrations must stay
backward compatible: a rollback restores the code, not the schema.

### These docs

```bash
DOCS_EDITION=utxo DOCS_URL=https://docs.<domain> DOCS_BASE_URL=/ deploy/deploy.sh
```

The script passes `DOCS_EDITION` to the build, records it in the release's `DEPLOY_INFO`, refuses
`DOCS_EDITION=utxo` without `DOCS_URL`, and refuses a build whose homepage is not titled "Dyma UTXO
Docs". The links and contact addresses of the site come from `DOCS_URL`.

## nginx

Each repository has a vhost in `deploy/nginx/`. Two settings matter.

**X-Forwarded-For.** Every vhost appends the peer address:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-Proto $scheme;
```

The API and the apps' servers read the client address `TRUSTED_PROXY_HOPS` entries from the right (1
= this nginx). With a CDN in front, set 2.

**Server-sent events.** Submission, notification and payment streams (the live status of a plan
payment request) must not be buffered and must stay open (the API pings every 25 seconds):

```nginx
location /v1/realtime/ {                 # API vhost; also /v1/notifications/stream
    proxy_pass http://<api upstream>;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    gzip off;
    proxy_read_timeout 1h;
}
```

The earner app's and Studio's own stream routes are configured the same way in their vhosts.

## First boot

1. API env file (see [Environment](./environment)), first deploy (migrates an empty database).
2. `npm run prisma:seed` with `DYMA_EDITION=utxo`: plans, task types, roles, settings, the Cardano
   chains (and no other chain), the bootstrap super admin. Badge claims start closed.
3. Admin: sign in, enable 2FA, configure the integrations (Blockfrost, sign-in providers, e-mail)
   and the [billing settings](./billing-settings) (the treasury key).
4. Once the contracts are deployed on the network: register the escrow and the badges, store the hot
   keys and turn the escrow on ([Escrow operations](./escrow-operations)). The contracts are deployed
   by the procedure of their public
   [runbook](https://github.com/Dyma-IO/dyma-contracts-cardano/blob/main/docs/RUNBOOK.md).

## After a deploy

- `GET /v1/health/ready` on the API answers 200.
- The earner app signs in with a Cardano wallet (Lace, for example).
- Studio connects a wallet and quotes a plan in ADA.
- Admin → Escrow → Cardano shows each registry's keys as matching, once the escrow is registered.
