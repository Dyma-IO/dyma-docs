---
sidebar_position: 7
---

# Database

Dyma uses **PostgreSQL 16** (Hetzner-hosted in production) with **Prisma ORM** in [`dyma-api`](https://github.com/Dyma-IO/dyma-api). Redis backs realtime pub/sub, rate limits, and BullMQ workers.

## Local development

```bash
cd dyma-api
docker compose up -d
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Default local ports (when host ports conflict):

| Service | URL |
|---------|-----|
| Postgres | `postgresql://dyma:dyma@localhost:5434/dyma` |
| Redis | `redis://localhost:6380` |
| API | `http://localhost:4000/v1` |
| Swagger | `http://localhost:4000/docs` |

## Schema domains

| Domain | Tables | Purpose |
|--------|--------|---------|
| Identity | `users`, `wallets`, `user_emails`, `oauth_accounts` | Wallet-first auth; encrypted email |
| RBAC | `roles`, `permissions`, `role_permissions`, `user_roles`, `project_members` | Platform and project roles |
| Platform config | `platform_settings`, `feature_flags`, `platform_credentials` | Admin-managed keys (AES-256-GCM) |
| Catalog | `task_types`, `project_categories`, `quest_categories`, `tags` | Dynamic task catalog |
| Pricing | `plans`, `subscriptions`, `usage_counters` | Plans, quotas, billing |
| Content | `projects`, `campaigns`, `quests` | Project → Campaign → Quest |
| Submissions | `submissions`, `verification_attempts`, `moderation_queue` | Verification state machine |
| Files | `files`, `submission_files` | Hetzner S3 metadata |
| SEO / OG | `seo_profiles`, `og_templates`, `og_assets` | Per-entity SEO and OG renders |
| AI | `ai_providers`, `ai_prompt_templates`, `ai_generation_logs` | Admin prompts (no PII in logs) |
| API access | `api_keys` | Hashed project/platform keys |
| Audit | `audit_logs` | Credential rotation, admin actions |
| Notifications | `notification_preferences`, `notification_outbox` | SES email queue |

## Migrations

| Command | When |
|---------|------|
| `npx prisma migrate dev` | Local schema changes |
| `npx prisma migrate deploy` | Staging / production (Hetzner) |
| `npx prisma db seed` | Seed plans, 67 task types, roles, default OG template |

## Seed data

- **Plans:** Free, Starter, Growth, Pro, Enterprise
- **Task types:** imported from `@dyma-io/shared` `TASK_TYPE_CATALOG`
- **Roles:** `super_admin`, `dyma_moderator`, `project_admin`, `project_moderator`
- **OG template:** default 1200×630 layout with non-disableable Dyma logo

## Production operations (Hetzner)

- TLS required for Postgres connections
- App DB user with least privilege (no superuser)
- Daily backups: Hetzner snapshots + `pg_dump` to object storage
- Optional connection pooling via PgBouncer or Prisma Accelerate
- Redis key namespaces: `cache:`, `ratelimit:`, `pubsub:`, `queue:`

## Environment variables

See `dyma-api/.env.example` for `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CREDENTIALS_MASTER_KEY`, and integration fallbacks.
