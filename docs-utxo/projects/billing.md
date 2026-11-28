---
description: Plans are priced in US dollars and paid in ADA, at a locked market price, or in USDM, one to one.
---

import PlanChanges from '@site/docs-shared/projects/_plan-changes.mdx';

# Billing: plans paid in ADA or USDM

Plans are priced in US dollars and paid on Cardano, in **ADA** or in **USDM**. There is no card
payment and no automatic debit: you send a transfer, Dyma UTXO sees it arrive on chain, and your
plan is extended once it is confirmed.

| Asset | Counted as | Unit |
|---|---|---|
| ADA | the median ADA/USD market price, locked on your payment request for 20 minutes | `lovelace` (6 decimals) |
| USDM | 1 USDM = 1 USD | `c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d` (6 decimals) |

USDM is matched by its exact unit (policy id and asset name): a token merely *called* USDM does not
count. On the preprod test network, plans are paid in test ADA only.

## The ADA price

- Dyma UTXO reads the ADA/USD price from CoinGecko, Kraken and Coinbase and takes the **median**. A
  price needs at least two fresh answers (two minutes old at most) within 3% of the median; these
  are the defaults Dyma UTXO can change.
- The ADA amount of a payment request is computed at that price, rounded up to the lovelace, and
  **locked for 20 minutes**: the request expires with the lock.
- When the sources do not answer or do not agree, Studio says the ADA price is unavailable: pay in
  USDM, or try again a minute later.

## Buying or renewing a plan

1. **Project → Billing → Plans.** Pick a plan and a duration: 1, 3, 6 or 12 months. Twelve months
   cost the yearly price (two months free on the default plans).
2. Pick the asset (ADA or USDM). Studio shows the **quote** (the price, and for upgrades the credit
   for the days left) and opens a **payment request** with:

   | Field | Example |
   |---|---|
   | Amount | `247.500000 ADA` (99 USD at 0.40 USD per ADA), or `99.000000 USDM` |
   | Send to | an address of Dyma UTXO's treasury (`addr1…`) that belongs to this request only |
   | Reference | `DYMA-7K2M9QXA`: shown for your records; no memo is needed |

3. Pay it, either way:
   - **Pay from my wallet** (Lace, Eternl, VESPR, Yoroi or another CIP-30 wallet): Studio prepares
     the transfer of what is left to pay to the request's address (for USDM, with the ADA its output
     must carry), your wallet signs it, and Dyma UTXO submits it. A prepared payment is valid 10
     minutes at most, never past the price lock.
   - **Manual transfer**, from any Cardano wallet or exchange: send exactly the amount, or more, to
     the request's address. Copy the address and the amount, or scan the **QR code**, a Cardano
     payment link that fills both in a wallet that supports it (**Open in a wallet app** does the
     same on a phone). For USDM, pick the token and enter the amount yourself if the wallet does
     not; the wallet adds the ADA a token output needs (about 1.2 ADA), which stays with the
     payment. Pasting the transaction hash is optional: the page follows the address itself.
4. The page follows the request live, and the plan is extended at the last confirmation. Dyma UTXO
   issues an invoice with the transaction hash and an explorer link.

Because every request has its own address, a payment is recognised by where it lands. The network
fee comes on top of the amount.

### Live statuses

| Status | Meaning |
|---|---|
| Pending | waiting for your payment |
| Submitted | your transaction reached the network and waits for a block (usually within a minute) |
| Confirming | in a block; the confirmations count up (a Cardano block comes about every 20 seconds) |
| Paid | confirmed: the plan is extended and the invoice issued |
| Underpaid | a transfer arrived but the amount is short: send what is left to the same address, the transfers add up |
| Expired | the request's time ran out before a payment arrived (for ADA, its 20-minute price lock) |

- **Late payments**: a transfer that arrives within 3 days after the request expired still settles
  it. An ADA payment made after the price lock is valued at the price of that moment: the amount due
  goes up if ADA fell, never down.
- Only **one payment can be in flight per project** at a time. Starting a new request replaces one
  that is still waiting for a payment: never pay both.
- The minimum charge is 1 USD.

### What the verification checks

| Check | Refused with |
|---|---|
| The transaction exists and succeeded on Cardano | `TX_NOT_FOUND` (checked again automatically), `TX_FAILED` |
| It pays the request's own address, in the request's asset | `WRONG_RECIPIENT` |
| It was made after the request was created, and before its late window closed | `PREDATES_INVOICE`, `TOO_LATE` |
| It has the confirmations Dyma UTXO requires | `NOT_CONFIRMED` (checked again automatically) |

When Dyma UTXO has not set up its Cardano treasury yet, Studio says plans cannot be paid from Studio
and gives the contact address.

<PlanChanges />
