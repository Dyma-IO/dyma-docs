---
sidebar_position: 1
---

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

## Campaign phases

| Phase | What you can do |
|---|---|
| Upcoming | read the quests and the rules; quests open at the start date |
| Live | complete quests |
| Paused | nothing: completions are refused until the project or Dyma resumes it |
| Ended | no more completions; quests waiting for review can still be decided |
| Distributing | the token pool is being split and paid |
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

Some quests are **locked** until you finish another one, or open only on certain dates; the quest
page explains what unlocks it.

### Points are credited at verification

There is **no claim step**. The moment a quest is verified — instantly for automatic checks, or
when a moderator approves it — the quest's points and XP are added to your account and you see
the "+DP" confirmation. The amount is fixed at that moment: if the project later changes the
quest's reward, what you earned does not change.

| Quest status | Meaning |
|---|---|
| Started | you opened the quest; finish the task, then verify |
| Checking / In review | an automatic re-check or a moderator is pending |
| Done | verified and credited |
| Try again | your last attempt was not accepted (the reason is shown); you can submit again |

Your points in a campaign are the sum of the points of your verified quests there. Leaderboards,
your share of a token pool and your profile totals all use that same number.

### Retry rules you may meet

- **Quiz**: by default 3 attempts, one minute apart (the project can change both). A failed
  attempt tells you which answers were wrong, not the right ones.
- **Secret code**: 10 wrong guesses in 15 minutes lock the quest for a while.
- **Visit quests**: the waiting time the project set is enforced by the server, so verifying too
  early fails with the time left.
- **Social checks**: one social account can complete a quest for one Dyma account only, and an X
  post can be used once.
- A project whose plan quota for the month is used up stops accepting new completions until its
  quota renews or it upgrades.

## Where to find things

| Page | Content |
|---|---|
| Home | today's quests, your check-in streak, campaigns in progress |
| Discover | live, upcoming and ended campaigns, projects, quests |
| Campaign page | quests grouped Daily / Repeatable / One-time, the reward pool, your points and share, the leaderboard |
| My quests | everything you started and its status |
| Rewards | your points, token payouts with their transaction links, your payout wallet |

Next: [Daily, repeatable and lucky-draw quests](./recurring-quests) ·
[Wallets and payout address](./wallets) · [Token rewards](./token-rewards).
