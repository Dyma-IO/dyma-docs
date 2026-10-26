---
description: Dyma UTXO's Aiken contracts on Cardano, the campaign escrow (a registry and five scripts) and the reputation badges.
---

# Smart contracts overview

Dyma UTXO's smart contracts back the *automatic* distribution mode (the **campaign escrow**) and
certify Dyma Reputation tiers (the **reputation badges**). They are written in
[Aiken](https://aiken-lang.org) v1.1.24 for Plutus V3 and published under the MIT license in
[Dyma-IO/dyma-contracts-cardano](https://github.com/Dyma-IO/dyma-contracts-cardano).

| Contract | Version | Scripts |
|---|---|---|
| Campaign escrow | 0.1.0 | `registry`, `campaign_policy`, `campaign_state`, `campaign_payout`, `campaign_admin`, `campaign_shard` |
| Reputation badges | 0.1.0 | `reputation` (CIP-68) |

Where they are deployed: [Deployments](./deployments).

## Architecture

A Cardano transaction, and so any script it carries, is capped at 16 KB. The escrow is therefore
split into five campaign scripts plus a registry, each deployed once per network as a **reference
script** that transactions use without carrying its code.

```
                  ┌──────────── registry (one per network) ────────────────────────────┐
 Dyma UTXO API ──►│ registry NFT + datum: governance and guardian multisigs, operator,  │
 (ticket key)     │ pauser, ticket key, treasury, current escrow version, fee cap,      │
                  │ limits, latest 16 global pauses                                     │
                  └──────────────────────────▲─────────────────────────────────────────┘
                                             │ reference input of every campaign transaction
 owner wallet ── Create(ticket, signature) ──► campaign_policy (mints the state token)
                  campaign_state  ─ the state UTxO: state token, pool, owner's ADA deposit
                     ├─ funding, allocation and challenge transitions
                     └─ hands payouts to campaign_payout, pauses/ownership/clock to campaign_admin
                        (zero-ADA withdrawals in the same transaction)
                  campaign_shard  ─ claim shards: shard token, up to 20 entries, deposit
```

- **One UTxO per campaign.** Each funding attempt is one state UTxO, named by a 28-byte **campaign
  key**: the BLAKE2b-224 hash of an input that the funding transaction spends. Keys are unique by
  construction, and a ticket can be used once.
- **Withdraw zero.** For a payout or admin transition, `campaign_state` only checks that the matching
  script's zero-ADA withdrawal is in the transaction; that script then validates every campaign state
  the transaction spends.
- **Live roles, frozen rules.** Campaign transactions read the registry as a reference input, so a key
  rotation applies to every campaign at once. A campaign's economic rules (fee, cap, minimum payout,
  windows, top N, deposits, a copy of the limits) are frozen when it is created; its treasury when it
  is finalized.
- **Immutable scripts.** A corrected escrow is a new set of script hashes: governance points the
  registry at it and new campaigns use it. Existing campaigns keep their scripts.

## The scripts

| Script | Handler | Size | What it does |
|---|---|---:|---|
| `registry` | mint, spend | 5.9 KB | the trust configuration of a network, in the datum of a one-shot NFT (`dyma-registry`): roles, ticket key, treasury, the escrow version new campaigns use, fee cap, limits, and the latest 16 global pauses |
| `campaign_policy` | mint | 5.5 KB | creates a campaign from a ticket signed by Dyma UTXO; mints its state token, and its shard tokens later |
| `campaign_state` | spend | 14.6 KB | the campaign's state UTxO: funding, top-ups, cancel, expiry, commits, resets, finalize, the challenge window, disputes and rejections |
| `campaign_payout` | withdraw | 13.1 KB | reveals the committed allocation into claim shards, closes the shards, completes the campaign |
| `campaign_admin` | withdraw | 10.6 KB | pauses and unpauses, two-step ownership transfers, clock checkpoints |
| `campaign_shard` | spend | 9.3 KB | claim shards: each earner's claim, and the shards' closes |
| `reputation` | mint, spend | 5.6 KB | the reputation badges (CIP-68) and their configuration: attested claims, upgrades, revocation |

### `registry`

One per network, parameterised by a seed output: its NFT can be minted once, when the seed is spent,
and its script hash is both the NFT's policy id and the payment credential of the registry address.

| Redeemer | Who | Effect |
|---|---|---|
| `UpdateConfig` | the governance threshold (and the new governance's, when it changes) | any change but the pause history; the result must pass the registry's checks: limits, multisig thresholds, role separation |
| `GlobalPause { until }` | the pauser (rate-limited), the guardian or governance | pauses every campaign of the network; a segment is added to the history, which keeps the latest 16 |
| `GlobalUnpause` | the guardian or governance | ends the active global pause |

The reference scripts and the registry UTxO sit at the registry address, where only governance can
move them. A UTxO sent there by mistake leaves only with an `UpdateConfig`.

### `campaign_policy`

`Create { ticket, signature }` creates a campaign. The ticket names the network's registry and escrow
version, the campaign and its funding attempt, the owner (who must sign), the asset, the minimum
funding, the dates, the fee, the minimum payout, the maximum share, the three windows, the maximum
number of recipients (the top N), the deposits, an expiry and the seed input. The policy checks it
against the registry's limits with the rules every Dyma escrow follows, verifies the Ed25519
signature of the registry's ticket key over the ticket's BLAKE2b-256 hash, requires the seed to be
spent, and mints exactly one state token into a state
output that holds the initial state, the deposit and at least the minimum funding. Shard tokens are
minted only alongside a spend of their campaign's state UTxO.

### `campaign_state`

The state UTxO holds exactly the state token, the pool (ADA or one native token) and the owner's
deposit in ADA. Every transition writes the expected new datum, compared field by field.

| Redeemer | Who | When | Effect |
|---|---|---|---|
| `TopUp` | anyone | before the end, not paused | the pool grows |
| `Cancel` | the owner before the start; the guardian any time before finalize | not finalized | everything but the state token goes back to the owner; the token is burned |
| `ReclaimExpired` | anyone | expired: not finalized by the commit deadline | same as a cancel |
| `Commit` | the operator | after the end, not paused | up to the registry's batch limit (100), a multiple of 20 except the first batch committed; strictly ascending 28-byte keys below the lowest committed one; positive weights; no privileged key; at most the campaign's maximum number of recipients; each batch extends a hash chain |
| `Reset` | the operator | before finalize | discards the commitments (version + 1) |
| `Finalize` | the operator | everything committed | checks the expected count and total weight, records the allocation file's SHA-256 and URI, snapshots the pool, reserves the fee, opens the challenge window, freezes the treasury |
| `RaiseDispute` | the owner | challenge window, once per allocation version | a reason of 1 to 280 characters; claims wait until the dispute is resolved or lapses |
| `Reject` | the guardian | challenge window or dispute | discards the allocation and gives the operator time to commit again (twice at most) |
| `Resolve` | the guardian | dispute | keeps the allocation (claims open) or rejects it |

### `campaign_payout`

| Redeemer | Who | Effect |
|---|---|---|
| `Reveal` | anyone, after the challenge window and before the claim deadline | replays the next committed batch against the hash chain and turns its payable entries into claim shards of 20 entries, in order; the pool and one shard deposit per shard move to the shards, and one shard token is minted per shard |
| `CloseShards` | anyone | closes shards of the campaign: empty ones at any time, the others at the claim deadline; their value goes to the owner, their tokens are burned, and unclaimed entries are counted |
| `Complete` | anyone, once no shard is open and everything is revealed or the claim deadline passed | charges the fee once, `min(floor(paid × fee_bps / 10 000), max_fee, pool)`, to the treasury (with at most 2 ADA of the deposit, since every Cardano output needs ADA), sends everything else to the owner, burns the state token |

### `campaign_admin`

| Redeemer | Who | Effect |
|---|---|---|
| `Pause { until }` | the pauser or the guardian | stops the campaign's clock; the pauser is rate-limited (one pause at a time, a cooldown, a budget per campaign) |
| `Unpause` | the guardian | ends the pause |
| `TransferOwnership`, `AcceptOwnership`, `CancelOwnershipTransfer` | the owner, then the new owner | two-step ownership transfer before the start (a pending transfer can be cancelled at any time) |
| `Sync` | the operator | a checkpoint of the campaign's clock, so it never depends on more global pauses than the registry keeps |

### `campaign_shard`

| Redeemer | Who | Effect |
|---|---|---|
| `Claim { index }` | the key of that entry (its signature) | reads the campaign's state UTxO as a reference input; the campaign must be distributing, not paused and before its claim deadline; an output to the entry key's address holds at least the amount, and the shard continues without that entry |
| `ShardClose` | with the state UTxO's `CloseShards` | the shard closes in the same transaction |

Anything else sent to the escrow or shard addresses (without a campaign token) can only leave with a
`Rescue` signed by governance.

### Reputation badges

`reputation` is one script parameterised by a seed output. Its hash is the badges' policy id and the
address that holds the configuration (an NFT named `dyma-reputation`) and every badge's reference
token. Dyma UTXO computes reputation off chain and signs attestations; the script checks them.

| Redeemer | Who | Effect |
|---|---|---|
| mint `Init` | whoever spends the seed | the configuration NFT, once, into a valid configuration: governance multisig, attester (Ed25519 public key), paused flag, collection name and description, tiers (1 to 32, ascending, boosts between 1.00 and 5.00 never decreasing) |
| mint `Claim { attestation, signature }` | the attested owner (signature) | not paused; signed by the attester; the attestation names this policy, spends its seed (single use), has not expired and was issued at most 10 minutes ahead; the tier exists and the score reaches it; mints exactly the pair (label 100 reference at the script with its CIP-68 datum, label 222 user token) |
| mint `Burn` | holders | burns tokens only (a holder burns its user token) |
| spend `UpdateConfig` | governance | any valid configuration |
| spend `Retire` (a reference) | a newer claim of the same account in the same transaction, or governance (revocation) | burns the reference token |

**Validity rule.** An account's badge is its reference with the highest nonce, and it counts only
while its user token sits at an address whose payment key is the reference's owner: soulbound in
effect. Badges carry no economic power: the boost a split applies comes from Dyma UTXO's records.
For earners: [Reputation badge (CIP-68)](../earners/reputation-badge).

## Lifecycle

```
UPCOMING → ACTIVE → ENDED → COMMITTING → CHALLENGE (→ DISPUTED) → DISTRIBUTING → COMPLETED
   ↘ CANCELLED (owner before start, guardian before finalize)   ↘ EXPIRED (not finalized in time: anyone returns everything to the owner)
```

Phases are derived from the state and the transaction's validity range, never stored. A transition
requires its phase over the whole range; "reached" checks use its lower bound and "not yet" checks
its upper bound; new deadlines are computed from the escrow clock at the upper bound, so every
window is at least as long as it would be on block time. Ranges span at most one hour for pauses
and one day otherwise.

Every deadline after the end runs on the **escrow clock**, which stops while the campaign is paused
(by its own pause or a global one). Pauses block top-ups, commits, resets, finalize, reveals,
claims, shard closes and completion; they never block cancel, expiry, dispute, reject or resolve, and
they can stop one campaign's clock for 90 days in total at most.

## Payout math

```
B        = pool at finalize
max_fee  = floor(B × fee_bps / 10 000)
D        = B − max_fee                                  distributable
cap      = floor(D × max_share_bps / 10 000)            per-earner cap
amount_i = min(floor(D × w_i / Σw), cap)                skipped when 0 or below min_payout
fee      = min(floor(paid × fee_bps / 10 000), max_fee, pool left)    once, at completion
```

Everything earners are not paid goes back to the owner: dust, skipped amounts, cap overflow,
unclaimed entries, the unused fee reserve, and the whole ADA deposit. The rules and the 19 math
vectors are shared byte for byte with Dyma's escrow on other chains, and the repository's CI keeps
the copies identical. The product side, with examples: [Distribution modes and the split](../projects/distribution).

## Roles

| Role | Holder | Can |
|---|---|---|
| Governance | multisig, 3-of-5 on mainnet | change the registry configuration, pause globally, rescue stray UTxOs |
| Guardian | multisig, 2-of-3 | reject or keep an allocation, cancel before finalize, pause and unpause |
| Operator | Dyma UTXO hot key | commit, reset and finalize allocations; checkpoint clocks |
| Pauser | Dyma UTXO hot key | rate-limited pauses, within a budget per campaign |
| Ticket signer | Dyma UTXO Ed25519 key | signs campaign tickets off chain; only its public key is in the registry |
| Treasury | Dyma UTXO address | receives the fee, frozen into each campaign at finalize |
| Owner | the funding wallet (a key or a script) | cancel before the start, dispute, transfer ownership; receives every refund |
| Earner | a key of the finalized allocation | claim its own entry |
| Reputation attester | Dyma UTXO Ed25519 key | signs badge attestations off chain; only its public key is in the badge configuration |

The registry refuses a configuration where the guardian is the operator or the pauser, or where the
operator receives the fee. Privileged keys can never be committed as recipients.

## Defenses

- **Exact values.** State and shard UTxOs must hold exactly the expected assets, and continuing
  datums are compared field by field.
- **No double satisfaction.** Every payment to an owner or to the treasury is an output tagged with
  the spent state's output reference and its role, so one output can never satisfy two campaigns.
- **Time.** A condition must hold over the whole validity range, and new deadlines are computed from
  its upper bound.
- **Single-use tickets.** Each ticket names an input that the funding transaction must spend.
- **Immutable scripts.** A fix is a new escrow version, which governance points the registry at for
  new campaigns.

## Execution budget

The largest transactions, as a share of the per-transaction limits (16.5 M memory units, 10 G CPU
steps):

| Transaction | Memory | CPU |
|---|---:|---:|
| Commit 100 entries | 37.7% | 23.8% |
| Reveal 100 entries into 5 claim shards | 38.3% | 28.1% |
| Close 5 claim shards | 34.1% | 18.0% |
| Claim from a 20-entry shard | 7.9% | 4.4% |
| Complete with a fee | 7.5% | 4.1% |

Dyma UTXO's API commits at most 100 entries and closes at most 5 shards per transaction.

## Build and reference documents

```bash
aiken check -D                        # the test suite: scenarios, ADA pools, registry, badges, math vectors, budgets
aiken build --trace-level silent      # rebuilds plutus.json exactly as deployed
```

CI runs both, and fails when the committed `plutus.json` (the CIP-57 blueprint: compiled scripts and
data schemas) differs from a fresh build. The repository carries the authoritative documents:

| Document | Contents |
|---|---|
| `docs/ESCROW_RULES.md` | the rules every Dyma escrow follows: roles, tickets, lifecycle, clock, math, limits, and where Cardano differs |
| `docs/SPEC.md` | how the scripts implement them: topology, data, values, time, every transition, budgets, badges |
| `docs/THREAT_MODEL.md` | trust assumptions, threats and mitigations |
| `docs/RUNBOOK.md` | keys, deployment cost and procedure, operations and incidents |
| `deployments/` | one deployment record per network ([Deployments](./deployments)) |
| `SECURITY.md` | how to report a vulnerability privately |
