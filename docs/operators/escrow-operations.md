---
sidebar_position: 3
---

# Escrow operations

How Dyma operates the escrow contracts: keys, registration, settings, monitoring and incidents. The
contracts repository's `docs/RUNBOOK.md` is the authoritative procedure (key ceremony, multisig
flow, deployment, playbooks); this page is the operator's summary.

## Keys

| Key | Type | Used for | Where it lives |
|---|---|---|---|
| Governance `dyma-gov` | 3-of-5 multisig (hardware wallets + an external co-signer) | factory owner: config, global pause, rescue | cold |
| Upgrade `dyma-upgrade` | 3-of-5 multisig | wasm admin of the factory and the instances | cold |
| Guardian `dyma-guardian` | 2-of-3 multisig | reject allocations, resolve disputes, cancel, pause/unpause | cold, signers **on call during every challenge window** |
| Operator | hot | commit, reset, finalize; the API's scheduled jobs | API signer (below), funded with SAF for gas |
| Ticket signer | hot | signs funding tickets (only its public key is on chain) | API signer |
| Pauser | hot | rate-limited pauses (auto-pause on anomalies) | API signer, funded with SAF |

Admin never signs multisig transactions: **Admin → Escrow → Distributions** exports the unsigned
guardian transaction JSON (reject, resolve, unpause, cancel) with CLI instructions for the signers.

## API signer: encrypted credential or KMS

The API needs the operator, ticket and pauser keys. Choose with `ESCROW_SIGNER`:

### `ESCROW_SIGNER=kms` (recommended for mainnet)

- Three AWS KMS keys of spec **`ECC_SECG_P256K1`**, usage *sign/verify*:
  `ESCROW_OPERATOR_KMS_KEY_ID`, `ESCROW_TICKET_KMS_KEY_ID`, `ESCROW_PAUSER_KMS_KEY_ID`, plus
  `ESCROW_KMS_REGION`.
- The API's IAM identity needs only `kms:Sign` and `kms:GetPublicKey` on those keys.
- The private keys never leave KMS. The API converts the DER public key to the 33-byte form,
  normalises signatures to low-S and verifies every signature before using it.

### `ESCROW_SIGNER=mnemonic` (default)

- Each key is a BIP-39 mnemonic stored as an **encrypted platform credential** —
  `escrow_operator`, `escrow_ticket`, `escrow_pauser` (values of the `CredentialProvider` enum) —
  with the single secret `{ "mnemonic": "<24 words>" }`, AES-256-GCM under `CREDENTIALS_MASTER_KEY`.
  The easiest way is **Admin → Settings → Credentials → Escrow hot keys**: *Set key* / *Rotate*
  takes the words in a masked field, sends them once, and the page then shows only what the key
  proves publicly — the derived address, the ticket signer's public key and the gas balance on the
  escrow chain (the newest active factory's chain, else Safrochain mainnet), from
  `GET /v1/admin/escrow/keys`. The same write works over the API:

  ```bash
  curl -X PUT https://api.dyma.io/v1/admin/credentials/escrow_operator \
    -H "Authorization: Bearer <super admin token>" -H 'Content-Type: application/json' \
    -d '{"label":"escrow operator","secrets":{"mnemonic":"<24 words>"}}'
  ```

  Only super admins can write them; the mnemonic is validated (BIP-39 word list and checksum),
  stored without metadata, audit-logged by key name only, and never returned by any route. In
  production these stored credentials are the only mnemonic source. A rotation takes effect on the
  next escrow transaction: the signer compares the credential's rotation time before reusing a
  cached key, no restart needed.
- Dev and testnet may instead use `ESCROW_OPERATOR_MNEMONIC` (and optionally
  `ESCROW_TICKET_MNEMONIC`, `ESCROW_PAUSER_MNEMONIC`; without them the operator mnemonic backs the
  ticket and pauser keys at HD indexes 1 and 2). **Env mnemonics are refused when
  `NODE_ENV=production`**: anything that can read the process environment could read them.

**Admin → Escrow → Operator** shows, per chain, whether each key is configured, its address, whether
it matches the factory configuration (operator, ticket signer public key, pauser) and the operator's
gas balance.

## Registering a deployment

1. Deploy following the runbook (store both codes, lock the escrow code's instantiation to the
   factory, instantiate the factory with the multisig roles and the ticket signer's public key).
2. **Admin → Escrow → Contracts → Add**: the factory address and the escrow code id. **Sync** reads
   the factory configuration, admin and code checksum from the chain and stores a mirror.
3. Set the chain's gas price in **Admin → Chains** (≥ `0.05usaf` on mainnet).
4. Fund the operator and pauser addresses with SAF.
5. `API_PUBLIC_URL` must be the public API origin (the on-chain `allocation_uri` is built from it).
6. `ESCROW_ENABLED=true`, deploy, check **Escrow → Overview** and **Operator**.

## Settings (Admin → Escrow → Settings)

| Setting | Default | Notes |
|---|---|---|
| Fee on new escrows | 0 bps | at most the factory's `max_fee_bps` (≤ 10%) |
| Review grace | 24 h | used when the project does not choose (1–72 h) |
| Challenge window | 24 h | used when the project does not choose (within the factory limits, ≤ 7 days) |
| Commit window | 14 days | clamped to the factory limits; always ≥ grace + 48 h |
| Claim window | 180 days | clamped to the factory limits (≤ 365 days) |
| Enabled chains | all with an active factory | |
| Trusted token admins | DYMA's treasury multisig | shown as "trusted admin" instead of a warning |
| Auto-pause | on, factory scope | pause when the indexer sees an operator transaction Dyma did not send |

Settings apply to escrows funded afterwards: a live escrow keeps the rules it was created with.

## What runs

| Job | Every | Does |
|---|---|---|
| Escrow scan | 60 s | detects funding, mirrors the on-chain phase, notifies missing payout addresses (T−48 h, T−6 h), snapshots at end + grace, commits in batches (resuming from the on-chain counters), finalizes, cranks `distribute` after the challenge window until completed, sends dispute/completion/expiry notices. Nothing is sent while an escrow is paused |
| Indexer | 30 s | reconciles payouts and failures from events; flags operator actions Dyma did not send |
| Health | 5 min | key presence and match with the factory, operator gas balance, stuck phases, a near commit deadline, unsettled broadcasts |

Every operator transaction is recorded before broadcast (simulation × 1.3 gas at the chain's gas
price, one retry on a sequence mismatch), so the indexer never mistakes Dyma's own transactions for
foreign ones. Alerts arrive in the admin inbox as `admin.escrow_alert`.

## Incident summary

| Situation | First response |
|---|---|
| Operator key compromised, or an unexpected commit/finalize | the auto-pause holds the affected escrows (the escrow clock stops); guardian rejects the allocation during the window; rotate the operator through governance |
| Wrong allocation (bug or bad data) | guardian `reject_allocations` (or the project disputes); fix, re-commit within the extended deadline |
| Stuck crank | anyone can call `distribute`; check gas, batch size (lower `limit` for heavy CW20 tokens), node availability |
| Failed payouts | they stay reserved; `retry_failed` (anyone) or the earner's `claim` before the claim deadline |
| Pauser budget running out during an investigation | the guardian takes the pause over (up to 90 days per escrow in total) |
| Security fix in the contracts | new code id for new campaigns (`update_config`); migrate live instances only for security fixes, through the upgrade multisig |

Never leave a challenge window unattended: once it is over on the escrow clock, a committed
allocation is final.
