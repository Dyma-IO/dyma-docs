---
sidebar_position: 1
---

# Environment variables

Each app has a commented `.env.example`. On servers the env file lives at
`<APP_ROOT>/shared/.env` and is linked into every release (see [Deployment](./deployment)).
`NEXT_PUBLIC_*` values are **baked into the Next.js build**: change them, then deploy again.

## dyma-api

The API validates its environment at boot (Joi) and refuses to start when a required value is
missing or malformed. Env files: `.env` is read first, then `.env.local`; the first file that sets a
key wins, and real environment variables (PM2, shell, CI) beat both.

### Required

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL 16 |
| `REDIS_URL` | Redis 7 (cache, nonces, pub/sub, BullMQ) |
| `JWT_SECRET` | ≥ 16 chars (`openssl rand -hex 32`) |
| `CREDENTIALS_MASTER_KEY` | exactly 64 hex chars (`openssl rand -hex 32`): AES-256-GCM key of every stored credential. Losing it means re-entering every credential; rotating it needs a re-encryption |

### Runtime and URLs

| Variable | Notes |
|---|---|
| `NODE_ENV` | **unset means production** (with a boot warning): no logged OTPs, no Swagger, no mock checkout |
| `PORT` | default 4000 (testnet 4700) |
| `API_PUBLIC_URL` | public API origin; Telegram webhooks and the escrow's on-chain `allocation_uri` are built from it |
| `AUTH_CALLBACK_BASE_URL`, `AUTH_FRONTEND_REDIRECT_URL` | OAuth callbacks |
| `CLIENT_APP_URL`, `STUDIO_APP_URL`, `ADMIN_APP_URL`, `LANDING_APP_URL` | bare origins (no `/app`); OAuth redirect allowlist and links in mails and notifications |
| `CORS_ORIGINS` | only for browser → API calls; the apps use server-side BFFs |
| `API_DOCS` | `true` forces Swagger at `/docs` in production |

### Proxies and the BFF secret

| Variable | Notes |
|---|---|
| `TRUSTED_PROXY_HOPS` | how many `X-Forwarded-For` entries (from the right) are believed: 1 behind a single nginx (default in production), 2 with a CDN in front, 0 when exposed directly. Too high lets callers spoof their address |
| `BFF_SHARED_SECRET` | ≥ 32 chars, the **same value** in the API, the client, Studio and the admin console. The Next.js servers relay every API call; with the secret they add `X-Dyma-Bff-Key` and `X-Dyma-Client-IP`, and the API rate-limits, audits and passes to Turnstile the visitor's address (compared in constant time). Without it, every signed-out visitor shares the BFF server's rate-limit bucket |

### Admin, security, queues, files

| Variable | Notes |
|---|---|
| `ADMIN_JWT_SECRET` | ≥ 16, distinct from `JWT_SECRET` in production (blank = derived from it) |
| `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, `ADMIN_BOOTSTRAP_RESET` | first super admin, created by `npm run prisma:seed`; the seed resets the password only with `ADMIN_BOOTSTRAP_RESET=true` |
| `TURNSTILE_SECRET_KEY` | required in production (pairs with Studio's site key) |
| `LOGIN_OTP_BYPASS_DOMAIN` | **testnet only — never set it in production.** Accounts of that e-mail domain skip the login OTP (used for the seeded `demo.dyma.io` personas, whose shared password is public) |
| `BULLMQ_PREFIX` | e.g. `dyma-testnet`, so two environments sharing a Redis never take each other's jobs |
| `FILES_DRIVER`, `FILES_LOCAL_DIR` | `s3` or `local`. Unset: S3 when credentials exist, else the local disk outside production. `local` stores under `FILES_LOCAL_DIR` (default `./storage/files`) — dev and testnet only |
| `HETZNER_S3_*`, `FILES_PUBLIC_BASE_URL` | S3 fallback when no credential is stored in admin |
| `OUTBOUND_ALLOWED_HOSTS` | hosts exempt from the outbound address checks (self-hosted services on a private network) |
| `INDEXER_WEBHOOK_SECRET` | HMAC secret of `POST /v1/webhooks/indexer`; empty refuses every call |

### Wallets and chains

| Variable | Notes |
|---|---|
| `DYMA_DEFAULT_KEPLR_CHAIN_ID` | default `safrochain-1` |
| `DYMA_EXTRA_KEPLR_CHAINS` | extra chain ids allowed for wallet sign-in |
| `WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project id served to the apps |
| `TOKENFACTORY_TRUSTED_ADMINS` | tokenfactory/CW20 admins rated "trusted" by reward-token inspection |

