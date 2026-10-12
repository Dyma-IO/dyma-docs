---
sidebar_position: 8
---

# Database

Dyma uses **PostgreSQL 16** with **Prisma 6** in [`dyma-api`](https://github.com/Dyma-IO/dyma-api).
Redis backs caching, nonces, pub/sub, rate limits and BullMQ queues.

## Local development

```bash
# dyma-shared must sit next to dyma-api and be built
cd ../dyma-shared && npm install && npm run build && cd ../dyma-api

docker compose up -d                 # Postgres :5434, Redis :6380 (+ --profile s3 for local S3)
cp .env.example .env                 # set JWT_SECRET and CREDENTIALS_MASTER_KEY (openssl rand -hex 32)
npm install
npm run prisma:generate
npm run prisma:migrate               # dev only
npm run prisma:seed                  # catalog every environment needs
FILES_DRIVER=local npm run prisma:seed:demo   # optional demo data
npm run start:dev
```

| Service | URL |
|---|---|
| Postgres | `postgresql://dyma:dyma@localhost:5434/dyma` |
| Redis | `redis://localhost:6380` |
| API | `http://localhost:4000/v1` |
| Swagger | `http://localhost:4000/docs` |

## Schema domains

| Domain | Main tables |
|---|---|
| Identity | `users`, `wallets`, `user_emails`, `oauth_accounts` |
| Access | `roles`, `permissions`, `user_roles`, `project_members`, `admin_users`, `api_keys` |
| Platform config | `platform_settings`, `platform_credentials` (AES-256-GCM), `chains`, `chain_contracts` |
| Catalog | `task_types`, `project_categories`, `quest_categories`, `tags` |
| Content | `projects`, `campaigns`, `quests` |
| Submissions | `submissions`, `verification_attempts`, `moderation_queue`, `chain_tx_claims` |
| Distribution | `campaign_distributions`, `campaign_escrows`, `campaign_allocations`, `chain_operations` |
| Billing | `plans`, `subscriptions`, `usage_counters`, `invoices`, `payment_intents`, `billing_payment_txs` |
| Engagement | `promotions`, `platform_broadcasts`, `announcements`, `notifications`, `admin_notifications` |
| Files, SEO | `files`, `submission_files`, `seo_profiles`, `og_templates` |
| Audit | `audit_logs` |

## Migrations

| Command | When |
|---|---|
| `npm run prisma:migrate` (`prisma migrate dev`) | local schema changes only |
| `npm run prisma:deploy` (`prisma migrate deploy`) | servers; the deploy script runs it after a successful build and a backup |
| `npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code` | CI: the migrated database must equal the schema |

Migrations run while the previous release still serves: keep them backward compatible.

## Seeds

- `npm run prisma:seed` — plans, roles and permissions, task types (from `@dyma-io/shared`),
  categories, tags, the default card template, Safrochain mainnet and testnet chains, moderation and
  security settings, the bootstrap super admin. Re-running is safe: admin edits are kept and the
  bootstrap password is only reset with `ADMIN_BOOTSTRAP_RESET=true`.
- `npm run prisma:seed:demo` — demo projects, campaigns, quests, personas (`*@demo.dyma.io`, shared
  password), streaks, lucky draws, a manual USDC campaign, an ended campaign with partial payouts,
  promotions, broadcasts, invoices. Works without S3 (`FILES_DRIVER=local`,
  `DEMO_IMAGES_OFFLINE=true`). Never on production.

## Production operations

- TLS to Postgres when it is not local; an application user without superuser rights.
- Nightly `pg_dump` to object storage and a tested restore; the deploy script also dumps before
  each release that migrates.
- `BULLMQ_PREFIX` per environment when Redis is shared.
