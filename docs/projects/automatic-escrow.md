---
sidebar_position: 4
---

# Automatic distribution (escrow)

In automatic mode the pool is locked **before** the campaign goes live in a campaign escrow — a
CosmWasm contract created for your campaign by Dyma's escrow factory on Safrochain. After the
campaign, Dyma's operator commits the split, a public challenge window opens, and then the contract
pays every earner. Refunds and leftovers can only ever go to **the wallet that funded it** (the
escrow owner).

:::caution Audit status
The escrow contracts passed an internal pre-audit review (32 findings, all fixed or documented) and
are **not externally audited yet**. Until an external audit is published, Dyma's runbook only allows
small internal canary amounts on mainnet. Read [Security model](../contracts/security-model).
:::

## Timeline

```
fund ─► UPCOMING ─starts_at─► ACTIVE ─ends_at─► ENDED ─commit─► COMMITTING ─finalize─► CHALLENGE ─► DISTRIBUTING ─► COMPLETED
          │ cancel (owner, before start)          │      review grace                     │ dispute (owner)      payouts + claims
          ▼                                       │                                       ▼
      CANCELLED ◄── guardian cancel (any time before finalize)                         DISPUTED ─► resolved / lapsed
                                                  └─ not finalized by the commit deadline ─► EXPIRED ─► reclaim (full refund)
```

| Step | When | Who | What happens |
|---|---|---|---|
| Fund | before submitting the campaign | you | one transaction creates your escrow and locks the pool ([step by step](./funding-step-by-step)) |
| Top up | until the end date | anyone | adds to the pool (blocked while paused) |
| Review grace | end date + 1–72 h (default 24 h) | Dyma | pending reviews are decided; payout addresses are fixed |
| Commit + finalize | after the grace, before the **commit deadline** | Dyma's operator | the sorted allocation is written in batches; finalize snapshots the balance and opens the challenge window |
| Challenge window | 1 h–7 days (default 24 h) | everyone watches | you can **dispute**; Dyma's guardian can **reject** a wrong allocation |
| Distribute | after the window | anyone (Dyma's operator runs it and pays the gas) | payouts in batches of up to 250 earners, until **completed** |
| Claim | until the **claim deadline** (default 180 days after payouts open) | each earner | pays their own entry, including a payout that failed |
| Completion | when every entry is processed | the last crank | the fee (0 by default) is charged and **the leftover is refunded to you** |

All deadlines after the end date run on the escrow's own clock, which stops while the escrow is
paused (see [Pauses](#pauses)).

## Your actions

Studio (**Rewards → Escrow & payouts**) prepares each message; you sign it with the wallet that
funded the escrow, then Studio confirms it from the transaction.

| Action | Allowed | Effect |
|---|---|---|
| Top up | until the end date | adds to the pool |
| Cancel | before the start date | refunds the **whole live balance** to you, no fee. The campaign can then be funded again |
| Dispute | during the challenge window, once per allocation version | freezes payouts while Dyma's guardian looks at it (reason, 1–280 characters) |
| Reclaim | once the escrow is **expired** | refunds the whole balance to you |

You cannot take the pool back after the start date: that is the guarantee earners rely on.

## Disputes and rejections

- A **dispute** moves the escrow to DISPUTED. It never refunds anything. The guardian decides:
  - `keep_allocation` — the dispute is dismissed, payouts start;
  - `reject_allocation` — the allocation is discarded, Dyma recomputes and commits a new version.
- If the guardian does not decide within the dispute timeout (3 days in the default mainnet
  configuration), the dispute **lapses** and the allocation is paid as committed.
- The guardian can also **reject** an allocation on its own during the challenge window or a dispute
  — never once a payout has gone out. A rejection gives the operator at least the re-commit time
  (3 days by default) to commit again; this extension happens at most twice per escrow.

## If Dyma never finalizes

The operator must finalize before the **commit deadline**: by default the end date + 14 days, and
always at least the review grace + 48 hours. If it does not, the escrow becomes **EXPIRED** and
anyone can call `reclaim_expired`: the whole balance returns to you, with no fee. A finalized escrow
never expires.

## Cancelling and funding again

Before the start date you can cancel (Dyma's guardian can cancel any time before finalize, for
example after a misconfiguration). The whole balance comes back to you. To run the campaign with an
escrow again, fund it again: Studio issues a ticket for **funding attempt n + 1**, which creates a
new escrow at a new address (the address is derived from the campaign id and the attempt number).
Every attempt stays visible in the factory's registry.

## Pauses

Dyma can pause one escrow, or every escrow through the factory (a "global" pause), during an
incident.

- A pause **stops the escrow clock**: a challenge window, commit deadline, dispute or claim deadline
  that was running resumes for exactly the time that was left. A pause can neither force an expiry
  nor make a challenge window lapse.
- A pause before the end date only blocks top-ups.
- Paused escrows refuse top-ups, commits, finalize, payouts, claims and retries. A pause never
  blocks cancel, reclaim, sweep, stray-asset refunds, disputes, rejections or dispute decisions.
- The pauser key (a hot key used by Dyma's monitoring) is rate-limited: one pause at a time, at most
  1 day each by default, a cooldown between pauses, and at most 2 × that per escrow in total. Longer
  pauses need the guardian multisig, and no pause can hold an escrow for more than 90 days in total.
- While paused, the escrow page shows the projected end of the freeze; projected deadlines move.

## Failed payouts and leftovers

- Each payout is isolated: a recipient whose transfer fails (for example a blocked module address)
  does not stop the batch. The amount stays **reserved** for that earner, who can `claim` it, and
  anyone can `retry_failed` until the claim deadline.
- When the last entry is processed, the escrow charges the fee (on what earners actually received)
  and refunds you everything else: rounding dust, skipped and cap amounts, the unused fee reserve,
  tokens that arrived after funding.
- After the claim deadline, `sweep_leftover` sends payouts that are still unclaimed back to you.
- Tokens other than the pool asset sent to the escrow by mistake can be returned to you at any time
  (`refund_stray_assets`).

## Token admin risk

The escrow can only protect what the token allows. On Safrochain, the creator (admin) of a
**tokenfactory** token can force-transfer or burn that token from any address — including an
escrow — and a **CW20** token whose contract can be migrated by its admin carries a similar risk.
Dyma inspects every reward token and shows earners a warning when its issuer keeps such powers:

| Rating | Meaning |
|---|---|
| none | no admin power over balances (e.g. IBC USDC, SAF) |
| trusted admin | an admin Dyma lists as trusted (e.g. DYMA's own treasury multisig) |
| issuer admin | the issuer could move or burn the locked pool: earners see a warning |

Prefer IBC stablecoins (USDC) or tokens whose admin was renounced.

## Who can do what

| Role | Holder | Can |
|---|---|---|
| Escrow owner | your funding wallet | top up, cancel before start, dispute, transfer ownership before start; receives every refund |
| Operator | Dyma hot key | commit, reset and finalize allocations — nothing else |
| Guardian | Dyma 2-of-3 multisig | reject an allocation, resolve a dispute, cancel before finalize, pause and unpause |
| Pauser | Dyma hot key | rate-limited pauses |
| Upgrade admin | Dyma 3-of-5 multisig (or none) | migrate the contract code (security fixes) |
| Anyone | | distribute, retry failed payouts, reclaim an expired escrow, sweep after the claim deadline |
| Earners | their payout address | claim their own entry |

The operator, guardian and pauser are read from the factory at call time, so Dyma can rotate a
compromised key on every escrow at once; the economic rules of your escrow (fee, cap, minimum
payout, windows, limits) are frozen when it is created.
