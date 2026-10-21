---
sidebar_position: 4
---

# Token rewards

Points (DP) are Dyma's own score. A campaign can also have a **reward pool** in a real token (for
example USDC or SAF on Safrochain). At the end of the campaign the pool is split between the earners
who qualify, **in proportion to their points in that campaign** unless the project chose an equal
split, under the rules the project set for that campaign.

## How your share is computed

```
your share ≈ pool × your points ÷ all eligible points      (split by points, the default)
your share ≈ pool ÷ number of eligible earners             (equal split)
```

- **Which points count**: quests you submitted **before the campaign ended** and that were verified
  **before the end of the review grace** (24 hours by default, set per campaign between 1 and 72
  hours). Anything still in review after the grace is out.
- Amounts are rounded down to the token's smallest unit; the few units left over are handed out one
  by one so the whole pool is used. The exact rules, with examples, are in
  [Distribution modes and the split](../projects/distribution).

During the campaign the campaign page shows your points, your share so far and a projected amount.
After the grace it shows the final amount.

## The campaign's split rules

Each project sets these rules per campaign. The campaign page lists the ones that are set under
**How rewards are split**, in the reward pool card and in the escrow explainer.

| Rule | What it means | Shown as |
|---|---|---|
| Split | by points (the default): your share follows your points. Equal: every earner who qualifies gets the same amount | "Split by points" / "Equal split" |
| Minimum points | you need at least this many DP in the campaign to qualify | "At least 200 DP to qualify" |
| Top N | only the N earners with the most points are paid | "Top 50 earners by points" |
| Maximum payout | the most any one earner can receive, whatever their points | "Max 100,000 SAF per earner" |
| Minimum payout | a share below it is not paid (by default one hundredth of a token, e.g. 0.01 USDC) | "Min 1,000 SAF to be paid" |
| Reputation boost | each earner's weight is multiplied by their [reputation tier's boost](./reputation-and-boosts) (x1.00 to x2.00 by default) | "Reputation boost on" |

In automatic mode the rules are locked with the pool in the escrow: once the project has funded it,
they cannot change. In manual mode the project pays the split Dyma computes with the same rules.

### Worked example

Pool **1,000,000 SAF**, maximum **100,000 SAF** per earner, minimum payout **1,000 SAF**, every
earner with the same points (or an equal split), Dyma fee 0 (the default):

| Earners | Each receives | Paid out | Back to the project |
|---|---|---|---|
| 2 | 100,000 SAF: an even split would give 500,000, but no one gets more than the maximum | 200,000 SAF | 800,000 SAF |
| 10 | 100,000 SAF | 1,000,000 SAF | nothing |
| 20 | 50,000 SAF | 1,000,000 SAF | nothing |

Every share here is above the 1,000 SAF minimum, so everyone is paid. With equal shares, the whole
pool is paid only when `earners × maximum ≥ pool`; when points differ, whatever a share has above
the maximum also returns to the project, it is never handed to the other earners.

## What goes back to the project

Whatever earners do not receive (apart from Dyma's fee, 0 by default) returns to the project:

- **At completion** (automatic mode), in the same transaction that completes the escrow: rounding
  dust, amounts not paid because of the minimum or the maximum, and the unused fee reserve.
- **After the claim window**: shares still unclaimed when the claim deadline passes. In a claim
  escrow that is every share its earner did not claim; in an older (push) escrow, a transfer that
  failed and was never claimed.
- **If the split expires** (Dyma does not finalize it before the commit deadline): the whole pool.

In manual mode the pool never leaves the project's wallet, so whatever is not paid simply stays
there.

## Two ways the pool is paid

| | Manual distribution | Automatic distribution (escrow) |
|---|---|---|
| Where the pool is | in the project's wallet | locked in an escrow contract on Safrochain since before the campaign went live |
| Who pays | the project, with Dyma's payout assistant | the contract, after a public challenge window: you **claim** your share from your wallet ([Claim a token reward](./claim-a-reward)); escrows funded before claim-only payouts pay automatically |
| What you see | "Paid by *project*" and the payout transaction | escrow address, funding transaction, live balance, then your payout transaction |
| Guarantee | the project's word: Dyma computes the exact amounts and checks every payout transaction on chain, but cannot force payment | the pool cannot leave the escrow except to earners (or back to the owner, see [What goes back to the project](#what-goes-back-to-the-project)) |

### Automatic: the timeline

1. **Campaign ends.** Points stop counting new completions.
2. **Review grace** (default 24 h). Pending reviews are decided; payout addresses are fixed.
3. **Commit and finalize.** Dyma's operator writes the allocation (address and weight per earner)
   to the escrow and publishes the allocation file whose SHA-256 is recorded on chain.
4. **Challenge window** (default 24 h, between 1 hour and 7 days). Anyone can check the allocation;
   the project can dispute it once, and Dyma's guardian multisig can reject a wrong one (it is then
   recomputed and committed again).
5. **Claims** (escrows created since October 2026). Nothing is sent automatically: each earner
   claims their share from the committed wallet before the **claim deadline** (30 to 365 days
   after claims open, chosen by the project, 30 by default) and pays the claim's network fee. To
   be committed at all you must have completed the campaign's Wallet Connect quest. Afterwards the
   project closes the escrow and every unclaimed share returns to it. See
   [Claim a token reward](./claim-a-reward).
6. **Payouts** (older, push escrows). The contract pays everyone in batches and Dyma's operator
   pays the gas. If a payout to your address fails, it stays reserved for you: until the claim
   deadline (180 days after payouts open for those escrows) you can call `claim` yourself from
   your wallet.

If the escrow is **paused** (by Dyma's pauser or guardian, e.g. during an incident), every deadline
stops with it and resumes for exactly the time that was left; a pause never lets a window lapse.

### Manual: what the project does

After the review grace the project gets the final list (same computation) and pays it, usually in
batched transfers prepared by Studio. Dyma checks each transaction on chain — sender, recipients,
exact amounts and token — and marks the matching payouts as paid. Your Rewards page then shows the
transaction.

## Where to see it

- **Campaign page → reward pool**: pool, mode, phase, the split rules, your projected or final
  amount, and (automatic mode) the escrow's contract, funding transaction and a "Check it yourself"
  button that reads the contract from a public node in your browser.
- **Rewards**: shares ready to claim, then every payout with its status, amount and transaction
  link.

To check an escrow independently of Dyma, follow [Verify an escrow on the explorer](./verify-an-escrow).
