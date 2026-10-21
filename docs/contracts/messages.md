---
sidebar_position: 2
---

# Messages and queries

JSON is snake_case. Timestamps are nanosecond strings (`Timestamp`), amounts are `Uint128`
strings, assets are `{"native":{"denom":"..."}}` or `{"cw20":{"address":"..."}}`. Unknown fields
are rejected. The authoritative interface is the committed JSON schema of each contract (factory
0.1.0, escrow 0.2.0, reputation 0.1.0).

## Campaign ticket

The API signs a `CampaignTicket` (ticket version `v` = 2); the owner submits it with the funds.

```json
{"v":2,"chain_id":"safrochain-1","factory":"addr_safro1…","campaign_id":"6f1c2a9e-…","funding_attempt":1,
 "owner":"addr_safro1…","asset":{"native":{"denom":"ibc/1E18…5C38"}},"min_funding":"1000000000",
 "starts_at":"1760000000000000000","ends_at":"1762000000000000000","fee_bps":0,"min_payout":"10000",
 "max_share_bps":10000,"challenge_secs":86400,"commit_window_secs":1209600,"claim_window_secs":15552000,
 "escrow_code_id":2,"escrow_admin":"addr_safro1…","expires_at":"1760003600000000000"}
```

- `ticket` is the base64 of those **exact bytes**; `signature` is the base64 of a 64-byte compact
  secp256k1 signature `r ‖ s` over `sha256(ticket bytes)`, **low-S only**.
- The factory checks, in order: no global pause → signature → JSON → `v == 2` → chain id → factory
  address → escrow code id and admin equal its configuration → `owner` is the funder → not expired →
  campaign id `[a-z0-9-]{1,64}` → attempt ≥ 1 → `starts_at < ends_at`, `ends_at` in the future, start
  at most 365 days away, duration at most 365 days → fee ≤ `max_fee_bps` → `max_share_bps` 1–10 000 →
  windows within the limits → funding ≥ `min_funding` in exactly the ticket's asset → funding-attempt
  rules (attempt `n + 1` only after attempt `n` was cancelled).

## Factory

### Instantiate

`owner`, `operator`, `ticket_signer` (base64 33-byte compressed public key), `pauser`, `guardian`,
`treasury`, `escrow_code_id`, `escrow_admin` (or `null` = immutable instances), `max_fee_bps`
(≤ 1 000), `limits`, `cw20_code_checksums` (≤ 20, empty = CW20 campaigns refused).

`limits`: `min_challenge_secs`/`max_challenge_secs` (≤ 7 d), `min_commit_window_secs`/
`max_commit_window_secs` (≤ 90 d), `min_recommit_secs` (≤ 14 d), `min_claim_window_secs`/
`max_claim_window_secs` (≤ 365 d), `dispute_timeout_secs` (≤ 14 d), `max_pause_secs` (≤ 7 d),
`max_commit_batch` (≤ 2 000), `max_distribute_batch` (≤ 1 000). Mainnet defaults: challenge 1 h–7 d,
commit window 5–90 d, re-commit ≥ 3 d, claim window 30–365 d, dispute timeout 3 d, max pause 1 d,
commit batch 1 000, distribute batch 250.

### Execute

| Message | Who | Effect |
|---|---|---|
| `create_campaign { ticket, signature }` + exactly one coin | the ticket's owner | verifies the ticket, records the registry entry, instantiates the escrow (instantiate2) with the funds |
| `receive(Cw20ReceiveMsg)` with `{"create_campaign":{"ticket","signature"}}` | an approved CW20 | same, CW20 pool (the CW20 sender must be the owner) |
| `update_config(ConfigUpdate)` | owner | rotate roles (immediate everywhere), change escrow code id or admin, max fee, limits, CW20 checksums (new campaigns only). Rotating the ticket signer, code id or admin invalidates unused tickets |
| `pause { until }` | pauser (rate-limited), guardian, owner | global pause, at most `max_pause_secs` from now, never shortens one |
| `unpause {}` | guardian or owner; anyone once expired (no-op) | |
| `rescue_funds { assets, recipient }` | owner | returns coins or tokens sent to the factory by mistake (1–10 assets) |
| `transfer_ownership { new_owner, expiry? }`, `accept_ownership {}`, `cancel_ownership_transfer {}` | owner / pending owner | two-step ownership, no renounce |
| `sync_campaign_owner { campaign_id }` | anyone | re-reads an escrow's owner (escrows call it after an ownership transfer) |

### Queries

| Query | Response |
|---|---|
| `config {}` | configuration, `paused_until`, `global_pause { start, until, kind, totals_before }` |
| `pause_state {}` | `{ paused, paused_until, kind }` |
| `pause_totals { at }` | global paused nanoseconds by kind accumulated by `at` |
| `campaign { campaign_id }` | latest attempt: `{ campaign_id, funding_attempt, escrow, owner, asset, created_at, code_id }` |
| `campaign_attempts { campaign_id, start_after?, limit? }` | every attempt of a campaign |
| `campaigns { start_after?, limit? }`, `campaigns_by_owner { owner, … }` | latest attempts, paged (30, max 100) |
| `ownership {}` | `{ owner, pending_owner, pending_expiry }` |

