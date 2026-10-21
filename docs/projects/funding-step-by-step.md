---
sidebar_position: 5
---

# Funding the escrow, step by step

Automatic campaigns lock their pool **before** they can launch. Funding is one transaction signed by
the project's wallet; that wallet becomes the escrow **owner** and receives every refund.

## Before you start

- A Dyma escrow factory must be deployed on the token's chain (see
  [Deployments](../contracts/deployments)); Studio says "Funding not available" otherwise. The
  escrow runs on Safrochain today; for a token on another network, request it from Studio.
- The reward token is a bank token (SAF, IBC tokens such as USDC, tokenfactory tokens) or a CW20
  contract whose code Dyma's governance approved. Prefer tokens without an issuer admin
  ([Token admin risk](./automatic-escrow#token-admin-risk)).
- The wallet you will fund from holds the **pool** plus a little **SAF** for the fee (creating a
  campaign uses roughly 0.4 million gas, a few hundredths of a SAF at Safrochain's 0.075 usaf gas
  price).
- You are a **project admin**.
- The campaign has a **Wallet Connect quest on the escrow's network** (Safrochain today). Earners
  claim their reward with the wallet they connect there, so Studio refuses an automatic
  distribution without it; the distribution step offers **Add Wallet Connect quest**.

## Steps

1. **Rewards & distribution.** Choose *Automatic*, the reward token, the pool, the **claim window**
   (how long earners can claim once claims open: 30–365 days, default 30), and optionally the
   [split rules](./distribution#split-rules) (minimum and maximum payout per earner, top N, minimum
   points, split by points or equal, reputation boost), the review grace (1–72 h) and the challenge
   window (1 h–7 days). Save.
2. **Basics.** Set both the start and the end date. The end must be at least two hours away.
3. **Fund escrow.** Connect the wallet that will own the escrow (Zunia, Keplr, Cosmostation,
   EightSaf, or WalletConnect), check the summary — pool, dates, review grace, challenge window,
   claim window, where refunds and unclaimed shares go — and choose to lock the pool.
4. Dyma signs a **one-hour funding ticket**: a message binding the chain, the factory, your
   campaign, your wallet address, the token, the escrow code (claim-only since October 2026) and
   the exact parameters. Studio shows the escrow address **before** you sign (it is derived from
   the campaign id and the funding attempt).
5. **Approve the transaction in your wallet.** It calls the factory's `create_campaign` with the
   ticket and sends exactly the pool (for a CW20 token, a CW20 `send` to the factory). The factory
   checks the ticket, creates your escrow and moves the pool into it in the same transaction.
6. Studio confirms the transaction with Dyma, which reads the factory event and registry and records
   the escrow. The campaign page then shows the contract, the funding transaction and the balance.
7. **Review & launch.** Submit the campaign. Dates, token, pool and split rules have been fixed since
   the pool was locked.

Signed it elsewhere (for example from a multisig or the CLI)? Paste the transaction hash in the
funding card; Dyma verifies it the same way.

## What the ticket protects

The factory refuses the transaction unless the ticket is signed by Dyma's ticket key, has not
expired, names this factory, this chain and **your** wallet as the funder, and its parameters are
within the factory's limits. Nobody else can fund an escrow for your campaign, and nobody can change
its terms after Dyma signed them.

## Common problems

| Message | Fix |
|---|---|
| The funding ticket expired | lock again: a new ticket is requested |
| Insufficient funds | the wallet needs the pool **and** SAF for the fee |
| Wrong chain / unknown chain in the wallet | approve the chain suggestion, or switch the wallet to the token's chain |
| The pool can only be locked before the campaign goes live | funding is only possible for draft campaigns |
| Dates differ from the escrow's | an escrow funded for other dates cannot back this campaign; cancel it (before the start) and fund again |
| Add a Wallet Connect quest on Safrochain to the campaign first | add one (the shortcut in the distribution step creates it on the escrow's network) and publish it |
| The ticket's escrow code does not match the factory | Dyma switched the factory to a new escrow code after the ticket was issued: lock again to get a new ticket |

## After funding

- Anyone can **top up** until the end date (Studio prepares the message).
- You can **cancel** until the start date: the whole balance returns to your wallet, and you can
  fund again later (a new funding attempt, a new escrow address).
- After the campaign, earners claim their shares; once the claim window is over, **Withdraw
  unclaimed tokens** returns what is left to your wallet.
- From then on, follow [Automatic distribution](./automatic-escrow).
