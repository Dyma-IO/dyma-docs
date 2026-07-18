---
sidebar_position: 6
---

# Integrations

Dyma stores third-party credentials in **`platform_credentials`** (encrypted at rest). Super admins configure providers in **admin.dyma.io → Settings → Credentials**. The API never returns decrypted secrets to clients.

## Tier 1 platforms

| Platform | Provider key | Used for |
|----------|--------------|----------|
| X / Twitter | `twitter` | Follow, like, retweet, hashtag tasks |
| Discord | `discord` | Join server, role verification |
| Telegram | `telegram` | Join group/channel, bot start |

### Discord app credentials

Configure in **admin.dyma.io → Integrations → Discord**.

| Secret / variable key | Required | Purpose |
|-----------------------|----------|---------|
| `clientId` | Yes | Discord application (OAuth2) client id |
| `clientSecret` | Yes | OAuth2 client secret |
| `botToken` | Yes | Bot token for guild membership and role checks |
| `publicKey` | No | Interactions public key (stored for webhook verify) |
| `botPermissions` | No | Bot-install OAuth permission bitfield (default `1024` = View Channels) |

Empty fields on save keep the currently stored value (partial rotate). Redirect URIs are derived from `AUTH_CALLBACK_BASE_URL` and shown in Admin (auth callback, link callback, bot-install callback).

| Endpoint | Description |
|----------|-------------|
| `GET /v1/admin/discord/setup` | Masked setup info, editable key list, redirect URIs |
| `PUT /v1/admin/credentials/discord` | Create or rotate secrets (merged) |
| `POST /v1/admin/credentials/discord/test` | Bot token `getMe` check |

### Telegram bot credentials

Configure in **admin.dyma.io → Integrations → Telegram** (or Credentials).

| Secret key | Purpose |
|------------|---------|
| `botToken` | BotFather token (required) |
| `webhookSecret` | Auto-generated on webhook register; sent as `X-Telegram-Bot-Api-Secret-Token` |

Metadata may include `botUsername`, `webhookUrl`, `webhookSetAt`.

| Endpoint | Description |
|----------|-------------|
| `PUT /v1/admin/credentials/telegram` | Save `{ botToken }` |
| `POST /v1/admin/credentials/telegram/test` | `getMe` connectivity check |
| `POST /v1/admin/telegram/register-webhook` | `setWebhook` to `{API_PUBLIC_URL}/v1/telegram/webhook` |

Set `API_PUBLIC_URL` on the API so Telegram can reach the webhook (ngrok or production API origin).

## Infrastructure providers

| Provider | Key | Purpose |
|----------|-----|---------|
| Hetzner Object Storage | `hetzner_s3` | Evidence uploads, covers, OG assets |
| AWS SES | `aws_ses` | Transactional email outbox |
| AI provider | `ai_provider` | SEO assistant, AI verify tasks |
| Stripe | `stripe` | Subscriptions and billing webhooks |

## Admin credential API

| Endpoint | Description |
|----------|-------------|
| `GET /v1/admin/credentials` | Masked metadata only |
| `PUT /v1/admin/credentials/:provider` | Create or rotate secrets |
| `POST /v1/admin/credentials/:provider/test` | Connectivity check |

All writes are recorded in `audit_logs`.

## File uploads (Hetzner S3)

```
Client/Studio → POST /v1/files/presign
  → presigned PUT URL (15 min TTL)
  → direct upload to bucket
  → POST /v1/files/:id/confirm
```

Buckets: `dyma-uploads` (evidence), `dyma-assets` (covers, OG).

## Project REST verification

Growth+ plans can register a custom verification endpoint per project. Dyma signs outbound requests with HMAC-SHA256 (`X-Dyma-Signature`). See [Verification](./verification.md#project-rest-api).

## Realtime

Redis pub/sub feeds:

- `GET /v1/realtime/submissions` (SSE) — submission status for users
- WebSocket `/v1/realtime/studio` — moderation queue events
- WebSocket `/v1/realtime/admin` — KPI and credential expiry alerts

| `npm run test:ses` | Validate SES credentials; optional `TEST_SES_TO` sends multipart HTML sample |
| `npm run preview:mail` | Render all templates to `tmp/email-previews/` (run `npm run build` first) |

## Transactional email (AWS SES)

Mail is sent from **dyma-api** via the `notification_outbox` queue and BullMQ worker. Templates are branded HTML + plain text (logo header, footer, security notice).

### Environment

| Variable | Purpose |
|----------|---------|
| `AWS_SES_REGION` | SES region |
| `AWS_SES_FROM` | From address |
| `AWS_SES_USER_NAME` | IAM access key ID |
| `AWS_SES_PASSWORD` | IAM secret access key |
| `MAIL_LOGO_URL` | Hosted logo image URL |
| `MAIL_SUPPORT_EMAIL` | Footer support address |
| `STUDIO_APP_URL` / `ADMIN_APP_URL` / `CLIENT_APP_URL` | CTA links per app |

### Template IDs (selection)

| ID | Use |
|----|-----|
| `studio.signup_verify_otp` | Studio signup email verification |
| `studio.password_reset` | Studio forgot password |
| `admin.password_reset` | Admin forgot password |
| `notify.claimable_rewards` | Quest reward ready (respects prefs) |
| `billing.payment_failed` | Stripe invoice failure |
| `wallet.email_link_otp` | On-chain email link verification |
| `quest.email_link_otp` | Verified Email quest OTP (project + quest context) |
| `studio.moderator_invite` | Project moderator invite |

Full list: `@dyma-io/shared` → `MAIL_TEMPLATE_IDS`.

## Client SDK

OpenAPI is exported to `dyma-api/openapi.json`. The `@dyma-io/api-client` package provides a typed fetch wrapper for client, studio, and admin apps.

See also [Authentication](./authentication.md) for Keplr, Google, and Twitter sign-in.

```bash
cd dyma-api
npm run generate:api-client
```