### Escrow (automatic distribution)

| Variable | Default | Notes |
|---|---|---|
| `ESCROW_ENABLED` | `false` | runs the escrow scan (60 s), indexer (30 s) and health (5 min) jobs and opens automatic distribution |
| `ESCROW_SIGNER` | `mnemonic` | `mnemonic` (encrypted platform credentials) or `kms` — see [Escrow operations](./escrow-operations) |
| `ESCROW_OPERATOR_KMS_KEY_ID`, `ESCROW_TICKET_KMS_KEY_ID`, `ESCROW_PAUSER_KMS_KEY_ID`, `ESCROW_KMS_REGION` | | KMS mode |
| `ESCROW_OPERATOR_MNEMONIC`, `ESCROW_TICKET_MNEMONIC`, `ESCROW_PAUSER_MNEMONIC` | | dev/testnet only, **refused when `NODE_ENV=production`** |
| `ESCROW_GAS_PRICE` | `0.075usaf` | used when the chain has no gas price in admin; never below the network minimum (`0.05usaf` on mainnet) |
| `ESCROW_GAS_ADJUSTMENT` | `1.3` | simulation × adjustment |
| `ESCROW_COMMIT_BATCH` | `1000` | entries per commit transaction |
| `ESCROW_DISTRIBUTE_BATCH` | `250` | payouts per crank transaction (keeps a result near a quarter of a megabyte) |
| `ESCROW_REVIEW_GRACE_HOURS` | `24` | default review grace (1–72) |
| `ESCROW_OPERATOR_MIN_BALANCE_USAF` | `50000000` | alert below this operator gas balance (50 SAF) |
| `ESCROW_DEV_HOUR_SECS` | `3600` | localnet/dev only: seconds in one escrow "hour"; ignored in production |

### Payments

| Variable | Default | Notes |
|---|---|---|
| `PAYMENTS_PROVIDER` | `crypto` | `crypto`, `stripe` (kept, hidden) or `mock` (refused in production) |
| `PAYMENTS_CHAIN_ID` | `safrochain-1` | testnet: `safro-testnet-1` (selects the testnet USDC) |
| `PAYMENTS_ACCEPTED_DENOMS` | network USDC | comma-separated, first is the default |
| `PAYMENTS_TREASURY_ADDRESS` | — | receives plan payments (multisig); without it crypto payments are off |
| `BILLING_TREASURY_ADDRESSES` | — | optional allowlist (comma/space separated): when set, the Safrochain treasury (`addr_safro1…`) and the Injective treasury (`inj1…`) saved in Admin → Billing → Settings must each be one of these; a treasury removed from it stops taking payments. Unset: any valid address of the right prefix |
| `PAYMENTS_INVOICE_TTL_MINUTES` | `60` | payment request lifetime |
| `PAYMENTS_MIN_CONFIRMATIONS` | `1` | |
| `STRIPE_ENABLED`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | `false` | all three needed before Stripe can be selected |

These are defaults: once an admin saves **Billing → Settings**, the stored settings win (see
[Billing settings](./billing-settings)).

### AI review

| Variable | Default | Notes |
|---|---|---|
| `CLAUDE_API_KEY` (or `ANTHROPIC_API_KEY`) | — | seed only: at boot, when no `anthropic` credential is stored, the API stores this key encrypted; Admin → Integrations → Claude owns it from then on. Never logged |
| `CLAUDE_WORKSPACE_ID` (or `ANTHROPIC_WORKSPACE_ID`) | — | `wrkspc_…`, needed with keys that are not scoped to a workspace (personal `sk-ant-usr…` keys) |
| `AI_REVIEW_MODE` | `off` | `off`, `shadow` or `live` until an admin saves Settings → AI review |
| `AI_REVIEW_SHADOW_LIMIT` | `5` | shadow reviews per UTC day until an admin saves the settings |

See [AI review operations](./ai-review).

### Integrations

