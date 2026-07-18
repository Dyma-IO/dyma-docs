---
sidebar_position: 4
---

# Authentication

Dyma has **two separate auth systems**:

1. **End users** (`dyma-client`, `dyma-studio`) — Keplr wallet, Google, or X/Twitter
2. **Admin operators** (`dyma-admin`) — email/password + TOTP 2FA + RBAC roles

---

## End-user authentication

Dyma supports three sign-in methods. All successful logins return a JWT (`accessToken`) and a public user id (`publicId`) prefixed with `dymauser_`.

## Methods

| Method | ID | Default | Notes |
|--------|-----|---------|-------|
| Keplr (Cosmos wallet) | `keplr` | Yes | Chain must be in the [Keplr chain registry](https://github.com/chainapsis/keplr-chain-registry) |
| Google | `google` | No | OAuth 2.0 |
| X (Twitter) | `twitter` | No | OAuth 2.0 with PKCE |

`GET /v1/auth/methods` returns the enabled methods for the current environment.

## Keplr / Cosmos wallet

Default chain: **Safrochain** (`safrochain-1`, bech32 prefix `addr_safro`).

### Flow

1. `GET /v1/auth/keplr/chains` — list allowed registry chains
2. `GET /v1/auth/keplr/nonce?address={addr}&chainId={optional}` — returns `dyma_nonce_*` and sign message
3. User signs in Keplr
4. `POST /v1/auth/keplr/verify` — body: `address`, `pubkey`, `signature`, `nonce`, optional `chainId`
5. Response: `{ accessToken, publicId, userId, authMethod: "keplr", chainId }`

Sign message format:

```
Sign in to Dyma
Nonce: dyma_nonce_...
Chain: safrochain-1
```

Only chains present in Dyma's Keplr allowlist are accepted. Additional chains can be loaded from the registry via `DYMA_EXTRA_KEPLR_CHAINS`.

## Google OAuth

1. `GET /v1/auth/google/start` — returns authorization `url`
2. User completes Google consent
3. `GET /v1/auth/google/callback` — API exchanges code, redirects to frontend with `token` and `publicId`

## X (Twitter) OAuth

1. `GET /v1/auth/twitter/start` — returns authorization `url` (PKCE)
2. User completes X consent
3. `GET /v1/auth/twitter/callback` — API exchanges code, redirects to frontend

## Admin authentication (`dyma-admin`)

Separate from wallet/OAuth users. Admin operators use **email + password** and **TOTP 2FA** (Google Authenticator, Authy, etc.).

Public id prefix: `dymaadmin_`. JWT audience: `dyma-admin` (use Swagger **admin** bearer scheme).

### Roles

Uses the platform RBAC tables (`roles`, `permissions`, `admin_user_roles`):

| Role | Slug | Access |
|------|------|--------|
| Super admin | `super_admin` | Full platform config |
| Dyma moderator | `dyma_moderator` | Global moderation |

### Login flow

1. `POST /v1/admin/auth/login` — `{ email, password }`
2. If `requires2fa: true` → `POST /v1/admin/auth/2fa/verify` with `{ challengeToken, code }`
3. Response: `{ accessToken, admin: { publicId, roles, permissions } }`

### 2FA enrollment

1. `POST /v1/admin/auth/2fa/setup` (admin JWT) — returns `otpauthUrl` for QR scan
2. `POST /v1/admin/auth/2fa/enable` — `{ code }` confirms enrollment
3. `POST /v1/admin/auth/2fa/disable` — `{ code }` to turn off

### Bootstrap (local dev)

Set in `.env` and run `npx prisma db seed`:

```
ADMIN_BOOTSTRAP_EMAIL=admin@dyma.io
ADMIN_BOOTSTRAP_PASSWORD=change-me-min-12-chars
```

## Public user IDs

Every user receives a stable public id: `dymauser_{32hex}` (e.g. `dymauser_a1b2c3d4...`). Use this in client UI and support tickets; internal UUID remains in JWT `sub`.

## Dyma prefixes

| Resource | Prefix | Example |
|----------|--------|---------|
| User public id | `dymauser_` | `dymauser_abc123...` |
| Admin public id | `dymaadmin_` | `dymaadmin_abc123...` |
| Admin 2FA challenge | `dyma_admin_challenge_` | `dyma_admin_challenge_...` |
| Auth nonce | `dyma_nonce_` | `dyma_nonce_deadbeef...` |
| OAuth state | `dyma_oauth_` | `dyma_oauth_...` |
| API key display | `dyma_key_` | `dyma_key_a1b2...` |
| Redis keys | `dyma:` | `dyma:auth:nonce:...` |

## Environment variables

See `dyma-api/.env.example`: `DYMA_DEFAULT_KEPLR_CHAIN_ID`, `GOOGLE_CLIENT_ID`, `TWITTER_CLIENT_ID`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_JWT_SECRET`.
