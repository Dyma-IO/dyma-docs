---
sidebar_position: 3
---

# Events

wasmd prefixes custom events with `wasm-`. Every event has an `action` and a `campaign_id` (empty
for factory-wide actions); escrow events also carry the allocation `version`. Times are Unix
**seconds** (deadlines are real times projected from the escrow clock when the event was emitted);
amounts are base units. Successful payouts are visible only as bank `transfer` (or CW20 `transfer`)
events.

## `wasm-dyma_escrow_factory`

| `action` | Attributes |
|---|---|
| `instantiate` | `owner`, `operator`, `pauser`, `guardian`, `treasury`, `escrow_code_id`, `max_fee_bps`, `at` |
| `create_campaign` | `funding_attempt`, `escrow`, `owner`, `asset_kind` (`native` / `cw20`), `asset`, `amount`, `starts_at`, `ends_at`, `fee_bps`, `ticket_sha256`, `code_id` |
| `update_config` | `by`, `changed` (comma-separated keys), `at` |
| `pause` / `unpause` | `until`, `kind` (`pauser` / `guardian`), `by` |
| `ownership_transfer` / `ownership_accepted` / `ownership_transfer_cancelled` | `by`, `pending_owner`, `expiry` / `owner`, `previous_owner` / `by` |
| `sync_campaign_owner` | `owner`, `previous_owner` |
| `rescue_funds` | `by`, `assets`, `to` |
| `migrate` | `from_version`, `to_version` |

## `wasm-dyma_escrow`

| `action` | Attributes |
|---|---|
| `instantiate` | `funding_attempt`, `owner`, `factory`, `asset_kind`, `asset`, `funded`, `starts_at`, `ends_at`, `commit_deadline` |
| `top_up` | `sender`, `amount`, `funded_total` |
| `cancel` | `by`, `refunded`, `to` |
| `commit` | `count`, `points`, `entry_count`, `total_points`, `first`, `last` |
| `reset` | `new_version` |
| `finalize` | `entry_count`, `total_points`, `gross`, `max_fee`, `distributable`, `cap`, `treasury`, `challenge_ends_at`, `claim_deadline`, `allocation_sha256`, `allocation_uri` |
| `dispute` | `by`, `reason`, `expires_at`, `claim_deadline` |
| `reject` | `by`, `reason`, `new_version`, `commit_deadline` (`version` = the rejected one) |
| `resolve` | `by`, `decision` (`keep_allocation` + `claim_deadline`; `reject_allocation` + `new_version`, `commit_deadline`) |
| `distribute` | `processed`, `attempted_count`, `attempted_amount`, `skipped`, `cursor` — attempts, computed before the payout replies of the same transaction (`payout_failed` events correct them) |
| `completed` | settled totals: `paid_count`, `paid_total`, `failed_count`, `failed_outstanding`, `skipped_count`, `skipped_total`, `fee_paid`, `treasury`, `leftover_refunded` |
| `claim` | `recipient`, `amount` (+ `previously_failed`) |
| `retry` | `recipient`, `result` (`submitted` + `amount`, or `not_failed`) |
| `payout_failed` / `fee_failed` / `refund_failed` | `recipient`, `amount`, `error` / `treasury`, `amount`, `error` / `amount`, `error` (`error` is redacted by wasmd to a code) |
| `reclaim_expired` / `sweep` | `amount`, `to`, `at` |
| `refund_stray` | `assets`, `to` |
| `pause` / `unpause` | `until`, `kind`, `by` |
| `ownership_*`, `migrate` | as for the factory |

## Indexing

```
GET {rest}/cosmos/tx/v1beta1/txs?query=execute._contract_address='<address>'&order_by=ORDER_BY_ASC
```

The contracts emit only custom `wasm-…` events, so there is no plain `wasm` event to filter on:
match on `execute._contract_address` (what Dyma's indexer does). Use small pages (≤ 5
transactions): a crank transaction carries one bank `transfer` / `coin_spent` / `coin_received`
triple per payout — about 170 KB of events for a 250-payout batch. Alternatively read
`block_results` filtered on `wasm-dyma_escrow`. Events are for indexing and audit; `status {}` and
`allocations {}` are the source of truth.
