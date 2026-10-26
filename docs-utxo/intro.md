---
description: Dyma UTXO is the task-to-earn platform of the UTXO ecosystem, starting with Cardano.
---

import {ContactEmails, Host, SiteLink} from '@site/src/components/Edition';

# Introduction

**Dyma UTXO** is a task-to-earn platform for the UTXO ecosystem, starting with **Cardano**.
Projects run **campaigns** made of **quests**; earners complete the quests, Dyma UTXO verifies them,
and the earners collect **points (DP)** and, when the campaign has a reward pool, a share of ADA or
of a Cardano native token.

Dyma UTXO runs the same platform as Dyma, the team behind it, on its own site, with its own accounts
and deployments. The pages that describe what every Dyma site shares (quests, campaigns,
moderation, points and reputation) name the platform Dyma.

## The surfaces

| Surface | Address | For |
|---|---|---|
| Landing | <SiteLink /> | everyone |
| Earner app | <SiteLink sub="app" /> | earners |
| Studio | <SiteLink sub="studio" /> | project teams |
| Admin | <Host sub="admin" /> | Dyma UTXO operators |
| API | <Host sub="api" /> | the apps and integrations |

Dyma UTXO works on Cardano mainnet (`cardano-mainnet`). The preprod test network
(`cardano-preprod`) is registered too, and stays off until an operator turns it on. The smart
contracts are deployed on preprod so far ([Deployments](./contracts/deployments)).

## How it works

```
Project (Studio) ─ creates ─► Campaign ─ contains ─► Quests
                                  │                      │
                     reward pool: manual or automatic     │ earner completes
                                  │                      ▼
                                  │            verified (auto or review)
                                  │                      │ points (DP) credited at once
                                  ▼                      ▼
              campaign ends ─► split by points ─► earners receive ADA or a native token
```

1. A project creates a campaign in Studio, adds quests and chooses how rewards are paid. Dyma UTXO
   reviews the campaign before it goes live (plans with approval bypass skip the queue).
2. Earners sign in (a Cardano wallet, Google, X, GitHub, Discord or e-mail), complete quests, and get
   their points as soon as each quest is verified.
3. When the campaign ends, the reward pool is split **pro rata to points** (or equally, if the
   project chose so), under the split rules the project set for the campaign:
   - **Manual distribution**: the project pays, with Studio's payout assistant (exact amounts,
     batched Cardano transactions it signs in its own wallet, each one checked by Dyma UTXO).
   - **Automatic distribution**: the pool is locked up front in Dyma UTXO's escrow on Cardano;
     after a public challenge window each earner claims their share with their own wallet, Dyma UTXO
     pays the network fee, and what nobody claims goes back to the project.

## What is built and what is not

| Built | Not built yet |
|---|---|
| Quests across social, learn, content and engagement task types, and on-chain checks on Cardano: transfers, stake delegation, mints, script interactions, holdings ([Quests on Cardano](./earners/quests-on-cardano)) | Governance, swap and liquidity quests on Cardano |
| Points (DP) and XP credited at verification, leaderboards; Dyma Reputation (tiers, boosts); global referrals | |
| Sign-in with CIP-30 wallets (Lace, Eternl, VESPR, Yoroi and others), Google, X, GitHub, Discord or e-mail | |
| Plans priced in US dollars, paid in ADA or USDM ([Billing](./projects/billing)) | Card payments |
| Manual distribution on Cardano | |
| Automatic distribution (the Aiken escrow) and the CIP-68 reputation badge, deployed on preprod | Both on Cardano mainnet: not deployed yet |
| | Apex Fusion and Midnight ([Roadmap](./roadmap)) |

## Where to go next

| You are… | Start here |
|---|---|
| An earner | [How earning works](./earners/how-it-works), then [Wallets and sign-in](./earners/wallets) |
| A project team | [Getting started in Studio](./projects/getting-started) |
| Reviewing the escrow | [Smart contracts](./contracts/overview) |
| Running Dyma UTXO | [Operators](./operators/environment) |

## Community and support

- [GitHub Discussions](https://github.com/orgs/Dyma-IO/discussions): questions and ideas.
- Contact, including security reports (privately): <ContactEmails />.
- The Cardano contracts are public: [Dyma-IO/dyma-contracts-cardano](https://github.com/Dyma-IO/dyma-contracts-cardano).
  Report a vulnerability in them through GitHub's private reporting, as its `SECURITY.md` explains.
