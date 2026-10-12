---
sidebar_position: 1
---

# Getting started in Studio

[Studio](https://studio.dyma.io) is where a project team runs its campaigns. Everything follows one
hierarchy:

```
Project ── Campaign (1..n) ── Quest (1..n)
```

## 1. Create your account and project

1. Sign up with e-mail and password (a code confirms your address), or with Google or GitHub.
   Sign-up and sign-in are protected by Cloudflare Turnstile.
2. **New project**: name, slug, logo, cover, description, category, links. The project starts as a
   draft.
3. **Submit for review.** By default a project goes live as soon as it is submitted (Dyma can
   still suspend it); when Dyma switches automatic approval off, it waits in the admin review queue
   and you are notified of the decision. A campaign can only be submitted once its project is live.

## 2. Invite your team

**Project → Members** invites people by e-mail with one of two roles:

| Role | Can |
|---|---|
| Project admin | everything: campaigns, quests, tokens, escrow and payouts, integrations, billing, members |
| Project moderator | review submissions in the project's review queue |

The number of seats depends on your plan.

## 3. Set up what your quests need

- **Integrations** (Project → Settings → Integrations): the Discord bot, your Telegram bot, GitHub
  repositories, and the signing secret for your own verification endpoint. See
  [Integrations](./integrations) and [Project REST verification](./rest-verification).
- **Reward tokens** (Rewards → Reward tokens): register the token you will pay in (bank denom —
  native, IBC such as USDC, tokenfactory — or a CW20 contract). Dyma inspects it on chain (supply,
  IBC trace, decimals, tokenfactory or CW20 admin) and approves it; a campaign can only go live with
  an approved token. A token whose issuer keeps an admin key is allowed with a visible warning, see
  [Automatic distribution](./automatic-escrow#token-admin-risk).

## 4. Create a campaign

The wizard has six steps: **Basics → Quests → Rewards & distribution → Eligibility → Fund escrow
(automatic mode only) → Review & launch**. Read [Campaign lifecycle](./campaign-lifecycle) for what
happens next and [Distribution modes and the split](./distribution) before choosing a mode.

## Plans and quotas

Every project starts on **Free**, which never expires (its usage counter resets monthly). Paid
plans are bought for 1, 3, 6 or 12 months in USDC on Safrochain ([Billing](./billing)). The
defaults below can be changed by Dyma at any time; Studio's billing page shows the current ones.

| Plan | Monthly verifications | Members | Moderators | Highlights |
|---|---|---|---|---|
| Free | 300 | 1 | 0 | every quest type except project REST API quests, manual and automatic distribution, CSV exports |
| Starter ($49/month, $490/year) | 2,000 | 3 | 1 | bulk moderation, no Dyma branding |
| Growth ($99/month, $990/year) | 7,000 | 10 | 3 | + project REST API quests, advanced analytics, targeted announcements |
| Pro ($199/month, $1,990/year) | 20,000 | 30 | 10 | + campaign approval bypass, full API, AI SEO |
| Enterprise | custom | custom | custom | arranged with the Dyma team |

One **verification** is one submission counted against your monthly quota. When the quota is used
up, new completions are refused until the window renews or you upgrade (you are warned at 80% and
100%).