`GOOGLE_*`, `TWITTER_*` (incl. `TWITTER_BEARER_TOKEN`), `GITHUB_*`, `YOUTUBE_*`, `DISCORD_CLIENT_ID`,
`AWS_SES_*`, `MAIL_LOGO_URL`, `MAIL_SUPPORT_EMAIL`. Most provider credentials are better stored
encrypted in **Admin → Integrations** (they take precedence); SES and Stripe are read from the
environment.

## dyma-client (earner app)

| Variable | When | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | build | API origin without `/v1`; also allowed in the CSP |
| `NEXT_PUBLIC_LANDING_URL`, `NEXT_PUBLIC_STUDIO_URL`, `NEXT_PUBLIC_DOCS_URL` | build | links |
| `NEXT_PUBLIC_BASE_PATH` | build | leave empty (the app owns its origin's root) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | build | empty disables WalletConnect; when set, the WalletConnect relay, RPC and verify hosts join `connect-src` and `frame-src` |
| `NEXT_PUBLIC_CHAIN_HOSTS` | build | extra chain RPC/REST origins the browser may call (see below) |
| `CLIENT_APP_URL` | runtime | OAuth `redirectUri` = `${CLIENT_APP_URL}/auth/callback` |
| `BFF_SHARED_SECRET` | runtime | same value as the API's; never prefix it with `NEXT_PUBLIC_` |
| `TRUSTED_PROXY_HOPS` | runtime | proxies in front of Next that append to `X-Forwarded-For` (1 behind nginx) |

## dyma-studio

Same as the client for `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`,
`NEXT_PUBLIC_CHAIN_HOSTS`, `BFF_SHARED_SECRET`, `TRUSTED_PROXY_HOPS`, plus:

| Variable | When | Notes |
|---|---|---|
| `STUDIO_APP_URL` | runtime | OAuth `redirectUri` = `${STUDIO_APP_URL}/auth/callback` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Cloudflare Turnstile site key |
| `NEXT_PUBLIC_CLIENT_APP_URL` | build | earner app origin (default `https://app.dyma.io`); signup consent links go to its `/legal/terms` and `/legal/privacy` |
| `NEXT_PUBLIC_TERMS_URL`, `NEXT_PUBLIC_PRIVACY_URL` | build | optional overrides for those two links |

## dyma-admin

| Variable | When | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | build | API origin without `/v1` |
| `NEXT_PUBLIC_CLIENT_APP_URL` | build | earner app origin for links |
| `BFF_SHARED_SECRET` | runtime | same value as the API's; the BFF and the sign-in routes then relay each operator's address (per-operator sign-in rate limits and audit) |
| `TRUSTED_PROXY_HOPS` | runtime | proxies in front of Next that append to `X-Forwarded-For` (1 behind nginx) |

## dyma-landing

| Variable | When | Notes |
|---|---|---|
| `DYMA_API_URL` | build + runtime (server only) | public API origin; on the same host use `http://127.0.0.1:<api port>` |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STUDIO_URL`, `NEXT_PUBLIC_DOCS_URL` | build | no `/app` suffix |
| `NEXT_PUBLIC_EXPLORER_URL` | build | `https://explorer.safrochain.network` |
| `NEXT_PUBLIC_NOINDEX` | build | `true` on testnet and previews |
| `LANDING_MIN_FIGURE`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_DISCORD_URL`, `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_CONTRACTS_URL` | optional | |

## dyma-docs

`DOCS_URL` and `DOCS_BASE_URL` at build time (GitHub Pages defaults: `https://dyma-io.github.io`,
`/dyma-docs/`; a subdomain root needs `DOCS_BASE_URL=/`).

## Chain hosts and the Content-Security-Policy

The client and Studio send a strict CSP. `connect-src` always allows the app itself, the API and
Safrochain's public endpoints (`rpc.safrochain.network`, `api.safrochain.network`,
`rpc.testnet.safrochain.com`, `rest.testnet.safrochain.com`). Any other chain the browser must reach
— to broadcast a transaction on another chain or read an escrow there — goes in
`NEXT_PUBLIC_CHAIN_HOSTS`:

```
NEXT_PUBLIC_CHAIN_HOSTS=https://rpc.osmosis.zone,https://lcd.osmosis.zone
```

Only exact `https://` or `wss://` origins are accepted (a leading `*.` wildcard is allowed); a bare
`https:`, `*`, paths and keywords are ignored with a build warning, so one careless entry cannot
open `connect-src` to the whole web. Plain `http://localhost` works in development only.