## Campaign escrow

Instantiated by the factory only, with the ticket's parameters, the `funding_attempt`, a copy of the
factory `limits` and, for CW20, `cw20_funding`.

### Execute

| Message | Who | Phase | Paused? | Effect |
|---|---|---|---|---|
| `top_up {}` + one coin / CW20 `receive` `{"top_up":{}}` | anyone | upcoming, active | blocks | adds to `funded_total` |
| `cancel {}` | owner before `starts_at`; guardian before finalize | not finalized | no | whole balance to the owner, no fee |
| `commit_allocations { version, entries }` | operator | ended, committing | blocks | 1–`max_commit_batch` entries `{ address, points }`, addresses strictly increasing bytewise (also across batches), not privileged, points > 0 |
| `reset_allocations { version }` | operator | ended, committing | blocks | discards the commitments, `version + 1` |
| `finalize_allocations { version, expected_count, expected_total_points, allocation_sha256, allocation_uri }` | operator | ended, committing | blocks | snapshot (balance, fee reserve, distributable, cap, treasury), opens the challenge window |
| `dispute { reason }` | owner | challenge | no | once per version, 1–280 characters, never refunds |
| `reject_allocations { reason }` | guardian | challenge, disputed (never after a payout) | no | discards the allocation, `version + 1`, back to ended, re-commit time granted (at most 2 extensions) |
| `resolve_dispute { decision }` | guardian | disputed | no | `"keep_allocation"` (payouts start) or `"reject_allocation"` (as reject) |
| `distribute { limit? }` | anyone | distributing | blocks | **push escrows only** (`ClaimOnly` on claim escrows): pays the next entries (≤ `max_distribute_batch`); the call that finds nothing left **completes**: fee, then leftover refund |
| `claim {}` | a recipient | claim escrows: distributing, before the claim deadline (`ClaimWindowClosed` after). Push escrows: distributing (pending entry); distributing or completed before the claim deadline (failed entry) | blocks | pays the sender's own entry (a plain transfer: a failing transfer reverts the claim) |
| `close {}` | anyone | distributing, **claim escrows only** (`NotClaimMode` otherwise), once the claim deadline is reached or `paid_count ≥ entry_count` (an empty allocation included; `ClaimWindowOpen` before) | blocks | **completes**: the fee on what was claimed to the treasury, everything else to the owner; pending entries become `unclaimed` |
| `retry_failed { addresses }` | anyone | distributing, completed, before the claim deadline | blocks | re-sends failed payouts (1–100) |
| `reclaim_expired {}` | anyone | expired | no | whole balance to the owner |
| `sweep_leftover {}` | anyone | cancelled, or completed after the claim deadline | no | remaining balance to the owner |
| `refund_stray_assets { assets }` | anyone | any | no | assets other than the pool asset to the owner (1–10) |
| `pause { until }` / `unpause {}` | pauser (rate-limited, budget) or guardian | any | — | instance pause; stops the escrow clock |
| `transfer_ownership`, `accept_ownership`, `cancel_ownership_transfer` | owner / pending owner | before `starts_at` (cancel: any) | no | two-step; accept also syncs the factory registry |

Every message except `top_up` (and `create_campaign` on the factory) is non-payable.

### Queries

| Query | Response |
|---|---|
| `config {}` | parameters, `funding_attempt`, owner, factory, asset, `created_at`, `limits` (creation-time copy), `roles { operator, pauser, guardian, treasury }` (null if the factory cannot be read), `payout_mode` (0.2.0) |
| `status {}` | `campaign_id`, `funding_attempt`, `phase`, `funded_total`, `balance`, `version`, `entry_count`, `total_points`, `last_committed`, `finalized { at, challenge_ends_at, claim_deadline, gross_balance, max_fee, distributable, cap, treasury, allocation_sha256, allocation_uri }`, `dispute { raised_at, reason, expires_at, resolved_at }`, `paid_count`, `paid_total`, `failed_count`, `failed_outstanding`, `skipped_count`, `skipped_total`, `fee_paid`, `refunded_total`, `cursor`, `deadlines { starts_at, ends_at, commit_deadline, claim_deadline }`, `paused`, `paused_until`, `frozen_secs`, `pauser_pause_left_secs`, `completed_at`, `cancelled_at`, `payout_mode` (0.2.0) |
| `allocation { address, version? }` | `{ address, version, points, amount, status }` — `amount` is null before finalize, projected while pending; `status` is `pending`, `paid`, `failed`, `skipped` or `unclaimed` (a claim escrow closed before the entry was claimed: `amount` went back to the owner) |
| `allocations { start_after?, limit?, version? }` | `{ version, allocations }`, ascending by address (30, max 100); rejected versions stay readable |
| `ownership {}` | `{ owner, pending_owner, pending_expiry }` |

`phase` is one of `upcoming`, `active`, `ended`, `committing`, `challenge`, `disputed`,
`distributing`, `completed`, `cancelled`, `expired`. Deadlines are real times **projected** from the
escrow clock; re-read `status {}` for countdowns, since a pause moves them.

