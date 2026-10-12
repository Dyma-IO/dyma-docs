---
sidebar_position: 3
---

# Distribution modes and the split

A campaign's token pool is shared between earners **in proportion to their points** in that
campaign. You choose how it is paid in the wizard's **Rewards & distribution** step.

## Manual or automatic

| | Manual | Automatic |
|---|---|---|
| Who holds the pool | you, until you pay | an escrow contract on Safrochain, from before launch |
| Who pays | you, with Studio's payout assistant ([Manual payouts](./manual-payouts)) | the contract, after a challenge window ([Automatic distribution](./automatic-escrow)) |
| Funding | none up front | the pool is locked before the campaign can be submitted ([Funding](./funding-step-by-step)) |
| Dates | optional (open-ended allowed) | start and end required, fixed once funded |
| Tokens | any registered reward token | bank tokens (native, IBC such as USDC, tokenfactory) and approved CW20 codes on a chain where Dyma's escrow is deployed |
| Earners see | "Paid by *your project*" | "Rewards locked in Dyma's open-source CosmWasm escrow on Safrochain", contract address and live balance |
| Network fees | you pay your transfers | Dyma's operator pays the payout transactions; you pay the funding transaction |
| Dyma fee | none | `fee_bps` set by Dyma, **0 by default** (capped at 10% by the contracts) |

Both modes compute **exactly the same split**, at the same time, with the same code.

## Settings

| Setting | Default | Range | Applies to |
|---|---|---|---|
| Pool | — | > 0 | both (manual: what you declare you will pay) |
| Minimum payout | 0.01 token (`10^(decimals−2)` base units) | ≥ 0 | both |
| Cap per earner | none (100%) | 0.01%–100% of the pool | both |
| Review grace | 24 hours | 1–72 hours | both |
| Challenge window | 24 hours | 1 hour–7 days | automatic |

## Which points count

- The **cut-off** is the campaign's end (or the moment you ended a manual campaign).
- Submissions created **before the cut-off** and verified **before the end of the review grace**
  count. Use the grace to clear your review queue; anything still pending after it is left out.
- Excluded from the split: project members, suspended accounts, earners without a usable payout
  address on the token's chain, addresses shared by two accounts, and addresses the escrow refuses
  (contracts and the escrow's own role addresses). Earners are told why on their campaign page.

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

1. **Pro rata on points.** Each earner's share of D is `D × points ÷ total points`, rounded down to
   the token's smallest unit. The units left over by the rounding are handed out one by one, to the
   largest remainders first, so the shares add up to D exactly.
2. **Cap (water-filling).** A share above the cap is pinned at the cap and the rest of the pool is
   shared again between the others, until no share exceeds the cap.
3. **Minimum payout.** If some shares fall below the minimum, the smallest earners are dropped
   (earners with equal points are always treated alike) and the pool is shared again between the
   rest, keeping the largest group in which everyone gets at least the minimum.
4. The planned amounts are committed as the weights. With the planned balance the contract's formula
   pays every entry exactly its planned amount; if the balance at finalize differs (a top-up),
   payouts scale proportionally and never exceed the cap.

Manual mode uses steps 1–3 for the amounts you pay.

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

**3. Cap at 40% (400 USDC).** Pool 1,000.

| Earner | Points | Pro-rata share | Payout |
|---|---|---|---|
| Ada | 800 | 800 | **400** (capped) |
| Bo | 150 | 150 → 450 after Ada's excess is shared | **400** (capped) |
| Chi | 50 | 50 → 200 | **200** |

Ada's excess is shared between Bo and Chi (150 : 50); Bo's new share passes the cap too, so the
rest goes to Chi. The whole pool is paid.

**4. Cap binding for everyone.** Pool 1,000, cap 25% (250), two earners (70 and 30 points): each
receives 250, and the **500 left over returns to you** at completion. A cap only pays out the full
pool when `earners × cap ≥ pool`.

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

## Leftovers

Whatever earners do not receive goes back to **the wallet that funded the escrow** (automatic) or
simply stays with you (manual): rounding dust, skipped amounts, cap overflow, an unused fee reserve,
and the whole pool if nobody qualifies. In automatic mode it is refunded by the transaction that
completes the escrow; failed payouts stay reserved for their earners until the claim deadline and
are then returned to you as well.

## Previewing

During the campaign, **Rewards → Escrow & payouts** and the campaign's distribution panel show a
live preview (participants, points, projected amounts, exclusions), and the
[distribution CSV](./exports) exports it. The final list is frozen at the end of the review grace.
