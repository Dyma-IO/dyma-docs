---
description: In automatic mode the pool is locked in Dyma UTXO's escrow on Cardano before the campaign starts, and earners claim their shares.
---

# Automatic distribution (escrow)

In automatic mode the pool is locked **before** the campaign goes live in Dyma UTXO's escrow on
Cardano: a set of Aiken scripts deployed once per network, where your campaign is one UTxO (its
**state UTxO**) holding the pool and your refundable ADA deposit, identified by its own state token.
You lock it with one transaction signed in your wallet, and the campaign cannot launch until it is
locked ([step by step](./funding-step-by-step)).

After the campaign, Dyma UTXO's operator commits the split, a public challenge window opens, and then
**each earner claims their share** with their own wallet until the claim deadline you chose (Dyma
UTXO pays their network fees). Then the operator closes the escrow: refunds, leftovers, unclaimed
shares and the deposit can only ever go to **the wallet that funded it** (the escrow owner).

## Timeline

```
fund ─► UPCOMING ─starts_at─► ACTIVE ─ends_at─► ENDED ─commit─► COMMITTING ─finalize─► CHALLENGE ─► DISTRIBUTING ─close, complete─► COMPLETED
          │ cancel (owner, before start)          │      review grace                     │ dispute (owner)    reveal, earners claim
          ▼                                       │                                       ▼
      CANCELLED ◄── guardian cancel (any time before finalize)                         DISPUTED ─► kept, rejected or lapsed
                                                  └─ not finalized by the commit deadline ─► EXPIRED ─► reclaim (pool and deposit back)
```

| Step | When | Who | What happens |
|---|---|---|---|
| Fund | before submitting the campaign | you | one transaction locks the pool and the deposit in your campaign's state UTxO ([step by step](./funding-step-by-step)) |
| Top up | until the end date | anyone | adds to the pool (blocked while paused) |
| Review grace | end date + 1–72 h (default 24 h) | Dyma UTXO | pending reviews are decided; payout addresses are fixed |
| Commit | after the grace, before the **commit deadline** | Dyma UTXO's operator | the sorted allocation (one payment key and weight per earner) is written in hash-chained batches of up to 100 entries |
| Finalize | once everything is committed | Dyma UTXO's operator | snapshots the pool, reserves the fee, records the SHA-256 and URI of the allocation file, opens the challenge window |
| Challenge window | 1 h–7 days in the mainnet configuration (default 24 h) | everyone watches | you can **dispute**; Dyma UTXO's guardian can **reject** a wrong allocation |
| Reveal | after the window | Dyma UTXO's operator (anyone may) | the committed batches are revealed one by one into **claim shards** of 20 entries; shares below the minimum payout are left out of them |
| Claim | from the reveal until the **claim deadline** (the claim window you chose, default 30 days) | each earner, with their payout key | pays that earner's share; Dyma UTXO pays the network fee within its daily budget |
| Close and complete | after the claim deadline, or as soon as every share is claimed | Dyma UTXO's operator (anyone may) | the claim shards are closed (empty ones at once, the others at the deadline, five per transaction), then the escrow completes: the fee (0 by default) on what earners claimed goes to the treasury, **everything else and the deposit go back to you** |

