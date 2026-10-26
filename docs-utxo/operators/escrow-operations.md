---
description: How Dyma UTXO operates the Cardano escrow and badges, its keys, registrations, sponsored claims, jobs and alerts.
---

# Escrow operations

How Dyma UTXO operates its Cardano contracts: keys, registration in Admin, sponsored claims, what
runs, alerts and incidents. The contracts repository's
[`docs/RUNBOOK.md`](https://github.com/Dyma-IO/dyma-contracts-cardano/blob/main/docs/RUNBOOK.md) is
the authoritative procedure for the keys, the deployment and the incident playbooks; this page is the
operator's summary.

## Keys

| Key | Kind | Used for | Where it lives |
|---|---|---|---|
| Governance | multisig, 3-of-5 on mainnet | the registry's configuration, global pauses, rescues; the badge configuration | hardware wallets on mainnet |
| Guardian | multisig, 2-of-3, distinct from governance | reject allocations, resolve disputes, cancel before finalize, pause and unpause | hardware wallets on mainnet, signers **on call during every challenge window** |
| Operator | 24-word CIP-1852 wallet | commits, finalize, reveals, shard closes, completion, clock checkpoints; it pays these transactions and every sponsored claim | API, encrypted credential `escrow_operator` |
| Pauser | 24-word CIP-1852 wallet | rate-limited pauses | API, encrypted credential `escrow_pauser` |
| Ticket signer | Ed25519 key (a 32-byte seed) | signs funding tickets; its public key is the registry's ticket key | API, encrypted credential `escrow_ticket` |
| Badge attester | Ed25519 key (a 32-byte seed) | signs badge attestations; its public key is the badge configuration's attester | API, encrypted credential `reputation_attester` |
| Treasury | an address | receives the escrow fee (plan payments go to a separate treasury account) | a hardware wallet on mainnet |

The registry refuses a guardian that is the operator or the pauser, and an operator that receives
the fee. The governance and guardian keys enter the registry as payment key hashes; the operator's
and pauser's as the hashes of their payment keys (`m/1852'/1815'/0'/0/0`).

## Hot keys

The API holds the four hot keys as encrypted platform credentials (AES-256-GCM under
`CREDENTIALS_MASTER_KEY`), written by super admins only and never returned by any route:

| Credential | Secret |
|---|---|
| `escrow_operator`, `escrow_pauser` | `{ "mnemonic": "<24 words>" }` |
| `escrow_ticket`, `reputation_attester` | `{ "ed25519Seed": "<32 bytes in hex>" }` |

- **Admin → Escrow → Hot keys** sets or rotates the operator, ticket and pauser keys in a masked field,
  and then shows only what each key proves publicly: the address and key hash, the ticket key's
  public key, the ADA balance, and whether the key matches the active registry of each network.
- **Admin → Settings → Reputation** stores the badge attester. Its public key must be the attester of
  the badge configuration on chain; after a rotation, badge claims are refused until governance
  updates the configuration.
- A key rotation needs both sides: the new credential in Admin, and a governance `UpdateConfig` that
  names the new key in the registry (or in the badge configuration). Until both agree, the key shows
  as not matching and its transactions are refused.
- Fund the **operator** with ADA, including an ADA-only UTxO of at least 5 ADA that its transactions
  use as collateral. Keep some ADA on the **pauser** for the day a pause is needed.

Outside production only, `ESCROW_OPERATOR_MNEMONIC`, `ESCROW_PAUSER_MNEMONIC`,
`ESCROW_TICKET_ED25519_SEED` and `REPUTATION_ATTESTER_ED25519_SEED` can stand in for the credentials.

## Registering the escrow

1. Deploy following the runbook: the configuration (role key hashes, the ticket public key, the
   treasury, the fee cap and the limits), `deploy.mjs`, then `verify.mjs`. The record
   `deployments/<network>.json` is committed to the contracts repository.
2. **Admin → Escrow → Cardano → Register deployment**: pick the network and paste or upload the
   record. The API refuses a record for another network, reads the registry NFT at the registry
   address and every reference script from the chain, and makes it the network's **active
   registry**. The previous one stays listed as inactive: no new escrow uses it.
3. Store the hot keys and check, on the registry's card, that the operator, ticket and pauser keys
   all **match**, and that the operator holds enough ADA.
4. Set `ESCROW_ENABLED=true` and deploy the API.
5. **Admin → Escrow → Settings**: the defaults for new escrows (fee 0, review grace 24 hours,
   challenge window 24 hours, commit window 14 days, claim window 30 days), kept within the
   registry's limits. A live escrow keeps the rules it was created with.

Projects cannot fund an escrow on a network that has no registry; Studio shows the funding as not
available there.

## Registering the badges

1. Deploy with `deploy-reputation.mjs` from `deployments/<network>.reputation.config.json`
   (governance, the attester's public key, the collection, the tiers).
2. **Admin → Settings → Reputation**: register the badge deployment
   (`deployments/<network>.reputation.json`). The API checks the configuration NFT and the reference
   script on chain. **Use for badges** fills the badge's network and policy id.
3. Store the badge attester (above).
4. Keep the tiers aligned: the configuration on chain has its own tier table, changed by the badge
   governance. A tier missing on chain cannot be claimed, and a score below a tier's minimum is
   refused.
5. Turn badge claims on.

## Sponsored claims

**Admin → Escrow → Cardano → Sponsored claims**: Dyma UTXO pays the network fee of every claim, its
collateral, and the ADA a native-token output must carry, within a budget per UTC day, all campaigns
and networks together.

| Setting | Default |
|---|---|
| Pay for claims | on |
| Claims per day | 500 |
| ADA per day | 1,000 |

Each claim counts its fee plus the extra ADA its output needed. Past either limit, earners are asked
to come back the next UTC day; with sponsoring off, claims wait until it is on again. Changes apply to
every claim prepared afterwards. The operator's wallet pays: keep it funded above the day's budget.

## What runs

| Job | Every | Does |
|---|---|---|
| Escrow scan | 60 s | detects a funding the owner did not confirm, mirrors each escrow (state UTxO, phase, shards, pauses), notifies earners without a payout address (48 h and 6 h before addresses are fixed), takes the snapshot at the end of the review grace, commits the allocation in batches (resuming from what the chain holds), finalizes; after the challenge window, reveals the next batch into claim shards, tells earners claims are open and reminds them a week and a day before the deadline; closes shards (empty ones at once, the others at the deadline, five per transaction) and completes; checkpoints a campaign's clock after many global pauses |
| Health | 5 min | the hot keys (present, matching the registry), the operator's balance, stuck distributions, a commit deadline drawing near, transactions that never settled |

An escrow moves one state transition per tick: each transaction spends the state UTxO the previous
one created, so the next waits until it is on chain. Every operator transaction is recorded with its
hash.

### Alerts

Alerts arrive in the admin inbox, at most once a day per key and once an hour per failing escrow.

| Alert | Severity | First response |
|---|---|---|
| Escrow operator key unavailable | critical | store the `escrow_operator` credential |
| Escrow ticket or pauser key unavailable | warning | store the credential |
| Escrow key does not match the registry | critical | store the key the registry names, or have governance update the registry |
| Escrow operator balance low (under 50 ADA by default) | warning | send ADA to the operator: commits, closes and sponsored claims stop when it runs out |
| Cardano escrow step failed | warning | read the error on the distribution's page in Admin |
| Commit deadline near, distribution stuck | critical, warning | check the operator, its balance and the data provider before the deadline |

## Multisig transactions

Dyma UTXO's API never signs for governance or the guardian. Their transactions (registry updates,
global pauses, rescues, rejections, dispute decisions, cancellations) are signed by each signer with
their own wallet, for example with Eternl's multisig flow or `cardano-cli transaction witness`, and
anyone can submit the assembled transaction. The runbook describes the flow.

## Incidents

| Situation | First response |
|---|---|
| Operator key suspected | the pauser or the guardian pauses the affected campaigns (or a global pause); governance rotates the operator; the guardian rejects any hostile allocation still in its challenge window |
| Pauser key suspected | governance rotates it; its pauses are bounded by the cooldown and each campaign's budget, and the guardian can lift them |
| Ticket key suspected | governance rotates it; tickets issued with the old key stop working |
| Flaw in an escrow script | governance points the registry at a fixed version for new campaigns; the guardian cancels the affected campaigns that are not finalized yet, which refunds their owners |
| Wrong allocation (bug or bad data) | the guardian rejects it (or the project disputes it); fix, then commit again before the extended deadline |

Never leave a challenge window unattended: once it is over on the escrow clock, a committed
allocation is final.
