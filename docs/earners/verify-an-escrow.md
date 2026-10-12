---
sidebar_position: 5
---

# Verify an escrow on the explorer

For a campaign in **automatic** distribution mode, the reward pool sits in its own CosmWasm
contract on Safrochain. You do not have to trust Dyma's pages: everything below can be checked
against the chain itself.

:::note Status
The escrow contracts are open source, have passed an internal pre-audit review and are **not yet
externally audited**. Until the contracts are deployed on mainnet, automatic campaigns exist only
on testnet. See [Deployments](../contracts/deployments).
:::

## 1. Find the escrow's details

On the campaign page, open the reward pool card. For automatic campaigns it lists:

- the **escrow contract address** and the **funding transaction**,
- the code id and contract version, and the upgrade admin (if any),
- the live balance, the phase, the deadlines (projected, a pause moves them),
- after finalize: the **allocation file** and its **SHA-256**.

The **Check now** button reads the contract balance and phase from a public node, in your browser,
without going through Dyma.

## 2. Open it in the explorer

| Network | Contract / account page | Transaction page |
|---|---|---|
| Mainnet `safrochain-1` | `https://explorer.safrochain.network/account/<address>` | `https://explorer.safrochain.network/transactions/<hash>` |
| Testnet `safro-testnet-1` | `https://explorer.testnet.safrochain.com/contracts/<address>` | `https://explorer.testnet.safrochain.com/tx/<hash>` |

The funding transaction shows the project's wallet sending the pool to the **factory** contract with
a `create_campaign` message; the factory creates the escrow and forwards the funds in the same
transaction.

## 3. Check it from a node

Any Safrochain REST endpoint works (mainnet `https://api.safrochain.network`, testnet
`https://rest.testnet.safrochain.com`). Smart queries are sent base64-encoded:

```bash
REST=https://api.safrochain.network
ESCROW=addr_safro1...          # the escrow contract
FACTORY=addr_safro1...         # Dyma's factory on this chain (see Deployments)
q() { printf '%s' "$1" | base64 | tr -d '\n'; }

# Who created it, with which code, under which admin
curl -s "$REST/cosmwasm/wasm/v1/contract/$ESCROW" | jq .contract_info
#  creator must be the factory; label "dyma-campaign-escrow <campaign id>:<funding attempt>"

# The code's checksum must equal the published escrow checksum
CODE_ID=$(curl -s "$REST/cosmwasm/wasm/v1/contract/$ESCROW" | jq -r .contract_info.code_id)
curl -s "$REST/cosmwasm/wasm/v1/code/$CODE_ID" | jq -r .code_info.data_hash

# The factory's registry points at this escrow for the campaign
curl -s "$REST/cosmwasm/wasm/v1/contract/$FACTORY/smart/$(q '{"campaign":{"campaign_id":"<campaign id>"}}')" | jq .data

# Phase, balance, totals, deadlines, pause state
curl -s "$REST/cosmwasm/wasm/v1/contract/$ESCROW/smart/$(q '{"status":{}}')" | jq .data

# Your own entry (after commit): weight, amount and status
curl -s "$REST/cosmwasm/wasm/v1/contract/$ESCROW/smart/$(q '{"allocation":{"address":"addr_safro1you..."}}')" | jq .data
```

What to look for:

| Check | Expected |
|---|---|
| `contract_info.creator` | the factory address |
| `code_info.data_hash` | the escrow checksum published for this chain |
| `contract_info.admin` | the published escrow admin (Dyma's upgrade multisig), or empty for immutable instances |
| factory `campaign` query | the same escrow address and funding attempt |
| `status.phase` | `upcoming`, `active`, `ended`, `committing`, `challenge`, `disputed`, `distributing`, `completed`, `cancelled` or `expired` |
| `status.balance` vs `funded_total` | the live balance; top-ups add to `funded_total` |
| `status.paused` | `true` while a pause holds it; deadlines then move by the paused time |

## 4. Check the allocation

After finalize, `status.finalized.allocation_sha256` is the SHA-256 of a plain text with one line
`<address>,<weight>` per committed entry, addresses in lowercase and sorted bytewise, each line
ending with a newline. The file is public:

```bash
curl -s https://api.dyma.io/v1/discover/campaigns/<campaign id>/allocation.json > allocation.json
jq -r '.entries[] | "\(.address),\(.weight)"' allocation.json | LC_ALL=C sort | sha256sum
jq -r .sha256 allocation.json
```

Both hashes must equal `allocation_sha256` from `status {}`. You can also rebuild the text from the
contract alone by paging `{"allocations":{"limit":100}}` (then `start_after` the last address).

Weights are Dyma's planned payouts (`weight_unit: "adjusted"`): with the planned pool the contract
pays each entry exactly its weight. Your raw campaign points are listed next to it as `dp`.

## 5. Follow the payouts

Once the challenge window is over, payouts appear as bank transfers from the escrow address in the
explorer (one per earner, in batches). Your own payout transaction is linked on your Rewards page.
If yours failed, it stays reserved: you can send a `claim` transaction from your wallet until the
claim deadline, or wait for Dyma to retry it.