All deadlines after the end date run on the escrow's own clock, which stops while the escrow is
paused (see [Pauses](#pauses)). There is nothing for you to sign after the campaign, unless you
dispute or the escrow expires.

## Your actions

Studio prepares each transaction; you sign it in your wallet, which pays the network fee and needs an
ADA-only UTxO of at least 5 ADA as collateral (Cardano asks for one whenever a script runs).

| Action | Allowed | Signed by | Effect |
|---|---|---|---|
| Top up | until the end date | any wallet | adds to the pool |
| Cancel | before the start date | the wallet that funded the escrow | the whole pool and the deposit come back to you, no fee. The campaign can then be funded again |
| Dispute | during the challenge window, once per allocation version | the wallet that funded the escrow | a reason of 1–280 characters; Dyma UTXO's guardian reviews the allocation before any payout |
| Reclaim | once the escrow is **expired** | any wallet | the whole pool and the deposit go back to the wallet that funded it |

You cannot take the pool back after the start date: that is the guarantee earners rely on.

## Disputes and rejections

- A **dispute** moves the escrow to DISPUTED. It never refunds anything; the claim window then starts
  at the later of the challenge window's end and the dispute's end. The guardian decides:
  - keep the allocation: the dispute is dismissed, claims open;
  - reject it: the allocation is discarded, Dyma UTXO recomputes and commits a new version.
- If the guardian does not decide within the dispute timeout (3 days in the mainnet
  configuration), the dispute **lapses** and the allocation stands as committed.
- The guardian can also **reject** an allocation on its own during the challenge window or a dispute,
  never once a payout has gone out. A rejection gives the operator at least the re-commit time (3
  days in the mainnet configuration) to commit again; this extension happens at most twice per
  escrow.

## If Dyma UTXO never finalizes

The operator must finalize before the **commit deadline**: by default the end date plus 14 days, and
always at least the review grace plus 48 hours. If it does not, the escrow becomes **EXPIRED** and anyone can reclaim it: the whole
pool and the deposit return to you, with no fee. A finalized escrow never expires.

## Cancelling and funding again

Before the start date you can cancel (Dyma UTXO's guardian can cancel any time before finalize, for
example after a misconfiguration). The whole pool and the deposit come back to you. To run the
campaign with an escrow again, fund it again: Studio issues a new funding ticket, which creates a new
state UTxO with a new campaign key. A ticket can be used once, since it names an input of the funding
transaction.

## Pauses

Dyma UTXO can pause one escrow, or every escrow of a network through the registry (a global pause),
during an incident.

- A pause **stops the escrow clock**: a challenge window, commit deadline, dispute or claim deadline
  that was running resumes for exactly the time that was left. A pause can neither force an expiry
  nor make a challenge window lapse.
- A pause before the end date only blocks top-ups.
- A paused escrow refuses top-ups, commits, resets, finalize, reveals, claims, shard closes and
  completion. A pause never blocks a cancel, a reclaim, a dispute, a rejection or a dispute
  decision.
- The pauser key (a hot key of Dyma UTXO) is rate-limited: one pause at a time, at most 1 day each
  in the mainnet configuration, a cooldown between pauses, and at most twice that per escrow in total.
  Longer pauses need the guardian multisig, and no pause can hold an escrow for more than 90 days in
  total.

## Who can do what

| Role | Holder | Can |
|---|---|---|
| Escrow owner | your funding wallet | top up, cancel before the start, dispute; receives every refund and the deposit |
| Operator | Dyma UTXO hot key | commit, reset and finalize allocations, checkpoint the escrow clock; Dyma UTXO also uses it to reveal, close and complete, and to pay earners' claims |
| Guardian | Dyma UTXO multisig, 2-of-3 | reject an allocation, resolve a dispute, cancel before finalize, pause and unpause |
| Pauser | Dyma UTXO hot key | rate-limited pauses |
| Governance | Dyma UTXO multisig (3-of-5 on mainnet) | change the registry's configuration (keys, fee cap, limits, the escrow version new campaigns use), pause globally, return assets sent to the scripts by mistake |
| Anyone | | top up before the end, reveal, close the shards and complete, reclaim an expired escrow |
| Earners | their payout key | claim their own entry |

The operator, guardian and pauser are read from the registry by every transaction, so Dyma UTXO can
rotate a compromised key on every escrow at once. The economic rules of your escrow (fee, cap,
minimum payout, windows, top N, deposit, limits) are frozen when it is created, and the treasury
when it is finalized; so are the campaign's other [split rules](./distribution#split-rules).

## Differences with the Cosmos escrow

Dyma's escrow on Safrochain (CosmWasm) and Dyma UTXO's escrow follow the same written rules: roles,
tickets, lifecycle, escrow clock, payout math and limits, kept identical in both contract
repositories. Cardano changes how some of them work:

| | Cosmos escrow | Cardano escrow |
|---|---|---|
| Code | one contract per campaign, created by a factory; its code can be migrated for security fixes | scripts deployed once per network, with a **registry** naming the version new campaigns use; scripts are **immutable**, so a fix is a new version for new campaigns |
| Your escrow | a contract address | a state UTxO, identified by its state token |
| Deposit | none | a **refundable ADA deposit**, sized from the top N (every Cardano output must hold ADA) |
| Claims | each earner pays the network fee | **sponsored**: Dyma UTXO pays the fee, within a daily budget |
| After the claim deadline | the owner closes the escrow and can sweep tokens that arrive later | **no close or sweep by the owner**: Dyma UTXO's operator closes the shards and completes, and everything comes back to you |
| Time | the block time | the transaction's validity range: a condition must hold over the whole range, so windows are never shorter |
| Funding attempts | recorded by the factory | single-use tickets |
| Reward token | an issuer with admin powers could move a locked pool | a native token cannot be frozen or clawed back by its issuer |

How the scripts do it: [Smart contracts](../contracts/overview).
