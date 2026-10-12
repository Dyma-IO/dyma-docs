---
sidebar_position: 3
---

# Wallets and payout address

A wallet does two separate jobs on Dyma: it can **sign you in** (and prove you own an address for
on-chain quests), and it is where **token rewards are paid**. Signing in never costs a fee: you
sign a message, not a transaction.

## Supported wallets

| Wallet | Where | Notes |
|---|---|---|
| **Keplr** | browser extension, Keplr Mobile through WalletConnect | the default Cosmos wallet; if Leap is set as your default wallet it may answer in Keplr's place |
| **Leap** | browser extension, Leap Mobile through WalletConnect | |
| **Cosmostation** | browser extension, mobile through WalletConnect | |
| **EightSaf** | browser extension | Safrochain only |
| **WalletConnect** | any WalletConnect v2 Cosmos wallet on your phone | scan the QR code on desktop, or open the deep link on mobile; offered when the app has a WalletConnect project configured |

When a wallet does not know a chain yet, the app suggests it with the chain configuration served by
Dyma's API (endpoints, fee token, gas prices), so you only approve it once in the wallet.

### Signing in

1. Choose **Connect wallet** and pick your wallet.
2. Approve the connection for the chain shown (Safrochain by default).
3. Sign the sign-in message. It names Dyma's domain, your address, the chain and a one-time nonce
   that expires after 5 minutes, so the signature cannot be replayed elsewhere.

Wallet sign-in works on Safrochain and the other Cosmos chains in Dyma's sign-in list; wallets
using Ethereum-style keys (`inj1…`, `evmos1…`) are supported where the chain needs them.

### Linking more wallets

From your profile you can link wallets on other chains (each link is signed the same way). On-chain
quests check the wallet linked on the quest's chain, and a wallet can belong to one Dyma account
only — linking one already used by another account offers to merge the accounts instead.

## Your payout address

Token rewards are paid on the chain of the campaign's reward token (Safrochain for most
campaigns). Dyma picks your payout address on that chain like this:

1. A wallet you linked **on that chain** (your primary one first).
2. Otherwise, an address **derived** from a wallet you linked on another chain, when both chains
   use the same key type (coin type 118, standard secp256k1) — the same key controls both
   addresses, so Keplr, Leap and Cosmostation show it under that chain. Addresses from chains with
   a different key (for example Terra, Kava, Secret, or Ethereum-style chains) are never used to
   derive a payout address.
3. Otherwise you have **no payout address** and cannot be paid: link a wallet on the payout chain.

The campaign page and your Rewards page show which address will be used. When yours is missing, the
campaign page tells you which chain to link and the deadline, and Dyma notifies you **48 hours** and
**6 hours** before payout addresses are fixed (the end of the campaign plus its review grace).

### Exclusions to know about

You are left out of a split (and told why on the campaign page) when:

| Reason | What it means |
|---|---|
| No payout wallet on this chain | see above |
| Below the minimum payout | your share would be under the campaign's minimum (for example 0.01 USDC) |
| Payout wallet shared with another account | two accounts resolved to the same address |
| Wallet cannot receive escrow payouts | the address is one the escrow refuses (a contract or a role address of the escrow) |
| Project team member | members of the project do not take part in its pool |
| Account suspended | |

A campaign's own split rules can also leave you out: fewer points than its minimum, or not among its
top N earners. See [Token rewards](./token-rewards#the-campaigns-split-rules).

## Safety

- Dyma never asks for your seed phrase, and signing in never moves funds.
- Fees for token payouts in automatic mode are paid by Dyma's operator, not by you. Claiming your
  own payout yourself (optional, see [Token rewards](./token-rewards)) costs a normal transaction fee.
- Check the address in the wallet prompt before approving any transaction.
