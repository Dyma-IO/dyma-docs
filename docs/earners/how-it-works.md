---
sidebar_position: 1
---

import ProfilePicture from '@site/docs-shared/earners/_profile-picture.mdx';
import QuestChecks from '@site/docs-shared/earners/_quest-checks.mdx';

# How earning works

Everything you do on Dyma happens inside a **campaign** run by a **project**. A campaign is a set
of **quests**; each verified quest earns you **points (DP)** and **XP**, and campaigns with a token
pool share it between earners under the rules the project set: in proportion to their points by
default, or equally ([Token rewards](./token-rewards)).

## Sign in

Open the earner app and choose any of:

| Method | Notes |
|---|---|
| Wallet | Zunia, Keplr, Cosmostation, EightSaf on desktop; any WalletConnect wallet on mobile. You sign a message (no fee, no transaction) — see [Wallets](./wallets) |
| Google, X, GitHub, Discord | OAuth sign-in |
| E-mail | a one-time code sent to your inbox |

You can link more wallets and accounts later from your profile. Some quests need a linked account
(X, Discord, Telegram, YouTube, GitHub) or a wallet on a given chain.

<ProfilePicture />

## Campaign phases

| Phase | What you can do |
|---|---|
| Upcoming | read the quests and the rules; quests open at the start date |
| Live | complete quests |
| Paused | nothing: completions are refused until the project or Dyma resumes it |
| Ended | no more completions; quests waiting for review can still be decided |
| Distributing | the token pool is being split; on newer escrows you [claim your share](./claim-a-reward) from your wallet |
| Distributed | every payout is done; your payout transaction is linked on the campaign page |

A campaign may also set **eligibility rules**, shown on its page: a verified e-mail, a minimum
account age, linked accounts (X, Discord, Telegram, GitHub, YouTube) or an allowlist. The page tells
you whether you qualify before you start.

## Completing a quest

Each quest shows what to do and how it is checked:

| Check | Examples | What you see |
|---|---|---|
| Automatic | follow on X, join a Discord server or Telegram group, star a GitHub repo, an on-chain transaction, a quiz, a secret code, a visit, a daily check-in | a result in seconds |
| On chain | delegate, swap, vote, bridge, mint… on a supported chain | the API looks the transaction up on the chain; a transaction that is not indexed yet is re-checked, it is not a failure |
| Project API | a project-specific action, checked by the project's own server | a result in seconds |
| Review | content, screenshots, links, open answers | **In review** until a moderator decides |
| Hybrid | automatic first, review as a fallback | after a provider error, or a few failed checks, you can **request a manual review** |

<QuestChecks />

Next: [Daily, repeatable and lucky-draw quests](./recurring-quests) ·
[Wallets and payout address](./wallets) · [Token rewards](./token-rewards).
