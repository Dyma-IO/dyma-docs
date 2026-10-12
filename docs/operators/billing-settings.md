---
sidebar_position: 4
---

# Billing settings

Plan payments are USDC transfers on Safrochain verified by the API (see
[Billing](../projects/billing) for the project side). Operators configure them in **Admin →
Billing → Settings** (`GET`/`PATCH /v1/admin/billing/settings`, super admin only). Until an admin
saves the settings, the `PAYMENTS_*` environment variables provide the defaults.

## Settings

| Setting | Default | Notes |
|---|---|---|
| Provider | `crypto` | `crypto`; `stripe` only with `STRIPE_ENABLED=true` and both Stripe secrets; `mock` is refused in production |
| Chain | `safrochain-1` | `safro-testnet-1` on testnet (switches the default asset to the testnet USDC) |
| Treasury address | none | a valid `addr_safro1…` address, ideally a multisig, edited here by a super admin (never hard-coded in code or seeds; `PAYMENTS_TREASURY_ADDRESS` only bootstraps it). Must belong to `BILLING_TREASURY_ADDRESSES` when that allowlist is set. Without a treasury, crypto payments are off (`TREASURY_NOT_CONFIGURED`) |
| USDC bridge link | `https://hub.safrochain.com` | optional https page where payers move USDC from Injective to Safrochain over IBC. When set, Studio shows a **Bridge USDC** button on the payment page; empty hides it. Safrochain Hub (listed in token-registry's README) has a bridge section at `/trade/bridge` |
| Injective treasury | none | an `inj1…` address. While empty, **Pay directly on Injective** shows as *Coming soon* in Studio; once saved, projects can pay USDC on `injective-1` by manual transfer + transaction hash. Also subject to `BILLING_TREASURY_ADDRESSES` |
| Injective explorer | Mintscan | `{hash}` template for Injective payments |
| Accepted assets | the network's USDC on, the other USDC off | mainnet: USDC (Injective) `ibc/1E18…5C38` default, USDC (Noble) `ibc/8E27…45B5` available. Matched by exact denom |
| Confirmations | 1 | |
| Payment request lifetime | 60 minutes | |
| Late-payment window | 3 days | an expired request still settles when paid within it |
| Explorer template | the chain's | `{hash}` placeholder |
| Durations offered | 1, 3, 6, 12 months | 12 months bill at the plan's yearly price |
| Grace period | 7 days | limits kept, status *past due* |
| Renewal reminders | 7, 3, 1, 0 days before the term end | |
| Grace reminders | days 3 and 6 of the grace | |
| Minimum charge | 1.00 USD | |
| Overpayment tolerance | 0.01 USD | |

Changes are validated as a whole, audit-logged, and a change of either treasury or of the provider
raises a critical admin-inbox alert. There is no automatic debit: renewals are new payments.

### Treasury allowlist (`BILLING_TREASURY_ADDRESSES`)

Optional, comma or space separated, set in the API environment. When it is set:

- the Safrochain treasury (`addr_safro1…`) and the Injective treasury (`inj1…`) saved in Admin must
  each be one of its entries (the admin form then offers a picker instead of a free field);
- a treasury dropped from the list stops taking payments at once (Studio sees no treasury) and the
  settings page lists it as a problem.

When it is unset, any valid address with the right prefix is accepted. Use it in production so a
compromised admin account cannot redirect payments to an address the operators did not deploy.

## USDC from Injective

Mainnet payments default to **USDC (Injective) on Safrochain** (`ibc/1E18…5C38`). Payers holding
USDC on Injective first send it over IBC: Injective `channel-495` → Safrochain `channel-2`
(`_IBC/injective-safrochain.json` in token-registry), from Keplr (*IBC Transfer*) or Leap (*Send*,
destination Safrochain). Studio explains these steps on the payment page and links the bridge page
above when one is set.

### Paying directly on Injective

Off until an Injective treasury is saved. Then Studio offers it as a second network:

- the request snapshots `injective-1`, USDC `erc20:0xa00C59fF5a080D2b954d0c75e46E22a0c371235a`
  (6 decimals, the bank denom of Circle USDC on Injective) and the Injective treasury;
- the payer sends a bank `MsgSend` with the memo from any Injective wallet or exchange and pastes the
  hash; the API verifies it over Injective's LCD (`https://sentry.lcd.injective.network`, from the
  chain registry): recipient, denom, amount, memo, time window and confirmations, exactly like
  Safrochain payments. The payment watcher scans the Injective treasury too;
- wallet signing stays *soon*: Injective accounts use eth_secp256k1 keys, which Dyma's CosmJS signer
  does not support yet.

Billing → Treasury shows the Injective treasury's USDC and INJ (gas) under the Safrochain balances.

## Jobs

| Job | Every | Does |
|---|---|---|
| Payment watcher | 1 minute | re-checks submitted transactions and scans recent transfers to the treasury for an open request's memo (pasting the hash is optional for payers) |
| Billing lifecycle | hourly | expires requests, applies scheduled plan changes, rolls monthly usage windows (Free is perpetual), starts the grace, moves projects to Free when it ends, sends reminders once each |

`POST /v1/admin/billing/lifecycle/run` runs the hourly sweep on demand (super admin).

## Admin tools

| Screen | Actions |
|---|---|
| Billing → Payments | every payment request with its status, payer, transactions; **attach a transaction** (optionally ignoring the memo or the time window, with a reason), **mark as paid** (a manual invoice with a reference), **cancel** |
| Billing → Treasury | live balances of the treasury (SAF, then DYMA, then USDC (Injective), then other accepted assets), the Injective treasury when set, and the recorded inflows |
| Projects → subscription | **assign a plan** (term and months), **extend** (months, days or a date), **suspend**, **restore** — each with a reason, recorded in the audit log |

A subscription suspended by Dyma is never reactivated by a payment.

## Testnet

Set `PAYMENTS_CHAIN_ID=safro-testnet-1` (or the chain in the settings). The testnet USDC is
`ibc/2180E84E20F5679FCC760D8C165B60F42065DEF7F46A72B447CFF1B7DC6C0A65` (Noble testnet `uusdc`
over `transfer/channel-12`); bridge some from Noble's testnet to try a payment.
