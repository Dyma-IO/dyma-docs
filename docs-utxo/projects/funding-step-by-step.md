---
description: Automatic campaigns lock their pool and a refundable ADA deposit before they can launch, with one transaction.
---

# Funding the escrow, step by step

Automatic campaigns lock their pool **before** they can launch. Funding is one transaction signed by
the project's wallet: it locks the pool and a refundable ADA deposit in the campaign's state UTxO.
That wallet becomes the escrow **owner** and receives every refund.

## Before you start

- Dyma UTXO's escrow must be registered on the token's network (see
  [Deployments](../contracts/deployments)); Studio says "Funding not available" otherwise.
- The reward token is **ADA** or **one Cardano native token**, approved by Dyma UTXO.
- You are a **project admin**.
- The campaign has a **Wallet Connect quest on the escrow's network**. Earners claim their reward with
  the wallet they connect there, so Studio refuses an automatic distribution without it; the
  distribution step offers **Add Wallet Connect quest**.
- The wallet you fund from is linked to your account with its payment address proven (Studio does
  it when you connect the wallet: one or two signed messages, no fee). It holds the **pool**, the
  **deposit**, a little ADA for the network fee, and an **ADA-only UTxO of at least 5 ADA**, which
  the transaction uses as collateral (Cardano asks for one whenever a script runs).

## The deposit

Every Cardano output must hold a minimum of ADA, so your campaign's state UTxO and the claim shards
it will create (one per 20 earners) carry ADA of their own. You provide it as a deposit when you lock
the pool, sized from the **top N** (the most earners the escrow pays):

```
deposit = state deposit + shard deposit × ceil(top N ÷ 20)
```

Both deposits are computed from Cardano's current protocol parameters, for the largest data the
campaign can ever hold, with a 10% margin, and never under 2 ADA each. At today's parameters that is
about **13.2 ADA**, plus **5.8 ADA per 20 earners**: about 42.2 ADA for the top 100. Studio shows an
estimate as soon as you set the top N, and the exact amount with the funding ticket.

The deposit always comes back to the wallet that funded the escrow: at completion, with what nobody
claimed, or when the escrow is cancelled or reclaimed. When a fee is charged, up to 2 ADA of it goes
with the fee to the treasury.

## Steps

1. **Rewards & distribution.** Choose *Automatic*, the reward token, the pool, the **top N** (1 to
   20,000 earners, required), the **claim window** (how long earners can claim once claims open, 30
   days by default) and optionally the other [split rules](./distribution#split-rules) (minimum and
   maximum payout per earner, minimum points, split by points or equal, reputation boost), the review
   grace (1–72 h) and the challenge window. Save.
2. **Basics.** Set both the start and the end date. The end must be at least two hours away.
3. **Fund escrow.** Connect the wallet that will own the escrow (Lace, Eternl, VESPR, Yoroi or another
   CIP-30 wallet) and check the summary: pool, dates, review grace, challenge window, claim window,
   top N, deposit, and where refunds go.
4. Dyma UTXO signs a **one-hour funding ticket** with its ticket key. The ticket fixes the network's
   registry, the escrow version, your campaign and funding attempt, your wallet as the owner, the
   token, the pool, the dates, the fee, the split's maximum and minimum payout, the windows, the top
   N and the deposits. It also names one input of your wallet that the funding transaction must
   spend, so it can be used once.
5. **Approve the transaction in your wallet** (Studio prepares it; it stays valid 15 minutes). It
   spends that input, mints your campaign's state token and creates the state UTxO with exactly the
   pool and the deposit. The escrow scripts check the ticket's signature and rules in the same
   transaction.
6. Studio confirms the funding with Dyma UTXO, which reads the state UTxO from the chain and records
   the escrow. If you close the tab, Dyma UTXO finds the funding on chain within a minute or so. The
   campaign page then shows the escrow, the funding transaction and the balance.
7. **Review & launch.** Submit the campaign. Dates, token, pool and split rules have been fixed since
   the pool was locked.

## What the ticket protects

The escrow refuses the transaction unless the ticket is signed by the ticket key the registry names,
has not expired, names this registry and escrow version, is used by **your** wallet (which must sign)
and spends the input it names, and its parameters are within the registry's limits. Nobody else can
fund an escrow for your campaign, and nobody can change its terms after Dyma UTXO signed them.

## Common problems

| Message | Fix |
|---|---|
| On Cardano, set how many top earners are paid (1 to 20,000): it sizes the refundable ADA deposit. | set the top N in **Rewards & distribution** and save |
| The wallet needs an ADA-only UTxO of at least 5 ADA (collateral). | send at least 5 ADA to the wallet in a transaction of its own, or set collateral in the wallet's settings |
| Link this wallet (and prove its payment address) before funding with it. | connect the wallet in Studio and sign the messages it asks for |
| Use a … wallet. | switch the wallet to the token's network (mainnet or a test network) |
| The campaign needs a start date and an end date at least two hours away. | set both dates in **Basics** |
| The reward token must be verified by Dyma UTXO before locking the pool. | wait for Dyma UTXO to approve the token, or pick an approved one |
| Add a Wallet Connect quest on … to the campaign first | add one (the shortcut in the distribution step creates it on the escrow's network) and publish it |
| The pool can only be locked before the campaign goes live. | funding is only possible for draft campaigns |
| The escrow is paused. Try again later. | Dyma UTXO paused the escrows of this network; lock the pool once the pause is over |

## After funding

- Anyone can **top up** until the end date (Studio prepares the transaction).
- You can **cancel** until the start date: the whole pool and the deposit return to your wallet, and
  you can fund again later (a new ticket, a new state UTxO).
- After the campaign, earners claim their shares; once the claim window is over, Dyma UTXO's operator
  completes the escrow and what is left comes back to your wallet with the deposit.
- From then on, follow [Automatic distribution](./automatic-escrow).
