---
description: How Dyma UTXO operators configure plan payments in ADA and USDM, the treasury key and the ADA price.
---

# Billing settings

Plan payments are ADA or USDM transfers on Cardano, each to an address of its own (see
[Billing](../projects/billing) for the project side). Operators configure them in **Admin → Billing →
Settings** (`GET`/`PATCH /v1/admin/billing/settings`, super admin only). Until an admin saves the
settings, the `PAYMENTS_*` environment variables and the Cardano defaults apply.

## The treasury key

Dyma UTXO does not take payments at one fixed address. The treasury is a Cardano **account public
key** (`acct_xvk1…`, the `m/1852'/1815'/0'` key a wallet exports, ideally from a hardware wallet),
and every payment request gets its own address of that account (CIP-1852 external addresses, one
index per request). A payment is recognised by the address it lands on, so no memo is needed, and
the funds are in the treasury wallet itself.

- Addresses that never received funds are lent to a new request once theirs closed, which keeps
  every payment within the wallet's address gap limit.
- Closed and expired requests are still watched during their late window, so a payment on its way is
  settled, or raised to admins, never lost, and its address is not lent meanwhile.
- When `BILLING_CARDANO_TREASURY_XPUBS` is set in the API's environment, the key saved here must be
  one of its entries; a key removed from it stops taking payments. Without a treasury key, payments
  stay closed and Studio says so, with the contact address.

## Settings

| Setting | Default | Notes |
|---|---|---|
| Provider | `crypto` | `stripe` only with `STRIPE_ENABLED=true` and both Stripe secrets; `mock` is refused in production |
| Chain | `cardano-mainnet` | `cardano-preprod` for tests (paid in test ADA) |
| Treasury key | none | an `acct_xvk1…` account key (above); none keeps payments closed |
| Accepted assets | ADA (default) and USDM on mainnet | matched by exact unit; ADA is the only asset priced at the market rate, any other must be a USD stablecoin counted 1:1 |
| ADA price lock | 20 minutes | 5 to 120 minutes; an ADA request expires with its lock |
| Price sources | CoinGecko, Kraken, Coinbase | the ADA/USD price is their median |
| Minimum sources | 2 | sources that must answer with a fresh price |
| Largest gap | 3% | a source further than this from the median blocks quoting (0.1% to 20%) |
| Price age | 2 minutes | an older source price is not used (30 seconds to 1 hour) |
| Price override | none | a manual ADA/USD price (`"0.4123"`) used instead of the sources, for example during an outage |
| Confirmations | from `PAYMENTS_MIN_CONFIRMATIONS` | blocks a payment needs before it settles; a Cardano block comes about every 20 seconds |
| Payment request lifetime | from `PAYMENTS_INVOICE_TTL_MINUTES` | how long a USDM request stays open |
| Late-payment window | 3 days | an expired request still settles when paid within it; an ADA payment made after its lock is re-priced, up and never down |
| Durations offered | 1, 3, 6, 12 months | 12 months bill at the plan's yearly price |
| Grace period | 7 days | limits kept, status *past due* |
| Minimum charge | 1.00 USD | |

Changes are validated as a whole and audit-logged. A change of the treasury key raises a critical
admin-inbox alert (open payment requests keep the address they were created with); a change of the
provider or of the price override raises a warning. There is no automatic debit: renewals are new
payments.

When fewer sources answer than required, or they disagree, Studio shows that the ADA price is
unavailable and projects can still pay in USDM. Set an override only while it is needed.

## Jobs

| Job | Every | Does |
|---|---|---|
| Payment watcher | every minute; every few seconds for projects whose payment page is open | reads each open request's address: a transaction in the mempool marks it *submitted*, an included one *confirming*, a deep enough one settles it; also reads requests that expired in the last half hour, and every ten minutes those still within their late window. Every change reaches the payment page at once |
| Billing lifecycle | hourly | expires requests, applies scheduled plan changes, rolls monthly usage windows, starts the grace, moves projects to Free when it ends, sends reminders |

## Admin tools

| Screen | Actions |
|---|---|
| Billing → Payments | every payment request with its status, payer and transactions; **attach a transaction** (optionally outside the request's time window, with a reason), **mark as paid** (a manual invoice with a reference), **cancel** |
| Billing → Treasury | the treasury's balances and the recorded inflows |
| Projects → subscription | **assign a plan**, **extend**, **suspend**, **restore**, each with a reason recorded in the audit log |

A subscription suspended by Dyma UTXO is never reactivated by a payment.
