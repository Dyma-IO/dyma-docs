---
sidebar_position: 5
---

# Deployments

:::info No deployment yet
The escrow contracts are **not deployed** on `safro-testnet-1` or `safrochain-1` yet. This page
will list the addresses, code ids and checksums once the deployment procedure (testnet first, then
a mainnet canary) has run. Until then, automatic distribution cannot be funded on these networks.
:::

| Network | Factory address | Escrow code id | Escrow checksum (sha256) | Factory code id | Escrow admin | Status |
|---|---|---|---|---|---|---|
| Safrochain mainnet `safrochain-1` | — | — | — | — | — | not deployed |
| Safrochain testnet `safro-testnet-1` | — | — | — | — | — | not deployed |

Each deployment is recorded in the contracts repository as `deployments/<chain-id>.json` (code ids,
checksums equal to the on-chain `data_hash`, factory address and configuration, roles, every
transaction) and registered in Dyma's admin console (**Escrow → Contracts**), which the API reads.

## How a deployment is verified

1. **Reproducible build** — `cosmwasm/optimizer:0.16.1` from a tagged commit; the published
   `checksums.txt` must match an independent rebuild.
2. **Upload** — `GET {rest}/cosmwasm/wasm/v1/code/<code id>` returns a `data_hash` equal to the
   published checksum.
3. **Instantiation locked** — the escrow code can be instantiated **only by the factory**
   (instantiate permission set to the factory address). Otherwise anyone could create a look-alike
   escrow that trusts a fake factory.
4. **Factory configuration** — `config {}` shows the expected roles (governance, operator, ticket
   signer, pauser, guardian, treasury), escrow code id and admin, `max_fee_bps` and limits.
5. **Instances** — each campaign escrow is in the factory's registry (`campaign {}` /
   `campaign_attempts {}`), was created by the factory, runs a known escrow code id and has the
   expected admin. Earners can run these checks themselves: see
   [Verify an escrow on the explorer](../earners/verify-an-escrow).

## Explorers

| Network | Transaction | Account / contract |
|---|---|---|
| `safrochain-1` | `https://explorer.safrochain.network/transactions/<hash>` | `https://explorer.safrochain.network/account/<address>` |
| `safro-testnet-1` | `https://explorer.testnet.safrochain.com/tx/<hash>` | `https://explorer.testnet.safrochain.com/contracts/<address>` (contracts), `/address/<address>` (accounts) |
