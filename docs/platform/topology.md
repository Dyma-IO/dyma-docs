---
sidebar_position: 1
---

# Platform topology

Production is split across independent surfaces that share auth via `dyma-api` and UI primitives via shared packages.

## Domains

| Domain | Repository | Audience | Purpose |
|--------|------------|----------|---------|
| **dyma.io** | `dyma-landing` + `dyma-client` | Public + earners | Marketing landing and user app |
| **studio.dyma.io** | `dyma-studio` | Project teams | Campaign and quest management |
| **admin.dyma.io** | `dyma-admin` | Dyma operators | Platform config, moderation, pricing |
| **api.dyma.io** | `dyma-api` | All apps | REST API, verification, auth, billing |

## Routing on dyma.io

| Path | App |
|------|-----|
| `/` | Marketing landing |
| `/app/*` | Authenticated user client |
| `/projects/:slug` | Public project pages (SEO) |
| `/campaigns/:id` | Public campaign pages (SEO) |

## Cross-domain auth

Session cookies on `.dyma.io` (or SSO tokens) recognize a wallet connected on `dyma.io` when the same user has roles on `studio.dyma.io`.

## Backend responsibilities

The API orchestrates:

- Wallet auth (Cosmos signed messages) and email link/unlink
- Social OAuth (X, Discord, GitHub)
- Verification (indexer, platform APIs, project REST proxy, manual queues)
- Dynamic plan enforcement (quotas, features, moderator seats)
- Notifications, billing webhooks, analytics, OG image generation

OpenAPI documentation is served at [api.dyma.io/docs](https://api.dyma.io/docs) when deployed.

## Smart contracts

| Contract | Function |
|----------|----------|
| Reputation NFT | Soulbound, upgradable DR levels |
| Escrow | Campaign fund locking and settlement |
| Token factory | Project token minting on Safrochain |
| Campaign registry | On-chain campaign rules where applicable |

Contract source: [`dyma-contracts`](https://github.com/Dyma-IO/dyma-contracts) (CosmWasm on Safrochain).
