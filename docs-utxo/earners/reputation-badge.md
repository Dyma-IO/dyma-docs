---
description: Your Dyma Reputation tier as a CIP-68 badge in your own Cardano wallet, soulbound by validity.
---

# Reputation badge (CIP-68)

Your Dyma Reputation tier ([Reputation and boosts](./reputation-and-boosts)) can be certified on
Cardano as a badge you hold in your own wallet. It follows CIP-68, Cardano's standard for tokens
that carry data on chain.

## What a badge is

A badge is a pair of tokens minted together under the badge policy:

| Token | Where it sits | What it holds |
|---|---|---|
| Reference token (CIP-67 label 100) | at the badge script's address | the badge's data: its name (collection and tier), image, tier, score, boost, an opaque account reference (not your Dyma UTXO id), the payment key of the wallet it belongs to, a nonce and the time it was issued |
| User token (CIP-67 label 222) | in your wallet | nothing: it shows the badge in your wallet and proves who holds it |

Both tokens share a name derived from a transaction input the claim spends, so every badge is
unique, and wallets or explorers that support CIP-68 can show its name and image.

## Claiming

1. Reach the **Explorer** tier (250 reputation by default): Newcomers have no badge.
2. On the Reputation page, choose **Claim badge** and connect a Cardano wallet linked to your
   account with a payment address you proved ([Wallets and sign-in](./wallets#your-payout-address)).
3. Dyma UTXO checks your tier against the badge configuration on chain, signs an attestation (your
   account reference, the payment key that will own the badge, your tier and score, a nonce, valid
   15 minutes) and prepares the transaction.
4. Approve it in your wallet. Your wallet pays the network fee and the ADA that the reference token
   keeps at the script (the amount is shown before you sign). It also needs an ADA-only UTxO of at
   least 5 ADA, which Cardano asks for as collateral whenever a script runs.

The badge's user token goes to an address of your wallet whose payment key you proved.

## Soulbound by validity

A Cardano token can always be sent, so the badge is soulbound by a rule rather than by a lock:

- An account's badge is its reference with the highest nonce.
- It counts only while its user token sits at an address whose payment key is the one the reference
  names.

Send the user token to another wallet and the badge stops counting; nobody else can make it count
for them.

## Upgrading

When you reach a higher tier, choose **Upgrade to** that tier. The same transaction mints the new
pair and retires your previous badge by burning its reference token; the ADA that reference held
comes back to your wallet. The old user token stays in your wallet without a reference: it no longer
counts, and you can burn it.

- One account, one badge: only the newest reference counts.
- The badge's governance (Dyma's keys) can retire a badge, for example after abuse. Attestations
  already issued for that account expire within 15 minutes.

## What a badge does not do

Nothing in the badge gives economic power. The boost a campaign applies comes from Dyma UTXO's own
records when the split is computed, not from who holds a badge: a badge cannot be bought or borrowed
to get a boost, and holding one gives no claim on any pool.

## On chain

The badge policy is the reputation validator of the Cardano contracts
([Smart contracts](../contracts/overview#reputation-badges)). It is deployed on preprod and not on
mainnet yet ([Deployments](../contracts/deployments)).
