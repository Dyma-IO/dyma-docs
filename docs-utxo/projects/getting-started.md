---
description: Studio is where a project team runs its campaigns on Dyma UTXO.
---

import {SiteLink} from '@site/src/components/Edition';
import AccountAndTeam from '@site/docs-shared/projects/_account-and-team.mdx';
import CreateACampaign from '@site/docs-shared/projects/_create-a-campaign.mdx';
import PlansAndQuotas from '@site/docs-shared/projects/_plans-and-quotas.mdx';

# Getting started in Studio

<SiteLink sub="studio">Studio</SiteLink> is where a project team runs its campaigns. Everything
follows one hierarchy:

```
Project ── Campaign (1..n) ── Quest (1..n)
```

<AccountAndTeam />

## 3. Set up what your quests need

- **Integrations** (Project → Settings → Integrations): the Discord bot, your Telegram bot, GitHub
  repositories, and the signing secret for your own verification endpoint. See
  [Integrations](./integrations) and [Project REST verification](./rest-verification).
- **Reward tokens** (Rewards → Reward tokens): register the token you will pay in, **ADA** or a
  **Cardano native token**, given by its unit (the policy id followed by the asset name in
  hexadecimal). Dyma UTXO checks on chain that the token exists, compares its decimals with the token
  registry (CIP-26 or CIP-68 metadata) and approves it; a campaign can only go live with an approved
  token. A native token cannot be frozen or clawed back by its issuer, although its minting policy
  may still mint more.
- **Your Cardano wallet**: the first time you use a wallet in Studio (to lock a pool, sign an escrow
  action or pay a payout batch), Studio links it to your account and proves its payment address with
  one or two signed messages. No transaction, no fee.

<CreateACampaign />

## Plans and quotas

Every project starts on **Free**, which never expires (its usage counter resets monthly). Paid
plans are bought for 1, 3, 6 or 12 months, priced in US dollars and paid in ADA or USDM on Cardano
([Billing](./billing)). The defaults below can be changed by Dyma UTXO at any time; Studio's billing
page shows the current ones.

<PlansAndQuotas />
