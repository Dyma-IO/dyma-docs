---
description: On-chain quests on Cardano (transfers, stake delegation, mints, scripts, holdings) and how Dyma UTXO checks them.
---

# Quests on Cardano

Most quests work the same way on every Dyma site: social checks, quizzes, visits, daily check-ins,
lucky draws, content reviewed by moderators, and checks made by a project's own server. On-chain
quests read Cardano itself. This page lists what Dyma UTXO checks on Cardano, and how.

## What Dyma UTXO reads

- **Your addresses.** An address counts as yours when its payment key is one you proved (your
  payout address, or a payment address you signed in with) or when its stake key is the one you
  sign in with. That is how Cardano wallets group addresses into one account. A transaction counts
  as *sent* by you only when one of its inputs is yours, since spending always takes the payment key.
- **The chain.** Dyma UTXO reads Cardano through Blockfrost, with Koios as the fallback, or the
  other way round when its operators prefer Koios. When the chain cannot be read, the check is
  retried a few minutes later; it is never counted as a failure.
- **The window.** The transaction must be made inside the quest's window: from the campaign's start
  (or the start date the quest sets) to its end.

## Proving a quest

A quest accepts one or both of these proofs:

| Proof | How |
|---|---|
| Transaction hash | paste the hash of the transaction (64 hexadecimal characters) |
| Wallet scan | choose verify: Dyma UTXO reads the latest transactions of your stake account and of your payout address (up to 72 hours back by default, within the window) and looks for one that matches |

- A hash that Cardano does not know yet is checked again about every 40 seconds, for 15 minutes
  after you submit it, before it is refused.
- A scan that finds nothing keeps looking every few minutes until the campaign ends.
- When the quest asks for confirmations, Dyma UTXO waits for them: a Cardano block comes about every
  20 seconds.
- Each part of a transaction proves one quest once: what it sends, what it mints, its use of a
  script, the script it stores, and each certificate. A transaction that pays and delegates can
  prove a transfer quest and a stake quest, never the same part twice and never for two earners.

## Quest types

| Quest | Passes when |
|---|---|
| Token Transfer (`chain_transfer`) | a valid transaction moves at least the minimum of ADA or of a native token: sent from your addresses to others (to the counterparty, when the quest names one), or received at your addresses (from the counterparty, when set) |
| Stake / Delegate (`chain_stake`) | a stake delegation certificate of your stake key to one of the listed pools (`pool1…`; any pool when none is listed), with at least the minimum ADA under your stake key when the quest is checked |
| NFT Mint (`chain_nft_mint`) | a valid transaction from your wallet mints at least the minimum number of tokens under the collection's policy id, delivered to your addresses |
| Contract Interaction (`chain_contract_interact`) | a valid transaction from your wallet spends from or pays into the script (named by its address or its script hash), sending it at least the minimum funds when set |
| Deploy Smart Contract (`dev_deploy_contract`) | a transaction from your wallet creates an output that carries a reference script (a script stored on chain) |
| Wallet Connect (`identity_wallet_link`) | a Cardano wallet is linked to your account by signature, on one of the quest's networks |
| Wallet Connect Proof (`chain_wallet_connect`) | a linked wallet holds at least the minimum balance under its stake key (ADA, or a native token across its addresses) and/or made a transaction within the look-back window |
| Signed Message (`attestation_sign`) | a linked Cardano wallet signs the quest's message plus a one-time nonce (CIP-8) |

Amounts are set in base units: lovelace for ADA (1 ADA = 1,000,000 lovelace). A native token is
named by its unit: its policy id (56 hexadecimal characters) followed by its asset name in
hexadecimal. A transaction that failed on chain (a script refused it) proves nothing.

### Staking

A stake quest is proven by the delegation certificate, so delegate (or re-delegate) during the
campaign. When the quest sets a minimum, the ADA under your stake key is read when the quest is
checked, not at the time of the transaction.

### Holding a token

Projects ask for holders with a Wallet Connect Proof quest: a minimum balance of ADA or of a native
token, optionally with a transaction in the last days. For a wallet you signed in with its stake
address, everything under that stake key counts; for one linked with a payment address, that
address's balance.

### Governance

Governance quests are not offered on Cardano. Votes on Cardano governance actions are cast by
delegated representatives (DReps), stake pools and the constitutional committee, with keys that an
earner account does not prove, and submitting a governance action needs a 100,000 ADA deposit. Ask
earners to delegate to a pool with a stake quest instead.

### Not available on Cardano

| Quest | Why |
|---|---|
| Unstake / Redelegate | Cardano has no unbonding: ADA stays in the wallet while it is staked. Use a stake quest |
| Governance Vote, Submit Proposal | see [Governance](#governance) |
| DEX Swap, Add Liquidity | Cardano DEXes settle swaps and deposits through batchers, in a later transaction. These quests will come per DEX |
| Hold LP Position | holding a liquidity position over a period is not verifiable yet |
| Cross-chain Bridge | bridge quests follow IBC transfers, which Cardano does not use |
| Data Availability Blob | blob quests are for Celestia |

## Quests that work the same everywhere

- [Daily, repeatable and lucky-draw quests](./recurring-quests).
- X, Discord, Telegram, YouTube and GitHub quests: [Integrations](../projects/integrations).
- Quests checked by a project's own server: [Project REST verification](../projects/rest-verification).
- Content, screenshots and open answers, reviewed by moderators or first by Dyma AI review:
  [Moderation and AI review](../projects/ai-review).
- When points are credited, and the retry rules: [How earning works](./how-it-works#points-are-credited-at-verification).
