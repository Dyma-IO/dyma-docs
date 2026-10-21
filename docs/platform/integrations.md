---
sidebar_position: 7
---

# Integrations and credentials

Third-party credentials are stored encrypted (AES-256-GCM under `CREDENTIALS_MASTER_KEY`) in
`platform_credentials` and managed in **Admin → Integrations** / **Settings → Credentials**. The API
never returns decrypted secrets; stored credentials take precedence over environment variables.

| Endpoint | Description |
|---|---|
| `GET /v1/admin/credentials` | masked metadata only |
| `PUT /v1/admin/credentials/:provider` | create or rotate (empty fields keep the stored value) |
| `POST /v1/admin/credentials/:provider/test` | connectivity check |
| `GET /v1/admin/integrations/health` | X, Discord (incl. Message Content intent), Telegram webhook, YouTube quota, GitHub rate limit, SES quota, file storage — 4 s per check, cached 60 s |

Every write is audit-logged.

## Providers

| Provider | Key | Used for |
|---|---|---|
| X | `twitter` | sign-in and X quest checks; the app bearer token (`bearerToken`, or `TWITTER_BEARER_TOKEN`) serves app-only lookups: Studio target resolution and the X Spaces quests |
| Discord | `discord` | sign-in, account linking, the Dyma bot (join, role, message quests) |
| Telegram | `telegram` | the Dyma bot that links earners' Telegram accounts |
| GitHub | `github` | sign-in, account linking, project repository authorization |
| YouTube | `youtube` | account linking, subscribe/like checks, metadata (optional API key) |
| Google | `google` | sign-in |
| S3 storage | `hetzner_s3` | uploads (any S3-compatible bucket) |
| AWS SES | `aws_ses` | e-mail (read from the environment in practice) |
| Anthropic (Claude API) | `anthropic` | Dyma AI review: `apiKey`, and `workspaceId` for keys not scoped to a workspace (Admin → Integrations → Claude) |
| AI provider | `ai_provider` | reserved (unused) |
| Stripe | `stripe` | kept but disabled; Stripe secrets are read from the environment |
| Escrow keys | `escrow_operator`, `escrow_ticket`, `escrow_pauser` | the escrow's hot keys in mnemonic mode, super admin only, write-only (Admin → Settings → Credentials shows the derived address and balance) — see [Escrow operations](../operators/escrow-operations) |

## Discord

| Secret | Required | Purpose |
|---|---|---|
| `clientId`, `clientSecret` | yes | OAuth2 application |
| `botToken` | yes | the Dyma bot: membership, roles, messages |
| `publicKey` | no | interactions public key |
| `botPermissions` | no | the install link always uses View Channels + Read Message History (66560) |

**Message Content intent.** Quests that require a message *containing* a text need Discord's
privileged Message Content intent on the application: Discord Developer Portal → your application →
**Bot** → *Privileged Gateway Intents* → **Message Content Intent** (applications in more than 100
servers need Discord's approval for it). Dyma detects the intent (cached for 10 minutes) and reports
it in `GET /v1/admin/discord/setup` and the integrations health page; while it is off, Studio
disables the "message must contain" option and such checks return a configuration error.

Redirect URIs are derived from `AUTH_CALLBACK_BASE_URL` and shown in Admin (sign-in callback, link
callback, bot-install callback).

## Telegram

| Secret | Purpose |
|---|---|
| `botToken` | the Dyma bot (BotFather token) |
| `webhookSecret` | generated when the webhook is registered; sent by Telegram as `X-Telegram-Bot-Api-Secret-Token` |

`POST /v1/admin/telegram/register-webhook` points Telegram at `{API_PUBLIC_URL}/v1/telegram/webhook`
(set `API_PUBLIC_URL`). Projects register their own bots in Studio; their webhook is
`/v1/telegram/webhook/project/:projectId`.

## Files

```
App → POST /v1/files/presign → upload URL (15 min) → upload → POST /v1/files/:id/confirm
```

- **S3 driver**: a presigned PUT to the bucket (Hetzner Object Storage or any S3 API, path-style).
- **Local driver** (`FILES_DRIVER=local`, dev and testnet): a signed `PUT /v1/files/:id/content` on
  the API, files under `FILES_LOCAL_DIR`.
- Images are served through `GET /v1/files/:id/image` (variants). **Evidence** files are private:
  `GET /v1/files/:id/evidence` for the uploader, the project team and Dyma operators only.
- Uploads are capped at 10 MB.

## E-mail

Mail goes through an outbox (`notification_outbox`) processed by a BullMQ worker and sent with AWS
SES (`AWS_SES_REGION`, `AWS_SES_FROM`, `AWS_SES_USER_NAME`, `AWS_SES_PASSWORD` — IAM access keys,
not SMTP credentials). Templates are branded HTML plus plain text; links use the app URLs
(`CLIENT_APP_URL`, `STUDIO_APP_URL`, `ADMIN_APP_URL`). `npm run preview:mail` renders every template
to `tmp/email-previews/`; `npm run test:ses` sends a test message.

## Realtime

| Channel | Audience |
|---|---|
| `GET /v1/realtime/submissions` (SSE) | an earner's submission updates (points awarded, rejection reason), ping every 25 s |
| `GET /v1/notifications/stream` (SSE) | an earner's or owner's notifications |
| `GET /v1/realtime/projects/:projectId/submissions` (SSE) | a project's submission activity (admins and moderators) |
| socket.io namespace `/v1/realtime/studio` | Studio, user token required, one room per project |
| socket.io namespace `/v1/realtime/admin` | admin console, admin token required |

Behind nginx, the SSE routes need `proxy_buffering off` (see [Deployment](../operators/deployment#nginx)).
