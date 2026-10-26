---
description: Dyma UTXO serves earners, project teams and operators. Pick the path that matches your role.
---

import {ContactEmails, SiteLink} from '@site/src/components/Edition';

# Overview

Dyma UTXO serves three audiences. Pick the path that matches your role.

## Earners

Use the earner app (<SiteLink sub="app" />) to discover campaigns, complete quests and collect
points and token rewards.

1. Sign in with a Cardano wallet (Lace, Eternl, VESPR, Yoroi or another CIP-30 wallet), or with
   Google, X, GitHub, Discord or an e-mail code. A wallet signs in with its stake address, then
   signs once more with the address your rewards are paid to. Both are messages: no fee.
2. Open a live campaign and complete its quests. Each quest says how it is checked; on-chain quests
   read your transactions on Cardano.
3. Points are credited **as soon as a quest is verified**: instantly for automatic checks, after
   review for quests a moderator approves.
4. When the campaign ends and has a token pool, your share is computed from your points. In an
   escrow campaign you claim it with your wallet and Dyma UTXO pays the network fee; otherwise the
   project sends it to your payout address.

Read [How earning works](../earners/how-it-works), then [Wallets and sign-in](../earners/wallets)
and [Claim a token reward](../earners/claim-a-reward).

## Project teams

Use <SiteLink sub="studio">Studio</SiteLink> to run campaigns.

1. Sign up, create your **project** and submit it for review (projects are approved automatically
   unless Dyma UTXO switched that off).
2. Register your reward token: ADA or a Cardano native token.
3. Create a **campaign** with the wizard: basics and dates, quests, reward pool and distribution
   mode, eligibility, escrow funding (automatic mode only), review and launch.
4. Dyma UTXO reviews the campaign; once approved it is scheduled and starts at its start date.
5. Review submissions that need a human, watch analytics, export CSVs.
6. After the end, pay rewards from your wallet (manual mode), or let earners claim from the escrow
   (automatic mode): what nobody claims comes back to you, with your ADA deposit.

Plans are priced in US dollars and paid in ADA or USDM. Read
[Getting started in Studio](../projects/getting-started),
[Distribution modes and the split](../projects/distribution) and [Billing](../projects/billing).

## Developers and operators

- [Smart contracts](../contracts/overview): the Aiken escrow, the reputation badge and their
  deployments.
- [Operators](../operators/environment): the environment, deployment, Cardano keys, sponsored claims
  and billing settings.
- The contracts are public on GitHub:
  [Dyma-IO/dyma-contracts-cardano](https://github.com/Dyma-IO/dyma-contracts-cardano).

## Where to get help

| Need | Channel |
|---|---|
| Product questions | [Discussions](https://github.com/orgs/Dyma-IO/discussions) |
| Support, billing, anything else | <ContactEmails separator=" or " /> |
| Security vulnerability | the same addresses, privately; for the contracts, GitHub's private vulnerability reporting |