### Payout modes

`payout_mode` is `"claim"` for instances created by escrow 0.2.0 and `"push"` for 0.1.x
instances. A 0.1.x instance (code 13 on `safrochain-1`) does not return the field: read a missing
`payout_mode` as `push`. The factory picks the mode only through its `escrow_code_id` (which
funding tickets bind); its instantiate message is unchanged.

### Migration

`migrate` (the instance's wasm admin only) requires the same contract name and a strictly greater
version. The 0.1.x → 0.2.0 message is `{ "payout_mode"?: "push" | "claim" }` (`{}` stays valid and
keeps the current mode, so a 0.1.x instance stays `push`). Changing the mode is accepted only before
finalize (`PayoutModeLocked` afterwards). Balances, allocations and deadlines are never touched.

## Allocation file

`allocation_sha256` is the SHA-256 (hex) of the canonical text: one `<address>,<weight>` line per
committed entry, addresses lowercase and sorted bytewise, each line ending with `\n`. The contract
records it but cannot check it; anyone can, by paging `allocations {}`. Dyma serves the file at
`GET /v1/discover/campaigns/:campaignId/allocation.json` (schema `dyma.escrow.allocation/v1`; Dyma
commits planned payouts as weights, `weight_unit: "adjusted"`).

## Reputation contract

`dyma-reputation` 0.1.0: soulbound, CW721-compatible badges for Dyma Reputation tiers. Dyma computes
scores off chain and signs attestations; the contract checks them and keeps one badge per account
and per wallet.

### Instantiate

`{ name, symbol, admin, attester, tiers, base_uri? }`: `admin` is the contract owner (two-step
ownership), `attester` the base64 33-byte compressed secp256k1 public key of Dyma's attestation key,
`tiers` 1–32 entries `{ tier, name, min_score, boost_bps, image_uri }` strictly ascending by `tier`
and `min_score`, `boost_bps` 10,000–50,000 and never decreasing. A badge's `token_uri` is
`base_uri` + token id. On `safrochain-1` the tiers are Dyma's tiers 1–7 (Explorer to Mythic);
Newcomer (tier 0) has no badge.

### Attestation

The raw JSON bytes Dyma signs (unknown fields rejected), submitted base64-encoded with a 64-byte
compact low-S secp256k1 signature over `sha256(bytes)`:

```json
{"v":1,"chain_id":"safrochain-1","contract":"addr_safro1…","account":"<64 lowercase hex>",
 "owner":"addr_safro1…","tier":3,"score":"3100","nonce":7,
 "issued_at":"1792605600000000000","expires_at":"1792609200000000000"}
```

`account` is an opaque Dyma account reference; `nonce` strictly increases per account. Dyma's
attestations are valid for 15 minutes.

### Execute

| Message | Who | Effect |
|---|---|---|
| `claim_badge { attestation, signature }` | the attested `owner` | checks the signature, `v`, chain, contract, `owner == sender`, expiry, tier and `score ≥ min_score`, `nonce > last_nonce`, revocation, and that the sender holds no badge of another account; burns the account's current badge and mints `dr-<serial>` to the sender. Refused while paused |
| `burn { token_id }` | the holder | removes the badge |
| `revoke_badge { account, reason }` | owner | burns the account's badge; attestations issued until then are refused |
| `update_config { attester?, tiers?, base_uri?, paused? }` | owner | a new attester voids unused attestations; new tiers apply to new badges |
| `set_ibc_bridge { bridge? }` | owner | the ICS-721 contract badges may leave through (none by default) |
| `send_nft { contract, token_id, msg }` | the holder | only to the IBC bridge |
| `transfer_nft { recipient, token_id }` | the IBC bridge only | returns a bridged badge to a wallet without a badge |
| `approve`, `revoke`, `approve_all`, `revoke_all` | — | always `Soulbound` |
| `transfer_ownership`, `accept_ownership`, `cancel_ownership_transfer` | owner / pending owner | two-step ownership |

### Queries

| Query | Response |
|---|---|
| CW721 `contract_info`, `num_tokens`, `owner_of`, `nft_info`, `all_nft_info`, `tokens { owner }`, `all_tokens`, `minter`, `approvals`, `all_operators` | standard shapes; `nft_info.extension` carries name, image, description and the attributes `tier`, `tier_name`, `score`, `boost_bps`, `account`, `issued_at`; approvals are always empty |
| `config {}` | `owner`, `attester`, `base_uri`, `paused`, `ibc_bridge`, `token_count`, `minted` |
| `badge { owner }` | the badge a wallet holds, or `null` |
| `account { account }` | `{ last_nonce, revoked_at, badge }` |
| `tiers {}` | the tier list |
| `ownership {}` | `{ owner, pending_owner, pending_expiry }` |

Dyma serves each badge's metadata JSON (name, image, attributes) at
`GET /v1/discover/reputation/badges/:tokenId` and the tier images at
`GET /v1/reputation/badges/<tier key>.svg`.
