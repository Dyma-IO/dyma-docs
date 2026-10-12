---
sidebar_position: 1
---

# Platform topology

Dyma is split into independent apps that share one API and one TypeScript package.

## Surfaces

| Host (production) | Repository | Audience | Purpose |
|---|---|---|---|
| `dyma.io` | `dyma-landing` | public | marketing site, rendered from the public API (refreshed every 5 minutes) |
| `app.dyma.io` | `dyma-client` | earners | discover campaigns, complete quests, rewards |
| `studio.dyma.io` | `dyma-studio` | project teams | projects, campaigns, quests, review queue, payouts, billing |
| `admin.dyma.io` | `dyma-admin` | Dyma operators | reviews, moderation, escrow console, billing, promotions, platform settings |
| `api.dyma.io` | `dyma-api` | the apps and integrations | REST API under `/v1`, server-sent events, sockets |
| `docs.dyma.io` | `dyma-docs` | everyone | this site |

Each app owns the root of its own host (the earner app is no longer served under `dyma.io/app`).
Testnet uses the same layout under `testnet.*.dyma.io`.

## Sessions

Each app has its own session: an httpOnly cookie on its own host (`dyma_client_token`,
`dyma_studio_token`, `dyma_admin_token`) holding the API token. There is no cross-domain cookie:
signing in to the earner app does not sign you in to Studio. The browser talks only to its app's
same-origin `/api/*` routes (the BFF); the Next.js server calls the API with the token and forwards
the visitor's address under the shared BFF secret.

## The API

NestJS 11, PostgreSQL 16 (Prisma), Redis (cache, nonces, pub/sub, BullMQ). It is responsible for:

- sign-in (wallet signatures, OAuth, e-mail codes, Studio passwords with 2FA, admin 2FA and RBAC),
- the Project → Campaign → Quest model and its lifecycles,
- verification: chain transactions through each chain's REST endpoints, platform APIs (X, Discord,
  Telegram, YouTube, GitHub), project REST endpoints, quizzes, visits, moderation,
- points (credited at verification), leaderboards, exports,
- reward distribution: manual payout verification, and the escrow jobs (ticket signing, commit,
  finalize, crank, indexing),
- billing in USDC on Safrochain, notifications (in-app, e-mail, SSE), promotions, broadcasts.

Background jobs (BullMQ): campaign lifecycle (60 s), escrow scan (60 s), escrow indexer (30 s),
escrow health (5 min), billing lifecycle (hourly) and payment watcher (1 min), notification fan-out,
mail outbox, chain health (15 min).

Swagger is served at `/docs` outside production (or with `API_DOCS=true`).

## Chains

Safrochain (`safrochain-1`, bech32 prefix `addr_safro`, fee token SAF) is the home chain: wallet
sign-in default, billing chain and escrow chain. Other Cosmos chains can be registered by Dyma
(admin chain registry, importable from the Cosmos chain registry) for on-chain quests and wallet
links.

| | Mainnet `safrochain-1` | Testnet `safro-testnet-1` |
|---|---|---|
| RPC | `https://rpc.safrochain.network` | `https://rpc.testnet.safrochain.com` |
| REST | `https://api.safrochain.network` | `https://rest.testnet.safrochain.com` |
| Minimum gas price | `0.05usaf` (x/globalfee) | `0.001usaf` (node) |
| Dyma gas price | `0.075usaf` | `0.075usaf` |
| Explorer | `explorer.safrochain.network` | `explorer.testnet.safrochain.com` |

## Smart contracts

| Contract | Status |
|---|---|
| Escrow factory + campaign escrow | implemented (v0.1.0), internal review done, external audit pending, not deployed yet — see [Smart contracts](../contracts/overview) |
| Reputation NFT | placeholder, not implemented |

There is no standalone indexer service: the API verifies on-chain quests itself and indexes the
escrow contracts it operates.
