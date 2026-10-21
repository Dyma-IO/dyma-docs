---
sidebar_position: 3
---

# Distribution modes and the split

A campaign's token pool is shared between the earners who qualify, **in proportion to their points**
in that campaign by default, under the [split rules](#split-rules) you set. You choose how it is
paid in the wizard's **Rewards & distribution** step.

## Manual or automatic

| | Manual | Automatic |
|---|---|---|
| Who holds the pool | you, until you pay | an escrow contract on Safrochain, from before launch |
| Who pays | you, with Studio's payout assistant ([Manual payouts](./manual-payouts)) | the contract, after a challenge window: each earner claims their share within the claim window you set ([Automatic distribution](./automatic-escrow)) |
| Funding | none up front | you lock the pool with a transaction signed in your wallet; the campaign cannot launch until it is locked ([Funding](./funding-step-by-step)) |
| Dates | optional (open-ended allowed) | start and end required, fixed once funded |
| Split rules | apply when Dyma computes the split | frozen once the pool is locked |
| Tokens | any registered reward token | bank tokens (native, IBC such as USDC, tokenfactory) and approved CW20 codes on a chain where Dyma's escrow is deployed (Safrochain today) |
| Required quest | none | a Wallet Connect quest on the escrow's network; only earners who completed it are paid |
| Earners see | "Paid by *your project*" and the split rules | an **Escrow** badge, the split rules, the contract address and its live balance |
| Network fees | you pay your transfers | you pay the funding transaction; each earner pays their own claim (Dyma's operator commits and finalizes the split) |
| Dyma fee | none | `fee_bps` set by Dyma, **0 by default** (capped at 10% by the contracts) |

Both modes compute **exactly the same split**, at the same time, with the same code.

:::note Where the escrow runs
The escrow runs on Safrochain today. If your reward token lives on another network, you can request
the escrow for that network from Studio.
:::

## Settings

| Setting | Default | Range | Applies to |
|---|---|---|---|
| Pool | — | > 0 | both (manual: what you declare you will pay) |
| Split | by points | by points or equal | both |
| Minimum points | none | ≥ 1 DP | both |
| Top N | none (every earner who qualifies) | ≥ 1 earner | both |
| Maximum payout per earner | none | a token amount up to the pool; the escrow stores it as a share of the pool (`max_share_bps`, 0.01%–100%) | both |
| Minimum payout | 0.01 token (`10^(decimals−2)` base units) | ≥ 0 | both |
| Review grace | 24 hours | 1–72 hours | both |
| Challenge window | 24 hours | 1 hour–7 days | automatic |
| Claim window | 30 days | 30–365 days (the factory's limits) | automatic |
| Reputation boost | off | on or off | both |

## Split rules

Earners see the rules you set on the campaign page, under **How rewards are split** (only the ones
that are set).

- **Split by points** (the default): each qualifying earner's share follows their points.
  **Equal split**: every qualifying earner receives the same amount.
- **Minimum points**: earners with fewer DP in the campaign do not qualify.
- **Top N**: only the N earners with the most points are paid.
- **Maximum payout**: no earner receives more than this amount, whatever their points. On a
  1,000,000 SAF pool with a maximum of 100,000, ten earners can each receive 100,000; with two
  earners, each still receives 100,000, never more, and the other 800,000 returns to you.
- **Minimum payout**: an earner whose share is below it is not paid.
- **Reputation boost**: each qualifying earner's weight is multiplied by the boost of their
  [Dyma Reputation](../platform/reputation#tiers-and-boosts) tier (x1.00 to x2.00 by default) when
  the split is computed. Minimum points and top N still use raw points. The preview shows each
  earner's tier and boost.

In automatic mode the rules are frozen when you lock the pool: the escrow is created with the
maximum (as `max_share_bps`, so a top-up raises it in proportion) and the minimum payout, and no
rule can change afterwards. Manual campaigns are paid from the split Dyma computes with the same
rules.

## Which points count

- The **cut-off** is the campaign's end (or the moment you ended a manual campaign).
- Submissions created **before the cut-off** and verified **before the end of the review grace**
  count. Use the grace to clear your review queue; anything still pending after it is left out.
- Excluded from the split: project members, suspended accounts, earners without a usable payout
  address on the token's chain, addresses shared by two accounts, and addresses the escrow refuses
  (contracts and the escrow's own role addresses). In a claim-only escrow, earners who did not
  complete the campaign's Wallet Connect quest on the escrow's network are excluded too. Earners
  are told why on their campaign page.
- Your split rules can leave more earners out: those below the minimum points, and those outside the
  top N.

## The formula

On chain, the escrow pays each committed entry:

```
B        = escrow balance at finalize
max_fee  = floor(B × fee_bps / 10 000)              fee reserve (0 by default)
D        = B − max_fee                              distributable
cap      = floor(D × max_share_bps / 10 000)
W        = sum of the committed weights
amount_i = min( floor(D × weight_i / W), cap )
skipped  ⇔ amount_i = 0 or amount_i < min_payout   (the amount stays in the leftover)
```

Before committing, Dyma **plans** the weights off chain so the whole pool reaches the earners who
qualify:

1. **Who qualifies.** Earners below the minimum points are left out; with a top N, only the N
   earners with the most points remain.
2. **Pro rata on points, or equal.** Each earner's share of D is `D × points ÷ total points` (split
   by points) or `D ÷ number of earners` (equal split), rounded down to the token's smallest unit.
   The units left over by the rounding are handed out one by one, to the largest remainders first,
   so the shares add up to D exactly.
   With the **reputation boost** on, each earner's points (or 1, for an equal split) are first
   multiplied by their tier's boost: `points × boost_bps` instead of `points`.
3. **Cap (hard maximum).** No earner receives more than the maximum payout. The part of a share
   above the cap is **not** given to the other earners: it stays in the escrow and returns to you
   at completion or when you close a claim escrow (manual mode: you simply don't pay it).
4. **Minimum payout.** If some shares fall below the minimum, the smallest earners are dropped
   (earners with equal points are always treated alike) and the pool is shared again between the
   rest, keeping the largest group in which everyone gets at least the minimum.
5. The planned amounts are committed as the weights. With the planned balance the contract's formula
   pays every entry exactly its planned amount; if the balance at finalize differs (a top-up),
   payouts scale proportionally and never exceed the cap.

Manual mode uses steps 1–4 for the amounts you pay.

## Worked examples

USDC has 6 decimals; amounts below are in USDC, fee 0 (the default).

**1. Plain split.** Pool 1,000; minimum 0.01; no cap.

| Earner | Points | Payout |
|---|---|---|
| Ada | 500 | 500.000000 |
| Bo | 300 | 300.000000 |
| Chi | 200 | 200.000000 |

**2. Rounding.** Pool 100; three earners with 10 points each. 100 ÷ 3 = 33.333333 each, with
0.000001 left over: it goes to one earner (equal remainders and points: the first address in
byte order), so nothing is lost.

| Earner | Points | Payout |
|---|---|---|
| Ada | 10 | 33.333334 |
| Bo | 10 | 33.333333 |
| Chi | 10 | 33.333333 |

**3. Maximum payout 400 USDC (a 40% cap).** Pool 1,000.

| Earner | Points | Pro-rata share | Payout |
|---|---|---|---|
| Ada | 800 | 800 | **400** (capped) |
| Bo | 150 | 150 | **150** |
| Chi | 50 | 50 | **50** |

Ada's share is cut to the 400 maximum. The 400 above it is not shared out to Bo and Chi: 600 is
paid and **400 returns to you** at completion.

**4. Maximum binding for everyone.** Pool 1,000, maximum 250 (a 25% cap), two earners (70 and 30
points): each receives 250, and the **500 left over returns to you** at completion. The pool is
paid in full only when no earner's share is above the maximum; with equal shares that means at
least `pool ÷ maximum` earners.

**5. Minimum payout 1 USDC on a 10 USDC pool.**

| Earner | Points | Payout |
|---|---|---|
| Ada | 600 | 6.666667 |
| Bo | 300 | 3.333333 |
| Chi | 60 | — (about 0.6, below 1) |
| Dee | 30 | — |
| Eve | 10 | — |

Dropping Eve and Dee still leaves Chi below the minimum, so Chi is dropped too; Ada and Bo share
the full pool.

**6. With a fee (illustration).** If Dyma set `fee_bps` = 100 (1%) on a 1,000 USDC escrow:
`max_fee` = 10 is reserved at finalize, D = 990 is split, and at completion the escrow charges
`floor(paid_total × 1%)` — 9.90 if every payout succeeds — and refunds the unused reserve with the
leftovers. Dyma's default fee is **0**.

**7. Maximum and minimum payout.** Pool 1,000,000 SAF, maximum 100,000 SAF per earner (10% of the
pool), minimum payout 1,000 SAF, every earner with the same points (or an equal split), fee 0.

| Earners | Each receives | Paid out | Returned to you at completion |
|---|---|---|---|
| 2 | 100,000 (an even split would be 500,000) | 200,000 | 800,000 |
| 10 | 100,000 | 1,000,000 | 0 |
| 20 | 50,000 | 1,000,000 | 0 |

No share falls below the 1,000 SAF minimum here, so everyone is paid.

## Leftovers

Whatever earners do not receive (apart from Dyma's fee) goes back to **the wallet that funded the
escrow** (automatic) or simply stays with you (manual). In automatic mode it comes back at these
moments:

| When | What comes back | How |
|---|---|---|
| When you close a claim escrow | every share nobody claimed, rounding dust, cap overflow, the unused fee reserve, and the whole pool if nobody qualifies | **Withdraw unclaimed tokens** (`close`), after the claim deadline or as soon as everything is claimed |
| At completion (push escrows funded before claim-only payouts) | rounding dust, skipped amounts, cap overflow, the unused fee reserve, and the whole pool if nobody qualifies | automatically, in the transaction that completes the escrow |
| After the claim deadline | push escrows: payouts still unclaimed (failed payouts stay reserved for their earners until then); any escrow: tokens that arrived after completion | `sweep_leftover`, which anyone can call |
| If the split expires | the whole pool, when Dyma did not finalize the split before the commit deadline | `reclaim_expired`, which anyone can call |

See [Automatic distribution](./automatic-escrow) for the deadlines.

## Previewing

During the campaign, **Rewards → Escrow & payouts** and the campaign's distribution panel show a
live preview (participants, points, projected amounts, exclusions), and the
[distribution CSV](./exports) exports it. The final list is frozen at the end of the review grace.
