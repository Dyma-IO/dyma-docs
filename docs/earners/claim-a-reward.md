---
sidebar_position: 5
---

# Claim a token reward

Campaign escrows created since October 2026 do not send rewards on their own: when the claim window
opens, **you claim your share from your wallet**. Shares nobody claims go back to the project
when the window closes.

## Before the campaign ends

1. **Complete the campaign's Wallet Connect quest.** Every campaign with an escrow pool has one,
   on the escrow's network (Safrochain today). It links the wallet your share will be committed
   to. Earners who skip it are left out of the split ("Wallet quest of the payout network not
   completed").
2. Keep that wallet. The split commits **one address per earner**, the one the campaign page shows
   as your payout wallet, and only that wallet can sign the claim.

## When claims open

After the campaign ends, Dyma waits for the review grace (24 hours by default), publishes the split
and a public challenge window runs (24 hours by default). Claims open when that window is over.
Dyma notifies you (in the app and by e-mail) when your reward is ready to claim, and reminds you
before the deadline.

The campaign page (reward pool card) and **Rewards → Ready to claim** then show:

| State | Meaning |
|---|---|
| Waiting | the split is not claimable yet (review, publication, challenge window) |
| Ready to claim | claim before the deadline shown (a countdown) |
| Claimed | paid; the transaction is linked |
| Not claimed in time | the deadline passed: your share went back to the project |
| Below the minimum | your share is under the campaign's minimum payout: there is nothing to claim |

## Claiming

1. Choose **Claim** on the campaign page or in Rewards.
2. Connect a wallet on the escrow's network (Zunia, Keplr, Cosmostation, EightSaf or WalletConnect)
   with the **payout wallet's address**. If another account is connected, the app asks you to
   switch to the one it names.
3. Approve the transaction. It calls the escrow's `claim {}` and pays your share to that wallet in
   the same transaction. You pay a normal network fee in SAF (a few hundredths of a SAF).
4. The app confirms the transaction with Dyma and shows it on the campaign page and in Rewards.

Signed but the confirmation failed (a node was slow)? The app keeps the transaction hash and offers
**Check again**: do not sign a second time. A second claim is refused on chain anyway.

## The claim window

- The project chooses it when it sets up the pool: **30 to 365 days**, 30 by default. The campaign
  page shows when claims open and the exact deadline.
- Deadlines run on the escrow's clock: if Dyma pauses the escrow during an incident, the deadline
  moves by the time it was paused.
- After the deadline (or as soon as every share is claimed) the project can close the escrow:
  unclaimed shares, rounding dust and anything above caps go back to the project's wallet, and
  Dyma's fee (0 by default) is charged on what was claimed only.

## Older escrows

Escrows funded before claim-only payouts send rewards automatically, as described in
[Token rewards](./token-rewards#automatic-the-timeline). The campaign page says which kind a
campaign uses. In those escrows you can still claim yourself, for example a payout that failed.

## Check it yourself

`status {}` of a claim escrow reports `"payout_mode": "claim"`, and your entry
(`allocation { address }`) moves from `pending` to `paid`, or to `unclaimed` once the escrow is
closed. See [Verify an escrow on the explorer](./verify-an-escrow).
