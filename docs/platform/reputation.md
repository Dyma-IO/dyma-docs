---
sidebar_position: 6
---

# Points, XP and reputation

## DP — Dyma Points

Points are Dyma's score for verified work.

- Each quest awards a number of points (and XP), set by the project.
- They are credited **at verification**, and the amount is stored on the submission at that moment.
- An earner's points in a campaign are the sum over their verified submissions in that campaign;
  their total is the sum over all campaigns. Leaderboards, profiles, analytics, exports and reward
  splits all use this same definition (counted per account, not per wallet).
- Points are not a token: they are not transferable and have no on-chain form. Token rewards come
  from a campaign's own pool, split in proportion to points
  ([Distribution modes and the split](../projects/distribution)).

## XP

XP is credited alongside points with the same rule and is shown on profiles.

## Daily streaks

The daily check-in quest tracks a streak of consecutive UTC days. The streak is displayed; it does
**not** multiply points.

## Not built

The earlier design described features that do not exist in the product today:

| Feature | Status |
|---|---|
| DR (Dima Reputation) soulbound NFT and reputation levels | not implemented (`dyma-contracts` holds only a placeholder) |
| Seasons and season leaderboards | not implemented |
| Guilds and guild referral cuts | not implemented |
| Streak multipliers | not implemented |
| Conversion of points into tokens | not part of the platform; projects distribute their own pools |

## Privacy

Projects never receive earners' e-mail addresses: exports and REST verification calls identify
earners by public id, username and wallets only.
