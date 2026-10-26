---
description: How a campaign's ADA or native-token pool is shared between earners, and how it is paid on Cardano.
---

import Previewing from '@site/docs-shared/projects/_previewing.mdx';

# Distribution modes and the split

A campaign's token pool is shared between the earners who qualify, **in proportion to their points**
in that campaign by default, under the [split rules](#split-rules) you set. You choose how it is
paid in the wizard's **Rewards & distribution** step.

## Manual or automatic

| | Manual | Automatic |
|---|---|---|
| Who holds the pool | you, until you pay | Dyma UTXO's escrow on Cardano, from before launch |
| Who pays | you, with Studio's payout assistant ([Manual payouts](./manual-payouts)) | the escrow, after a challenge window: each earner claims their share within the claim window you set ([Automatic distribution](./automatic-escrow)) |
| Funding | none up front | you lock the pool and a refundable ADA deposit with one transaction signed in your wallet; the campaign cannot launch until they are locked ([Funding](./funding-step-by-step)) |
| Dates | optional (open-ended allowed) | start and end required, fixed once funded |
| Split rules | apply when Dyma UTXO computes the split | frozen once the pool is locked |
| Top N | optional | required (1 to 20,000 earners): it is the most earners the escrow pays, and it sizes the deposit |
| Tokens | any approved reward token | ADA or one Cardano native token, on a network where the escrow is deployed |
| Required quest | none | a Wallet Connect quest on the escrow's network; only earners who completed it are paid |
| Earners see | "Paid by *your project*" and the split rules | an **Escrow** badge, the split rules, the escrow and its live balance |
| Network fees | you pay your payout transactions | you pay the funding transaction and your own escrow actions; Dyma UTXO's operator pays the commits, reveals, closes and completion, and the earners' claims |
| Dyma UTXO fee | none | `fee_bps` set by Dyma UTXO, **0 by default** (capped at 10% by the escrow's registry) |

Both modes compute **exactly the same split**, at the same time, with the same code.

:::note Where the escrow runs
The escrow is deployed on Cardano's preprod test network; it is not deployed on mainnet yet
([Deployments](../contracts/deployments)). Until it is, mainnet campaigns use manual distribution.
:::

## Settings

| Setting | Default | Range | Applies to |
|---|---|---|---|
| Pool | — | > 0 | both (manual: what you declare you will pay) |
| Split | by points | by points or equal | both |
| Minimum points | none | ≥ 1 DP | both |
| Top N | none (every earner who qualifies) | ≥ 1 earner; required in automatic mode, at most 20,000 | both |
| Maximum payout per earner | none | a token amount up to the pool; the escrow stores it as a share of the pool (`max_share_bps`, 0.01%–100%) | both |
| Minimum payout | 0.01 token (`10^(decimals−2)` base units) | ≥ 0 | both |
| Review grace | 24 hours | 1–72 hours | both |
| Challenge window | 24 hours | within the escrow registry's limits (1 hour to 7 days in the mainnet configuration) | automatic |
| Claim window | 30 days | within the escrow registry's limits (30 to 365 days in the mainnet configuration) | automatic |
| Reputation boost | off | on or off | both |

## Split rules

Earners see the rules you set on the campaign page, under **How rewards are split** (only the ones
that are set).

- **Split by points** (the default): each qualifying earner's share follows their points.
  **Equal split**: every qualifying earner receives the same amount.
- **Minimum points**: earners with fewer DP in the campaign do not qualify.
- **Top N**: only the N earners with the most points are paid. In automatic mode it is required: the
  escrow is created for at most N earners.
- **Maximum payout**: no earner receives more than this amount, whatever their points. On a
  10,000 ADA pool with a maximum of 1,000 ADA, ten earners can each receive 1,000; with two earners,
  each still receives 1,000, never more, and the other 8,000 returns to you.
- **Minimum payout**: an earner whose share is below it is not paid.
- **Reputation boost**: each qualifying earner's weight is multiplied by the boost of their Dyma
  Reputation tier ([Reputation and boosts](../earners/reputation-and-boosts#tiers)) when the split
  is computed. Minimum points and top N still use raw points. The preview shows each earner's tier
  and boost.

In automatic mode the rules are frozen when you lock the pool: the funding ticket fixes the maximum
(as `max_share_bps`, so a top-up raises it in proportion), the minimum payout, the top N and the
windows, and no rule can change afterwards. Manual campaigns are paid from the split Dyma UTXO
computes with the same rules.

## Which points count

- The **cut-off** is the campaign's end (or the moment you ended a manual campaign).
- Submissions created **before the cut-off** and verified **before the end of the review grace**
  count. Use the grace to clear your review queue; anything still pending after it is left out.
- Excluded from the split: project members, suspended accounts, earners without a proven payout
  address on the token's network, payout keys shared by two accounts, and keys the escrow refuses
  (the keys of its roles, of its treasury and of the campaign's owner). In an escrow campaign,
  earners who did not complete the campaign's Wallet Connect quest on the escrow's network are
  excluded too. Earners are told why on their campaign page.
- Your split rules can leave more earners out: those below the minimum points, and those outside the
  top N.

## The formula

On chain, the escrow pays each committed entry:

```
B        = pool at finalize (an ADA pool does not include the deposit)
max_fee  = floor(B × fee_bps / 10 000)              fee reserve (0 by default)
D        = B − max_fee                              distributable
cap      = floor(D × max_share_bps / 10 000)
W        = sum of the committed weights
amount_i = min( floor(D × weight_i / W), cap )
skipped  ⇔ amount_i = 0 or amount_i < min_payout   (the amount stays in the leftover)
fee      = min( floor(paid × fee_bps / 10 000), max_fee, pool left )   once, at completion
```

`paid` is what earners actually claimed. Before committing, Dyma UTXO **plans** the weights off
chain so the whole pool reaches the earners who qualify:

1. **Who qualifies.** Earners below the minimum points are left out; with a top N, only the N
   earners with the most points remain.
2. **Pro rata on points, or equal.** Each earner's share of D is `D × points ÷ total points` (split
   by points) or `D ÷ number of earners` (equal split), rounded down to the token's smallest unit.
   The units left over by the rounding are handed out one by one, to the largest remainders first,
   so the shares add up to D exactly. With the **reputation boost** on, each earner's points (or 1,
   for an equal split) are first multiplied by their tier's boost.
3. **Cap (hard maximum).** No earner receives more than the maximum payout. The part of a share
   above the cap is **not** given to the other earners: it stays in the escrow and returns to you at
   completion (manual mode: you simply don't pay it).
4. **Minimum payout.** If some shares fall below the minimum, the smallest earners are dropped
   (earners with equal points are always treated alike) and the pool is shared again between the
   rest, keeping the largest group in which everyone gets at least the minimum.
5. The planned amounts are committed as the weights. With the planned pool the escrow pays every
   entry exactly its planned amount; if the pool at finalize differs (a top-up), payouts scale
   proportionally and never exceed the cap.

Manual mode uses steps 1–4 for the amounts you pay. The same rules and the same test vectors run in
Dyma UTXO's escrow and in the API that plans the split.

## Worked examples

ADA has 6 decimals (1 ADA = 1,000,000 lovelace); amounts below are in ADA, fee 0 (the default). A
native token such as USDM (also 6 decimals) works the same way.

**1. Plain split.** Pool 1,000; minimum 0.01; no cap.

| Earner | Points | Payout |
|---|---|---|
| Ada | 500 | 500.000000 |
| Bo | 300 | 300.000000 |
| Chi | 200 | 200.000000 |

**2. Rounding.** Pool 100; three earners with 10 points each. 100 ÷ 3 = 33.333333 each, with
0.000001 left over: it goes to one earner, so nothing is lost.

| Earner | Points | Payout |
|---|---|---|
| Ada | 10 | 33.333334 |
| Bo | 10 | 33.333333 |
| Chi | 10 | 33.333333 |

**3. Maximum payout 400 ADA (a 40% cap).** Pool 1,000.

| Earner | Points | Pro-rata share | Payout |
|---|---|---|---|
| Ada | 800 | 800 | **400** (capped) |
| Bo | 150 | 150 | **150** |
| Chi | 50 | 50 | **50** |

Ada's share is cut to the 400 maximum. The 400 above it is not shared out to Bo and Chi: 600 is
paid and **400 returns to you** at completion.

**4. Minimum payout 1 ADA on a 10 ADA pool.**

| Earner | Points | Payout |
|---|---|---|
| Ada | 600 | 6.666667 |
| Bo | 300 | 3.333333 |
| Chi | 60 | — (about 0.6, below 1) |
| Dee | 30 | — |
| Eve | 10 | — |

Dropping Eve and Dee still leaves Chi below the minimum, so Chi is dropped too; Ada and Bo share the
full pool.

## Leftovers

Whatever earners do not receive (apart from Dyma UTXO's fee) goes back to **the wallet that funded
the escrow** (automatic) or simply stays with you (manual). In automatic mode it comes back at these
moments, always with your refundable ADA deposit:

| When | What comes back | How |
|---|---|---|
| At completion: after the claim deadline, or once every share is claimed | every share nobody claimed, rounding dust, skipped amounts, cap overflow, the unused fee reserve, and the whole pool if nobody qualifies | Dyma UTXO's operator closes the claim shards and completes the escrow; nothing to sign on your side |
| If you cancel before the start | the whole pool, no fee | your **Cancel** transaction |
| If the split expires | the whole pool, when Dyma UTXO did not finalize the split before the commit deadline | **Reclaim**, which anyone can sign |

When a fee is charged, Cardano's minimum of ADA per output means that up to 2 ADA of the deposit
goes with it to the treasury. See [Automatic distribution](./automatic-escrow) for the deadlines.

<Previewing />
