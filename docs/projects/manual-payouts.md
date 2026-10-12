---
sidebar_position: 6
---

# Manual payouts

In manual mode you keep the pool and pay earners yourself after the campaign. Dyma computes the
same split as the escrow would, prepares the transfers, and checks every payout transaction on
chain before marking anyone as paid.

## When

The final list is frozen at **end of campaign + review grace** (24 hours by default). Before that,
**Rewards → Escrow & payouts** shows a live preview and the [distribution CSV](./exports) exports
it with the status `projected`.

## Paying with the payout assistant

1. Open **Rewards → Escrow & payouts** and the campaign's **Payout assistant**. Earners are grouped
   in batches of up to **100 transfers** — one bank `MsgMultiSend` per batch (one input: your wallet;
   one output per earner with the exact amount), each with its own memo.
2. Connect a wallet of the project team (Keplr, Leap, Cosmostation, EightSaf or WalletConnect) on the
   token's chain. It needs the batch total plus SAF for the fee.
3. Sign the batch. Studio sends the transaction hash to Dyma, which checks it on chain:
   - the transaction succeeded and contains only bank sends,
   - the sender is a wallet of the project team,
   - every recipient has an unpaid allocation in this distribution, appears once, and receives
     **exactly** its amount in the campaign's token.
4. The matching allocations become **paid**; earners see "Paid by *your project*" with the
   transaction link and get a notification.

Repeat for each batch. The assistant shows what is pending, submitted and paid.

## Paid another way

- **Attach a transaction hash** — for transfers signed elsewhere (a multisig, a CLI, another tool):
  the same on-chain checks apply.
- **Mark as paid** — for payouts made without a matching on-chain transfer (for example settled off
  Dyma): select the allocations, add a note (and a transaction hash if you have one). This is
  recorded in the project's audit log, and earners see the payout as paid by the project.

## Who is left out

The same exclusions as in automatic mode apply (no payout wallet on the token's chain, below the
minimum payout, shared address, project member, suspended account). Earners are told the reason and,
before the list is frozen, how to fix a missing payout wallet.

## Good practice

- Pay soon after the list is frozen: earners see the campaign as **Distributing** until every payout
  is recorded, then **Distributed**.
- Keep the token's decimals in mind: amounts in the CSV are given both in base units
  (`amount_base`) and in display units (`amount_display`).
- If you want the pool to be guaranteed to earners up front, use [automatic distribution](./automatic-escrow) instead.
