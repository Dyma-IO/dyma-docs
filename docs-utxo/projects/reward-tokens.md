---
description: The tokens a Dyma UTXO campaign or job pays in, ADA and Cardano's stablecoins verified by Dyma, and any other token from the Cardano Token Registry.
---

# Reward tokens

A campaign pays its pool in one token, and a job pays its reward in one token. On Dyma UTXO that
token is **ADA** or a **Cardano native token**. Studio lists the tokens your project can use under
**Rewards → Reward tokens**.

## Tokens verified by Dyma

These tokens are in every project's list from the start, already verified. Dyma matches each by its
exact unit (policy id and asset name), so a copy with the same name or ticker is never mistaken for
it.

| Token | Issuer | Unit (policy id + asset name) | Decimals |
|---|---|---|---|
| **ADA** | Cardano | `lovelace` | 6 |
| **USDCx** | Circle | `1f3aec8bfe7ea4fe14c5f121e2a92e301afe414147860d557cac7e34` `5553444378` | 6 |
| **USDM** | Moneta | `c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad` `0014df105553444d` | 6 |
| **USDA** | Anzens | `fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456` `55534441` | 6 |
| **DJED** | Djed | `8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61` `446a65644d6963726f555344` | 6 |
| **iUSD** | Indigo | `f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880` `69555344` | 6 |

The stablecoins exist on Cardano mainnet only. On a test network the list holds test ADA (tADA).

## Any other token: the Cardano Token Registry

Any other native token must be listed in the
[Cardano Token Registry](https://github.com/cardano-foundation/cardano-token-registry), the Cardano
Foundation's registry of token metadata (CIP-26). The registry is where Dyma UTXO takes the token's
**name, ticker, decimals and logo** from, whatever is typed elsewhere. Being registered does not make
a token verified: anyone can register a token, so Dyma still reviews it.

To add one:

1. In **Rewards → Reward tokens**, choose **Add token**.
2. Search by ticker, name, fingerprint (`asset1…`) or unit. Dyma's verified tokens come first and
   read **In your list**; registered tokens read **Registered**.
3. Choose **Add** next to the token. It joins your list as **Not verified**, with the registry's
   name, ticker, decimals and logo.
4. Choose **Request review**. Dyma checks on chain that the token exists and that the registry lists
   it, then verifies or declines it. Project admins get an email with the outcome.

A token the registry does not list cannot be added. Register it there first: the registry reviews
new entries before it lists them.

A native token cannot be frozen or clawed back by its issuer, although its minting policy may still
mint more. Registry tokens cannot be edited in Studio: their details follow the registry.

## Where tokens are used

- **Campaigns**: the reward step offers the tokens of your list; a campaign can only go live with a
  verified token. See [Distribution modes and the split](./distribution).
- **Jobs**: a job pays only in ADA, USDM or USDCx.
