---
description: A Cardano wallet signs you in with its stake key and proves the payment address your rewards go to.
---

import {SiteCode} from '@site/src/components/Edition';

# Wallets and sign-in

A wallet does two separate jobs on Dyma UTXO: it **signs you in** (your stake key is your account),
and it **receives your token rewards** at a payment address it proved. Signing in and proving the
address are messages the wallet signs, never transactions, so neither costs a fee.

## Supported wallets

Dyma UTXO works with CIP-30 wallets, the standard way Cardano wallets connect to websites.

| Wallet | Notes |
|---|---|
| **Lace** | listed first |
| **Eternl** | also inside the Eternl app's browser on a phone |
| **VESPR** | also inside the VESPR app's browser on a phone |
| **Yoroi** | also inside the Yoroi app's browser on a phone |
| Typhon, GeroWallet, NuFi, Begin | listed next, with a link to install them when your browser does not have them |
| Any other CIP-30 wallet | offered after these when your browser has it, under the name and icon it reports |

Phone browsers cannot reach wallet extensions. On a phone, open the earner app inside your wallet
app's own browser: copy the page's link, open the wallet app's browser (often called DApps), paste
the link and sign in from there. The app shows these steps when it detects a phone.

## Signing in

1. Choose **Connect wallet** and pick your wallet.
2. Approve the connection. The wallet must be on the network shown: Cardano mainnet, unless the
   quest or campaign names a test network.
3. Sign the sign-in message with your **stake address** (`stake1…`). The wallet signs it with CIP-30
   `signData`, a CIP-8 message signature.
4. Sign a second message with your **payment address**, which proves where your rewards go (see
   [Your payout address](#your-payout-address)).

The sign-in message names the app asking, your stake address, the network and a one-time nonce
that expires after 5 minutes, so the signature cannot be replayed elsewhere:

<SiteCode>{`{app} wants you to sign in with your Cardano account:
stake1u…

Sign in to Dyma UTXO.

URI: https://{app}
Version: 1
Chain ID: cardano-mainnet
Nonce: dyma_nonce_…
Issued At: 2026-10-26T08:00:00Z
Expiration Time: 2026-10-26T08:05:00Z`}</SiteCode>

Dyma UTXO checks the signature itself: the signed address must be the one the message names, the
signed text must be the message it issued, and the key that signed must be that address's key.

### Your account is your stake key

- The **stake key** that signed is your account. Sign in again with the same wallet, whatever
  address it uses next, and you land on the same account.
- A wallet that has no stake address signs in with a payment address: its payment key is then the
  account.
- Only the key that signed counts. Dyma UTXO never takes the stake part of a payment address as
  proof: anyone can build an address that pairs their own payment key with someone else's stake
  key.
- Google, X, GitHub, Discord and e-mail sign-in work too. Link a Cardano wallet from your profile
  when a quest or a reward needs one.

### Linking more wallets

From your profile you can link more Cardano wallets (each link is signed the same way). On-chain
quests check the wallets you linked on the quest's network. A wallet can belong to one Dyma UTXO
account only: linking one already used by another account offers to merge the accounts instead. The
same goes for a payment address that two accounts proved.

## Your payout address

A stake address cannot hold funds, so Dyma UTXO never pays one. Right after the sign-in signature,
the app asks the wallet to sign a second message with its **payment address** (its change address).
The message says: "Pay Dyma UTXO rewards of account `dymauser_…` to this address."

That signature proves you hold the address's **payment key**. From then on:

- the address is your **payout address**: manual payouts are sent to it, and an escrow commits its
  payment key for your share;
- its payment key is the only key that can **sign your claims** in escrow campaigns
  ([Claim a token reward](./claim-a-reward));
- your [reputation badge](./reputation-badge) goes to an address whose payment key you proved.

A wallet that signed in with its payment address has proved it already. If you skip the second
signature you have no payout address and cannot be paid: prove one from your profile, where you can
also prove another address later. Dyma UTXO never derives a payout address from a stake address.

The campaign page and your Rewards page show which address will be used. When yours is missing, the
campaign page tells you which network to use and the deadline, and Dyma UTXO notifies you
**48 hours** and **6 hours** before payout addresses are fixed (the end of the campaign plus its
review grace).

**Escrow campaigns** go one step further: the campaign has a Wallet Connect quest on the escrow's
network, and only earners who completed it are committed. Keep access to your payout wallet until
you have claimed.

### Exclusions to know about

You are left out of a split (and told why on the campaign page) when:

| Reason | What it means |
|---|---|
| No payout wallet on this chain | you have not proved a payment address on the network the reward is paid on |
| Below the minimum payout | your share would be under the campaign's minimum (for example 0.01 ADA) |
| Payout wallet shared with another account | two accounts proved the same payment key: a split pays one earner per key |
| Wallet cannot receive escrow payouts | the payment key is one the escrow refuses: a key of the escrow's roles, of its treasury or of the campaign's owner |
| Wallet quest of the payout network not completed | escrow campaigns pay only earners who completed the campaign's Wallet Connect quest on that network |
| Project team member | members of the project do not take part in its pool |
| Account suspended | |

A campaign's own split rules can also leave you out: fewer points than its minimum, or not among its
top N earners. See [Distribution modes and the split](../projects/distribution#split-rules).

## Safety

- Dyma UTXO never asks for your recovery phrase, and signing in never moves funds.
- Claiming a share from an escrow is a transaction you sign, but Dyma UTXO pays its network fee:
  nothing leaves your wallet. Claiming a reputation badge is a transaction your wallet pays.
- Check the transaction in the wallet prompt before approving it.
