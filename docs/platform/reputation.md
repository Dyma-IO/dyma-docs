---
sidebar_position: 6
---

# Points, XP and reputation

Dyma keeps three scores per account. Points measure verified work, XP is a display score, and
**Dyma Reputation** is what you build by converting points over time. Reputation can boost your
share of campaign pools.

| Score | Earned by | Spent? | Used for |
|---|---|---|---|
| **DP — Dyma Points** | verified quests, referral rewards | yes, when converted into reputation | campaign splits, leaderboards, conversion |
| **XP** | verified quests (alongside DP) | never | shown on profiles |
| **Dyma Reputation** | converting DP, qualified referrals | never | reputation tier, boosts in boosted campaigns, the on-chain badge |

## DP — Dyma Points

- Each quest awards a number of points (and XP), set by the project.
- They are credited **at verification**, and the amount is stored on the submission at that moment.
- An earner's points **in a campaign** are the sum over their verified submissions in that
  campaign. Campaign leaderboards and reward splits use only that sum.
- Your **DP balance** is every DP you earned (quests, plus DP granted by the referral program)
  minus the DP you already converted into reputation. Converting never changes your points in a
  campaign: a split always counts the points earned in that campaign.
- Points are not a token: they are not transferable and have no on-chain form. Token rewards come
  from a campaign's own pool ([Distribution modes and the split](../projects/distribution)).

## XP

XP is credited alongside points with the same rule and is shown on profiles. It is never spent.

## Dyma Reputation

### Converting DP

From the **Reputation** page (or **Rewards**), an earner converts DP into reputation:

- The DP balance goes down by the amount converted (all of it by default), and the reputation
  score goes up by `floor(DP × rate)`. The default rate is **1 DP = 1 reputation**.
- A conversion takes at least **50 DP** by default.
- Reputation never decays. It only goes down through an admin adjustment or a clawback (below).

Dyma sets the rate, the minimum and the tiers in **Admin → Settings → Reputation**; the values
below are the defaults.

### Tiers and boosts

| Tier | Name | From (reputation) | Boost |
|---|---|---|---|
| 0 | Newcomer | 0 | x1.00 |
| 1 | Explorer | 250 | x1.05 |
| 2 | Contributor | 1,000 | x1.10 |
| 3 | Builder | 3,000 | x1.20 |
| 4 | Trailblazer | 7,500 | x1.35 |
| 5 | Champion | 15,000 | x1.50 |
| 6 | Legend | 30,000 | x1.75 |
| 7 | Mythic | 60,000 | x2.00 |

Tiers must start at 0, have strictly increasing thresholds and never-decreasing boosts, between
x1.00 and x3.00. Earners are notified when they reach a new tier.

### Boosted campaigns

A project can turn on the **reputation boost** for a campaign (both distribution modes). Each
qualifying earner's weight in the split is then multiplied by the boost of their tier when the
split is computed:

```
weight = points × boost        (split by points)
weight = boost                 (equal split)
```

Points, the minimum-points rule and the top-N cut are unchanged; the boost only changes how the
pool is shared among the earners who qualify. The split preview and the final allocation show each
earner's tier and boost.

### Clawback

If a submission loses its credit after its DP were converted (a review reverses it, an admin
reopens it), Dyma checks the account: when more DP were converted than the earner still has, the
converted DP come down to what is left and the reputation they gave is taken back. The score
never goes below zero, and the event appears in the earner's reputation history.

### Referrals

The [global referral program](../earners/invite-friends) gives the inviter reputation (25 by
default) and DP when an invited friend qualifies. These DP count in the DP balance; they never
count in a campaign split.

## The on-chain badge

The tier is also certified on Safrochain by the `dyma-reputation` contract: a **soulbound,
CW721-compatible badge** the earner holds in their own wallet.

- **Claiming.** Dyma signs a short-lived attestation (15 minutes): account reference, wallet,
  tier, score, a nonce. The earner submits it with their wallet (`claim_badge`) and pays the
  transaction fee. Newcomers (tier 0) have no badge.
- **Upgrading.** A claim at a higher tier **burns the previous badge and mints a new one**. The
  same happens when an earner moves their badge to another wallet: the old one is burnt.
- **One per account, one per wallet.** A wallet cannot hold the badges of two accounts.
- **Soulbound.** Badges cannot be transferred or approved. The contract keeps an ICS-721 (IBC)
  export path, closed until Dyma configures a bridge.
- **Revocation.** Dyma can revoke an account's badge (abuse); attestations issued before the
  revocation are then refused.
- **What it is not.** Boosts are decided from Dyma's own records, not from who holds a badge, so a
  badge cannot be used to buy a boost.

Contract details: [Messages and queries](../contracts/messages#reputation-contract).

## Daily streaks

The daily check-in quest tracks a streak of consecutive UTC days. The streak is displayed; it does
**not** multiply points.

## Not built

| Feature | Status |
|---|---|
| Seasons and season leaderboards | not implemented |
| Guilds and guild referral cuts | not implemented |
| Streak multipliers | not implemented |
| Conversion of points into tokens | not part of the platform; projects distribute their own pools |
| Reputation badges outside Safrochain (ICS-721) | prepared in the contract, not opened |

## Privacy

Projects never receive earners' e-mail addresses: exports and REST verification calls identify
earners by public id, username and wallets only. The badge's `account` field is an opaque hash,
not a Dyma id.
