---
sidebar_position: 1
---

# Smart contracts overview

Dyma's **campaign reward escrow** backs the *automatic* distribution mode, and the **reputation
contract** certifies Dyma Reputation tiers as soulbound badges. Both are written in Rust for
CosmWasm 2.2 and target Safrochain (`safrochain-1`: safrochaind v0.2.2, wasmd v0.54.1, wasmvm
v2.2.4).

| Crate | Version | Notes |
|---|---|---|
| `dyma-escrow-factory` | 0.1.0 | unchanged since launch (code 14) |
| `dyma-campaign-escrow` | **0.2.0** | claim-only payouts for new campaigns; 0.1.0 (code 13) instances keep push payouts |
| `dyma-reputation` | 0.1.0 | soulbound, CW721-compatible reputation badges |

:::caution Audit status
**Internal pre-audit review: done** — four independent review lenses (access control, funds and
math, state machine and time, DoS/deployment), 32 findings (1 high, 6 medium, 15 low,
10 informational), every one fixed with a regression test or documented as an accepted risk.
**External audit: pending.** Until an external audit report is published, Dyma's runbook allows only
small internal canary amounts on mainnet. Nothing in Dyma's products may describe the escrow as
"audited".
:::

## Architecture

```
                    ┌──────────── dyma-escrow-factory (one per chain) ────────────┐
 Dyma API ─ ticket ─►│ config: owner, operator, ticket signer, pauser, guardian,  │
 (signs off chain)  │         treasury, escrow code id + admin, max fee, limits    │
                    │ registry: campaign → latest funding attempt (+ history)       │
 owner wallet ── create_campaign{ticket, signature} + pool ──► verify ─► instantiate2
                    └───────────────────────────────────────────────────────┬──────┘
                                                                            ▼
                    dyma-campaign-escrow (one per campaign funding attempt) holds the pool
```

| Contract | Crate | Role |
|---|---|---|
| Escrow factory | `dyma-escrow-factory` | one per chain. Holds the trust configuration, verifies API-signed **campaign tickets**, creates one escrow per campaign funding attempt with `instantiate2` (salt = `sha256("<campaign_id>:<funding_attempt>")`, so the address is known before funding), keeps the registry and the global pause ledger |
| Campaign escrow | `dyma-campaign-escrow` | one per campaign funding attempt. Holds exactly one asset (a bank denom — native, IBC, tokenfactory — or an approved CW20), takes the operator's sorted allocation, snapshots its balance at finalize, runs the challenge window, then pays by **recipient claims** (0.2.0, `payout_mode: "claim"`) or through a permissionless crank (0.1.x, `push`), and refunds only the owner |
| Reputation | `dyma-reputation` | one per chain. Mints a soulbound badge to the wallet that submits a Dyma-signed attestation, burns the previous badge of the same account, keeps one badge per account and per wallet; CW721 queries; ICS-721 export path closed until a bridge is set |

Design choices:

- **Economic rules frozen per escrow** — fee, cap, minimum payout, windows and a copy of the
  factory's limits are fixed at creation; the treasury is fixed at finalize. Governance changes
  reach new campaigns only.
- **Live roles** — operator, pauser, guardian and treasury are read from the factory at call time,
  so a compromised key can be rotated on every escrow at once.
- **Escrow clock** — every deadline after the end date runs on a per-escrow clock that stops while
  the escrow is paused.
- **Factory independence** — a finalized escrow pays out even if the factory can no longer be
  queried.
- **Fault isolation** — each payout is a sub-message whose failure only marks that entry failed.

## Lifecycle

```
UPCOMING → ACTIVE → ENDED → COMMITTING → CHALLENGE (→ DISPUTED) → DISTRIBUTING → COMPLETED
   ↘ CANCELLED (owner before start, guardian before finalize)   ↘ EXPIRED (not finalized in time: owner reclaims)
```

In DISTRIBUTING, a **claim** escrow waits for each recipient's `claim {}` until the claim deadline;
`close {}` (anyone, after the deadline or once everything is claimed) completes it and returns the
unclaimed rest to the owner. A **push** escrow is cranked with `distribute {}` until it completes.

```
payout_i = min( floor(D × weight_i / W), cap ),  skipped below min_payout
D        = balance at finalize − fee reserve
fee      = floor(paid_total × fee_bps / 10 000), charged once at completion (Dyma default: 0)
```

The product-level explanation (timeline, disputes, pauses, leftovers) is in
[Automatic distribution](../projects/automatic-escrow); the split, with worked examples, in
[Distribution modes and the split](../projects/distribution).

## Roles

| Role | Holder (production) | Powers |
|---|---|---|
| Factory owner (governance) | `dyma-gov` 3-of-5 multisig | update config (new campaigns), global pause, rescue funds sent to the factory by mistake, ownership transfer |
| Operator | `dyma-operator` hot key (AWS KMS) | commit, reset and finalize allocations |
| Ticket signer | `dyma-ticket` hot key (AWS KMS) | signs funding tickets off chain; only its public key is on chain |
| Pauser | `dyma-pauser` hot key (AWS KMS) | rate-limited pauses (budget per escrow) |
| Guardian | `dyma-guardian` 2-of-3 multisig | reject an allocation, resolve a dispute, cancel before finalize, pause/unpause |
| Treasury | fee recipient | receives the fee (0 by default) |
| Upgrade admin | `dyma-upgrade` 3-of-5 multisig, or none | migrate the factory and instances (security fixes only) |
| Campaign owner | the funding wallet | top up, cancel before start, dispute, ownership transfer before start; receives every refund |
| Recipients | committed addresses | claim their own entry |
| Anyone | | close a claim escrow, distribute and retry failed payouts (push escrows), reclaim an expired escrow, sweep, refund stray assets |
| Reputation owner | Dyma governance key | reputation contract: tiers, attester rotation, pause, badge revocation, IBC bridge |
| Reputation attester | `dyma-reputation` hot key (API signer) | signs badge attestations off chain; only its public key is on chain |

Role separation is enforced by the factory: the guardian differs from the operator and the pauser;
the upgrade admin differs from the operator, the pauser and the treasury; the operator is not the
treasury. Privileged addresses can never be committed as recipients.

## Reference documents

The contracts repository (`Dyma-IO/dyma-contracts`, private until the audit report is published)
carries the authoritative documents. This site summarises them:

| Document | Summary here |
|---|---|
| `docs/SPEC.md` — interface, roles, state machine, math, events, measured gas | [Messages](./messages), [Events](./events) |
| `docs/THREAT_MODEL.md` — trust assumptions, threats, invariants, residual risks | [Security model](./security-model) |
| `docs/RUNBOOK.md` — key ceremony, deployment, multisig flow, incident playbooks | [Escrow operations](../operators/escrow-operations) |
| `docs/AUDIT_SCOPE.md` — what an auditor reviews and how to build and test it | [Security model](./security-model#audit) |
| `docs/INTERNAL_AUDIT.md` — internal findings and outcomes | [Security model](./security-model#audit) |
| `contracts/*/schema/` — machine-readable JSON schema | generated from `packages/escrow-types` and the reputation crate |

Build: release artifacts come from `cosmwasm/optimizer:0.16.1` (Rust 1.81) and are gated by
`cosmwasm-check` 2.2.x — newer toolchains emit WebAssembly features Safrochain's VM refuses at upload.
