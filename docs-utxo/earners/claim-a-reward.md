---
description: In an escrow campaign you claim your share with your payout wallet, and Dyma UTXO pays the network fee.
---

# Claim a token reward

In a campaign paid by Dyma UTXO's escrow, rewards are not sent on their own: when claims open, **you
claim your share with your wallet**, and Dyma UTXO pays the network fee. Shares nobody claims go back
to the project after the claim deadline.

## Before the campaign ends

1. **Complete the campaign's Wallet Connect quest.** Every escrow campaign has one, on the escrow's
   network. Earners who skip it are left out of the split ("Wallet quest of the payout network not
   completed").
2. **Prove your payout address.** The split commits the payment key of your payout address, the
   address your wallet proved with its second signature
   ([Your payout address](./wallets#your-payout-address)). Without one you are left out.
3. **Keep that wallet.** Only its payment key can sign your claim.

## When claims open

After the campaign ends, Dyma UTXO waits for the review grace (24 hours by default), then commits the
split to the escrow and finalizes it, and a public challenge window runs (24 hours by default).
When the window is over, Dyma UTXO reveals the committed shares batch by batch into **claim shards**
of 20 entries each; your claim opens as soon as your batch is revealed, usually within minutes. A
claim asked for before that says when to come back.

Dyma UTXO notifies you when your reward is ready to claim, and reminds you a week and a day before
the deadline if you have not claimed it.

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
2. Connect the wallet of your **payout address** (Lace, Eternl, VESPR, Yoroi or another CIP-30
   wallet) on the escrow's network. If another wallet is connected, the app names the one to use.
3. Check the amount and approve. Dyma UTXO prepared the transaction: it takes your entry out of its
   claim shard and sends your share to your payout address. Your wallet signs it with your payment
   key, and Dyma UTXO adds its own signature.
4. Dyma UTXO submits the transaction and shows it on the campaign page and in Rewards.

### Dyma UTXO pays for the claim

Dyma UTXO's operator pays the claim's network fee, provides its collateral (the guarantee a
transaction that runs a script must carry), and pays the ADA that a native-token output must hold
(it stays with you). Nothing leaves your wallet.

Sponsored claims have a daily budget, all campaigns together: by default 500 claims and 1,000 ADA
per UTC day. When the day's budget is used up, the app asks you to try again the next day (UTC);
your share stays reserved for you until the claim deadline. If Dyma UTXO pauses sponsored claims,
claims wait until they resume.

## The claim window

- The project chooses it when it locks the pool, within the limits of the escrow's registry (30 to
  365 days in the mainnet configuration), 30 days by default. The campaign page shows when claims
  open and the exact deadline.
- Deadlines run on the escrow's clock: if the escrow is paused, claims wait and the deadline moves by
  the time it was paused.
- After the deadline, or as soon as every share is claimed, Dyma UTXO's operator closes the claim
  shards and completes the escrow: unclaimed shares, rounding dust, amounts above the maximum payout
  and the project's refundable ADA deposit go back to the project's wallet, and Dyma UTXO's fee (0
  by default) is charged on what earners claimed only.

## How much you receive

Your share is fixed when the split is published: in proportion to your points (or equal, if the
project chose so) under the campaign's rules: minimum points, top N, maximum and minimum payout,
reputation boost. Amounts are rounded down to the token's smallest unit. The rules, with examples,
are in [Distribution modes and the split](../projects/distribution).

## Check it yourself

Your claim is a Cardano transaction that spends the campaign's claim shard and pays your payout
address; open it on Cardanoscan from your Rewards page. What the escrow's scripts check, and where
they are deployed, is in [Smart contracts](../contracts/overview).
