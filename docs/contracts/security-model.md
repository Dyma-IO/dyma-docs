---
sidebar_position: 4
---

# Security model

What the escrow guarantees, what it cannot, and how far it has been reviewed.

## What is protected

- **Pools** — each campaign's tokens sit in their own escrow address (one per funding attempt).
- **Earner payouts** — every address of a finalized allocation is entitled to
  `min(floor(D × w / W), cap)` (or nothing below the minimum payout) and to a full claim window to
  claim or retry a payout that failed.
- **Owner refunds** — everything not paid out (dust, skipped and cap amounts, the unused fee
  reserve, stray deposits, failed payouts after the claim deadline, expiry, cancellation) goes back
  to the campaign owner, and only to it.
- **Fee** — at most `fee_bps` of what earners actually received, charged once at completion;
  `fee_bps` ≤ the factory's `max_fee_bps` ≤ 10%. Dyma's default is 0.
- **Review time** — a public challenge window (and an owner dispute) before any payout, which no hot
  key can shorten: pauses stop the escrow clock instead of letting windows lapse.

## Trust assumptions

The contracts cannot enforce these; they are disclosed and monitored:

1. **Verification is off chain.** The contracts cannot know who really earned points. They make
   the allocation public and hashed, open a challenge window, bound the damage per address (cap),
   and only let funds leave to the allocation, the treasury (fee) or the owner. The allocation hash
   is recorded, not checked on chain: watchers (Dyma's indexer, owners, the guardian) recompute it.
2. **Roles are live, so governance is trusted for unfinalized pools.** A compromised governance
   quorum (3-of-5) could install its own operator and guardian and, for campaigns not finalized yet,
   commit a malicious allocation and dismiss the owner's dispute. It cannot change a live escrow's
   economic rules. Governance actions are public events and must be monitored.
3. **The upgrade admin** (3-of-5) can migrate the factory and every instance whose admin is set.
   New instances can be made immutable; they still read roles from the factory.
4. **Token issuers.** A tokenfactory admin can force-transfer or burn tokens held by the escrow; a
   CW20 runs its own code (only governance-approved CW20 code checksums are accepted). Dyma shows a
   token-admin-risk warning on such tokens.
5. **The chain** (CosmWasm, wasmd v0.54.1, Safrochain) behaves as specified.

## Hot keys and their limits

| Key | Worst case if compromised | Bounded by |
|---|---|---|
| Operator | commits arbitrary (non-privileged) addresses before finalize | challenge window, owner dispute, guardian rejection, cap per address, Dyma's indexer comparing every operator transaction with its own log and pausing on a mismatch, key rotation |
| Ticket signer | registers fake campaigns (no theft: the funder must be the ticket's owner) | ticket expiry, chain/factory/code/admin binding, rotation invalidates unused tickets |
| Pauser | delays an escrow by at most 2 × the max pause (2 days by default) | cooldown, per-escrow budget, cannot force an expiry or make a window elapse |

Multisigs (guardian 2-of-3, governance and upgrade 3-of-5) are held on hardware wallets with an
external co-signer. Guardian signers must be on call during every challenge window: once a window
is over (on the escrow clock), an allocation is final.

## Invariants

Checked after every step of randomized scenarios (240,000 steps in the final run, including instance
and global pauses of both kinds, adversarial calls and external drains), and on the real chain binary
by the localnet end-to-end tests:

- I1 paid + failed outstanding + fee + refunded ≤ total received
- I2 no entry is paid twice
- I3 the sum of payouts ≤ D, and every recorded amount equals the formula
- I4 the owner receives funds only through cancel, expiry, completion (leftover) or sweep
- I5 privileged addresses never receive payouts (the treasury only the fee)
- I6 entries are immutable after finalize
- I7 the fee is paid at most once, by the completing crank, never above `D × fee_bps / 10 000`,
  and is 0 when nothing was paid
- I8 the balance covers outstanding obligations, unless an external drain happened
- the escrow clock is monotone, a pause blocks exactly when it stops the clock, overlapping pauses
  count once, and the pauser budget and the 90-day cap hold

## Audit

| | Status |
|---|---|
| Internal pre-audit review | **Done.** Four independent lenses (access control, funds and math, state machine and time, DoS and deployment). 32 findings — 1 high, 6 medium, 15 low, 10 informational — each fixed with a regression test written to fail first, or documented as an accepted risk |
| Test suite | 145 Rust tests (unit, multi-test, property), randomized invariants, 11 localnet end-to-end scenarios on safrochaind v0.2.2 (the mainnet binary) asserting every balance movement and the gas budgets |
| External audit | **Pending.** Scope: both contracts and the shared packages (≈ 5,100 lines); priorities: fund flows and fee accounting, the escrow clock, reply handling, phases and time boundaries, ticket verification, factory → instance trust, authorization, DoS, migration |
| Mainnet | Not deployed. Until an external audit report is published, only small internal canary amounts on mainnet |

The high-severity internal finding (ST-1) showed that a pause could not buy the guardian time: a
paused escrow past its challenge deadline would have paid a rogue allocation when the pause ended.
It was fixed by the escrow clock, which stops every deadline while the escrow is paused.

Residual risks to be re-examined by the external audit: trusted off-chain verification, live roles
(governance trust for unfinalized pools), the upgrade admin, token issuers' powers, key management
(guardian availability during challenge windows), operator liveness (if Dyma never finalizes, owners
reclaim and earners get nothing on chain), and the release build pipeline (artifacts must come from
the CI on a tag and match the published checksums).

## Reporting a vulnerability

E-mail [dymaweb3@gmail.com](mailto:dymaweb3@gmail.com) privately. Do not open public issues for
security problems.
