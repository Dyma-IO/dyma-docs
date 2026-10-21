---
sidebar_position: 5
---

# Deployments

:::info Live on Safrochain mainnet
The escrow contracts are **deployed on `safrochain-1`** (October 2026); automatic distribution can
be funded there today. They are not deployed on `safro-testnet-1`. Projects whose reward token
lives on another network can ask for the escrow there from Studio.
:::

| Network | Factory address | Escrow code id (new campaigns) | Escrow checksum (sha256) | Factory code id | Escrow admin | Status |
|---|---|---|---|---|---|---|
| Safrochain mainnet `safrochain-1` | `addr_safro1dn59s2wf5wz0cccaucfhj7zl0ug5y06ct0nurw528s5a23esm3asavxy4w` | **15** (escrow 0.2.0, claim-only) | `e58b9efa015d9f6eb1282b3a09ec1ec7cd0f7908411ded42d24394f09e8cfdb3` | 14 | `addr_safro1h2jz462m97xsxdar6wew85s48dkh6ljga8st0p` | live |
| Safrochain testnet `safro-testnet-1` | — | — | — | — | — | not deployed |

Escrow code **13** (0.1.0, push payouts) is the previous code: escrows created with it keep
running on it unless migrated. On 2026-10-21 the factory switched to code 15 (tx
[`1214C2BD…`](https://explorer.safrochain.network/transactions/1214C2BDAF94A70F85F7C57BAB2D8E7425E705438BE78C918AAA493272FE016B)), and
the live "show-up" escrow was migrated to code 15 in claim mode at the owner's request (tx
[`BE75527F…`](https://explorer.safrochain.network/transactions/BE75527F5FF88C3273E9E2447A2DEB9BBD11C0A126B9CDC4F3FD277DE46571A0); balance
and allocation unchanged). Instances are listed in the factory's registry.

| Network | Reputation contract | Code id | Checksum (sha256) | Status |
|---|---|---|---|---|
| Safrochain mainnet `safrochain-1` | [`addr_safro14224lpaf6t2q3vhp5yndvx5rx2fqfzkn36f6r0n8ymjahfvuu2fqcc9h4g`](https://explorer.safrochain.network/account/addr_safro14224lpaf6t2q3vhp5yndvx5rx2fqfzkn36f6r0n8ymjahfvuu2fqcc9h4g) | **16** | `2436c078ad940925329835a8a00193f5d442fe25d851cd1f7ec6ad61d44a6de6` | badge claims open once Dyma enables them |

Each deployment is recorded in the contracts repository as `deployments/<chain-id>.json` (code ids,
checksums equal to the on-chain `data_hash`, factory address and configuration, roles, every
transaction) and registered in Dyma's admin console (**Escrow → Contracts**), which the API reads.

## `safrochain-1` in detail

| Item | Value |
|---|---|
| Escrow code (new campaigns) | 0.2.0 (claim-only): id **15**, sha256 `e58b9efa015d9f6eb1282b3a09ec1ec7cd0f7908411ded42d24394f09e8cfdb3`, stored in tx [`D1DA7344…`](https://explorer.safrochain.network/transactions/D1DA73444E70C0470829A07285088E2960C96FD6DAF9BE171241488C80D08E45) |
| Previous escrow code | 0.1.0 (push): id **13**, sha256 `7a45091163ad4efbdc1dae8f4c87d7e99f83e3487c44282375f1918414537f45`, stored in tx [`2AB3BCDB…`](https://explorer.safrochain.network/transactions/2AB3BCDBF375184EF835F333CC0F59544FEF4BC87A66452F57FB467E43A11AA4) |
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
| Reputation contract | [`addr_safro14224lpaf6t2q3vhp5yndvx5rx2fqfzkn36f6r0n8ymjahfvuu2fqcc9h4g`](https://explorer.safrochain.network/account/addr_safro14224lpaf6t2q3vhp5yndvx5rx2fqfzkn36f6r0n8ymjahfvuu2fqcc9h4g), code id **16** (stored in tx [`D1F022A6…`](https://explorer.safrochain.network/transactions/D1F022A641747EEC3F5EE123C775886BEFEEEE9BD47DF625728DEB299A96BE15), instantiated in tx [`1A29C43B…`](https://explorer.safrochain.network/transactions/1A29C43B29BA27454C57DFC1ED7472688E5858550040CE64E1E9E236F4280508)), label `dyma-reputation-v1`, owner `addr_safro1h2jz462m97xsxdar6wew85s48dkh6ljga8st0p`, attester public key `AgpYjYdFFS+/OJHlhlF+RAD2ArKdzYHAm15jysUxkE0/`, tiers 1–7 (Explorer to Mythic) |

**Build provenance.** Codes 13 to 16 were built with the repository's `scripts/build-local.sh`
(rustc 1.93.0 and binaryen `wasm-opt` 130, MVP lowering for wasmvm 2.2), not with the
`cosmwasm/optimizer` image, so the optimizer's `checksums.txt` will not match them. The build is
reproducible: rebuilding the recorded commit with the same tools gives exactly the hashes above.
The command and commit are in the contracts repository (`deployments/README.md`). The escrow 0.2.0
and reputation 0.1.0 artifacts were built the same way; their checksums are listed above.

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
