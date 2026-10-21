---
sidebar_position: 1
slug: /intro
---

# Introduction

**Dyma** is a task-to-earn platform for Web3. Projects run **campaigns** made of **quests**;
earners complete the quests, Dyma verifies them, and the earners collect **points (DP)** and,
when the campaign has a reward pool, a share of real tokens.

*Do the task. Own the proof.*

## The surfaces

| Surface | Production | Testnet | For |
|---|---|---|---|
| Landing | [dyma.io](https://dyma.io) | `testnet.landing.dyma.io` | everyone |
| Earner app | [app.dyma.io](https://app.dyma.io) | `testnet.app.dyma.io` | earners |
| Studio | [studio.dyma.io](https://studio.dyma.io) | `testnet.studio.dyma.io` | project teams |
| Admin | `admin.dyma.io` | `testnet.admin.dyma.io` | Dyma operators |
| API | `api.dyma.io` | `testnet.api.dyma.io` | the apps and integrations |

The testnet stack runs against Safrochain's testnet (`safro-testnet-1`) with demo data; the
production hosts serve Safrochain mainnet (`safrochain-1`).

## How it works

```
Project (Studio) ─ creates ─► Campaign ─ contains ─► Quests
                                  │                      │
                     reward pool: manual or automatic     │ earner completes
                                  │                      ▼
                                  │            verified (auto or review)
                                  │                      │ points (DP) credited at once
                                  ▼                      ▼
              campaign ends ─► split by points ─► token payouts to earners' wallets
```

1. A project creates a campaign in Studio, adds quests and chooses how rewards are paid. Dyma
   reviews the campaign before it goes live (plans with approval bypass skip the queue).
2. Earners sign in (wallet, Google, X, GitHub, Discord or e-mail), complete quests, and get their
   points as soon as each quest is verified.
3. When the campaign ends, the reward pool is split **pro rata to points** (or equally, if the
   project chose so), under the split rules the project set for the campaign:
   - **Manual distribution** — the project pays, with Dyma's payout assistant (exact amounts,
     batched transfers it signs in its own wallet).
   - **Automatic distribution** — the pool is locked up front in Dyma's CosmWasm escrow
     on Safrochain; after a public challenge window each earner claims their share from their
     wallet, and the project takes back what was not claimed.

## What is live and what is not

| Built | Not built yet |
|---|---|
| Quests across social, on-chain, learn, content and engagement task types; daily check-in and lucky draw | A standalone chain indexer service (on-chain quests are verified by the API through chain REST endpoints) |
| Points (DP) and XP credited at verification, leaderboards; Dyma Reputation (DP conversion, tiers, boosts, soulbound badge); global referrals | Seasons, guilds, streak multipliers, reputation export over IBC |
| Manual and automatic (escrow) token distribution, escrow live on Safrochain mainnet (see [deployments](./contracts/deployments)) | Escrow on networks other than Safrochain (projects can request it from Studio) |
| Plans paid in USDC on Safrochain | Card payments (Stripe code kept, switched off) |
| Wallets: Zunia, Keplr, Cosmostation, EightSaf, WalletConnect | |

The escrow contracts have had an internal pre-audit review; **an external audit is still
pending**. See [Security model](./contracts/security-model).

## Where to go next

| You are… | Start here |
|---|---|
| An earner | [How earning works](./earners/how-it-works) |
| A project team | [Getting started in Studio](./projects/getting-started) |
| Reviewing the escrow | [Smart contracts](./contracts/overview) |
| Running Dyma | [Operators](./operators/environment) |
| Contributing | [Repositories](./developers/repositories) |

## Community and support

- [GitHub Discussions](https://github.com/orgs/Dyma-IO/discussions) — questions and ideas
- [X @dyma_io](https://x.com/dyma_io)
- Security reports: [dymaweb3@gmail.com](mailto:dymaweb3@gmail.com) (private only)
