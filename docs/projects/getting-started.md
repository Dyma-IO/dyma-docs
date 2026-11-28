---
sidebar_position: 1
---

import AccountAndTeam from '@site/docs-shared/projects/_account-and-team.mdx';
import CreateACampaign from '@site/docs-shared/projects/_create-a-campaign.mdx';
import PlansAndQuotas from '@site/docs-shared/projects/_plans-and-quotas.mdx';

# Getting started in Studio

[Studio](https://studio.dyma.io) is where a project team runs its campaigns. Everything follows one
hierarchy:

```
Project ── Campaign (1..n) ── Quest (1..n)
```

<AccountAndTeam />

## 3. Set up what your quests need

- **Integrations** (Project → Settings → Integrations): the Discord bot, your Telegram bot, GitHub
  repositories, and the signing secret for your own verification endpoint. See
  [Integrations](./integrations) and [Project REST verification](./rest-verification).
- **Reward tokens** (Rewards → Reward tokens): register the token you will pay in (bank denom —
  native, IBC such as USDC, tokenfactory — or a CW20 contract). Dyma inspects it on chain (supply,
  IBC trace, decimals, tokenfactory or CW20 admin) and approves it; a campaign can only go live with
  an approved token. A token whose issuer keeps an admin key is allowed with a visible warning, see
  [Automatic distribution](./automatic-escrow#token-admin-risk).

<CreateACampaign />

## Plans and quotas

Every project starts on **Free**, which never expires (its usage counter resets monthly). Paid
plans are bought for 1, 3, 6 or 12 months in USDC on Safrochain ([Billing](./billing)). The
defaults below can be changed by Dyma at any time; Studio's billing page shows the current ones.

<PlansAndQuotas />
