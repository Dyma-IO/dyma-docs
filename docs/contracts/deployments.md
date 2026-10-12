---
sidebar_position: 5
---

# Deployments

:::info Live on Safrochain mainnet
The escrow contracts are **deployed on `safrochain-1`** (October 2026); automatic distribution can
be funded there today. They are not deployed on `safro-testnet-1`. Projects whose reward token
lives on another network can ask for the escrow there from Studio.
:::

| Network | Factory address | Escrow code id | Escrow checksum (sha256) | Factory code id | Escrow admin | Status |
|---|---|---|---|---|---|---|
| Safrochain mainnet `safrochain-1` | `addr_safro1dn59s2wf5wz0cccaucfhj7zl0ug5y06ct0nurw528s5a23esm3asavxy4w` | 13 | `7a45091163ad4efbdc1dae8f4c87d7e99f83e3487c44282375f1918414537f45` | 14 | `addr_safro1h2jz462m97xsxdar6wew85s48dkh6ljga8st0p` | live |
| Safrochain testnet `safro-testnet-1` | — | — | — | — | — | not deployed |

Each deployment is recorded in the contracts repository as `deployments/<chain-id>.json` (code ids,
checksums equal to the on-chain `data_hash`, factory address and configuration, roles, every
transaction) and registered in Dyma's admin console (**Escrow → Contracts**), which the API reads.

## `safrochain-1` in detail

| Item | Value |
|---|---|
| Escrow code | id **13**, sha256 `7a45091163ad4efbdc1dae8f4c87d7e99f83e3487c44282375f1918414537f45`, stored in tx [`2AB3BCDB…`](https://explorer.safrochain.network/transactions/2AB3BCDBF375184EF835F333CC0F59544FEF4BC87A66452F57FB467E43A11AA4) |
| Escrow instantiation | only the factory may create escrows (`AnyOfAddresses` = the factory) |
| Factory code | id **14**, sha256 `b130df7d100a3498ed0f8a35d3eb718166a8690c3aa6edb5129c8c371bd16fdb`, stored in tx [`EAAD2185…`](https://explorer.safrochain.network/transactions/EAAD218584A0D14FE824FEDE028599EE7C7F0D37F9133FED743CC57702F3BF68); nobody can instantiate it again |
| Factory | [`addr_safro1dn59s2wf5wz0cccaucfhj7zl0ug5y06ct0nurw528s5a23esm3asavxy4w`](https://explorer.safrochain.network/account/addr_safro1dn59s2wf5wz0cccaucfhj7zl0ug5y06ct0nurw528s5a23esm3asavxy4w), label `dyma-escrow-factory-v1`, created in tx [`47C3EF7B…`](https://explorer.safrochain.network/transactions/47C3EF7B97B307E19D3603A6FDCDDA3299E1D2B74D78F6DD9BED81143D4E27ED) |
| Governance and escrow admin | `addr_safro1h2jz462m97xsxdar6wew85s48dkh6ljga8st0p` |
| Operator | `addr_safro1nfuaw2mvrwhxlct5urql38k6msfl4wmfmqd96r` |
| Pauser | `addr_safro1aqegprjf3uvsc4lpy7zftyc2fqmg7tn5fem7pq` |
| Guardian | `addr_safro10959apymk7uxmtra84ee8usjdwc434u0z398yy` |
| Treasury (protocol fee) | `addr_safro1h0yrsrnml0hm340l6sfaf05s4du33yrsnh50tw` |
| Ticket signer (public key) | `Aw+X8S9Hyj1aKEXEUrfHtA2sCBhq8/hc9621LRbUkMk0` |
| Fee ceiling | `max_fee_bps` 1000 (10%); each campaign's fee is fixed when its escrow is created |

**Build provenance.** These two codes were built with the repository's `scripts/build-local.sh`
(rustc 1.93.0 and binaryen `wasm-opt` 130, MVP lowering for wasmvm 2.2), not with the
`cosmwasm/optimizer` image, so the optimizer's `checksums.txt` will not match them. The build is
reproducible: rebuilding the recorded commit with the same tools gives exactly the hashes above.
The command and commit are in the contracts repository (`deployments/README.md`).

## How a deployment is verified

1. **Reproducible build** — an independent rebuild of the recorded commit must give the on-chain
   hashes (for `safrochain-1`: `build-local.sh` with rustc 1.93.0 and `wasm-opt` 130, see above;
   future releases: `cosmwasm/optimizer:0.16.1` and its published `checksums.txt`).
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
