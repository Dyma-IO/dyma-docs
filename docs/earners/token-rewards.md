---
sidebar_position: 4
---

# Token rewards

Points (DP) are Dyma's own score. A campaign can also have a **reward pool** in a real token (for
example USDC or SAF on Safrochain). At the end of the campaign the pool is split between earners
**in proportion to their points in that campaign**.

## How your share is computed

```
your share ≈ pool × your points ÷ all eligible points
```

- **Which points count**: quests you submitted **before the campaign ended** and that were verified
  **before the end of the review grace** (24 hours by default, set per campaign between 1 and 72
  hours). Anything still in review after the grace is out.
- **Minimum payout**: a share below the campaign's minimum (by default one hundredth of a token,
  e.g. 0.01 USDC) is not paid; those earners are left out and the pool is shared between the others.
- **Cap**: a campaign can cap any single share (for example 10% of the pool).
- Amounts are rounded down to the token's smallest unit; the few units left over are handed out one
  by one so the whole pool is used. The exact rules, with examples, are in
  [Distribution modes and the split](../projects/distribution).

During the campaign the campaign page shows your points, your share so far and a projected amount.
After the grace it shows the final amount.

## Two ways the pool is paid

| | Manual distribution | Automatic distribution (escrow) |
|---|---|---|
| Where the pool is | in the project's wallet | locked in an escrow contract on Safrochain since before the campaign went live |
| Who pays | the project, with Dyma's payout assistant | the contract, after a public challenge window |
| What you see | "Paid by *project*" and the payout transaction | escrow address, funding transaction, live balance, then your payout transaction |
| Guarantee | the project's word: Dyma computes the exact amounts and checks every payout transaction on chain, but cannot force payment | the pool cannot leave the escrow except to earners (or back to the owner under the rules below) |

### Automatic: the timeline

1. **Campaign ends.** Points stop counting new completions.
2. **Review grace** (default 24 h). Pending reviews are decided; payout addresses are fixed.
3. **Commit and finalize.** Dyma's operator writes the allocation (address and weight per earner)
   to the escrow and publishes the allocation file whose SHA-256 is recorded on chain.
4. **Challenge window** (default 24 h, between 1 hour and 7 days). Anyone can check the allocation;
   the project can dispute it once, and Dyma's guardian multisig can reject a wrong one (it is then
   recomputed and committed again).
5. **Payouts.** The contract pays everyone in batches. Gas is paid by Dyma's operator. If a payout
   to your address fails, it stays reserved for you.
6. **Claim (optional).** Until the claim deadline (by default 180 days after payouts open) you can
   also call `claim` yourself from your wallet — useful if your payout failed or you do not want
   to wait for the next batch.

If the escrow is **paused** (by Dyma's pauser or guardian, e.g. during an incident), every deadline
stops with it and resumes for exactly the time that was left; a pause never lets a window lapse.

### Manual: what the project does

After the review grace the project gets the final list (same computation) and pays it, usually in
batched transfers prepared by Studio. Dyma checks each transaction on chain — sender, recipients,
exact amounts and token — and marks the matching payouts as paid. Your Rewards page then shows the
transaction.

## Where to see it

- **Campaign page → reward pool**: pool, mode, phase, your projected or final amount, and (automatic
  mode) the escrow's contract, funding transaction and a "Check it yourself" button that reads the
  contract from a public node in your browser.
- **Rewards**: every payout with its status, amount and transaction link.

To check an escrow independently of Dyma, follow [Verify an escrow on the explorer](./verify-an-escrow).
