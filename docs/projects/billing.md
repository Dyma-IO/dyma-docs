---
sidebar_position: 8
---

# Billing: plans paid in USDC

Plans are priced in US dollars and paid in **USDC on Safrochain**, 1 USDC = 1 USD. There is no card
payment and no automatic debit: you send a transfer, Dyma verifies it on chain, and your plan is
extended at once.

| Network | Default USDC | Denom |
|---|---|---|
| Mainnet `safrochain-1` | USDC (Injective) | `ibc/1E180C085A3A2688CDF2A781E5990BE8AA92CE69CB62A8CC6BB9F5EE17DD5C38` |
| Mainnet, if Dyma enables it | USDC (Noble) | `ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5` |
| Testnet `safro-testnet-1` | USDC (Noble testnet) | `ibc/2180E84E20F5679FCC760D8C165B60F42065DEF7F46A72B447CFF1B7DC6C0A65` |

Both mainnet USDCs have 6 decimals. Only the exact denoms above count: a token merely *called*
USDC does not.

## Buying or renewing a plan

1. **Project → Billing → Plans.** Pick a plan and a duration: 1, 3, 6 or 12 months. Twelve months
   cost the yearly price (two months free on the default plans).
2. Studio shows the **quote** (the price, and for upgrades the credit for the days left) and opens
   a **payment request** valid for **60 minutes**:

   | Field | Example |
   |---|---|
   | Amount | `99.000000 USDC` |
   | Send to | Dyma's treasury address (`addr_safro1…`) |
   | Memo | `DYMA-7K2M9QXA` — unique to this request |

3. Pay it, either way:
   - **With your wallet** (Zunia, Keplr, Cosmostation, EightSaf, WalletConnect): Studio builds the
     transfer with the memo; you approve it.
   - **Manual transfer** from any Safrochain wallet: send the exact amount of the accepted USDC to
     the treasury **with the memo**, then paste the transaction hash in Studio. Pasting is optional:
     Dyma also scans incoming transfers to the treasury every minute and matches the memo.
4. Dyma verifies the transaction on chain and, once it is confirmed, extends the plan and issues an
   invoice with the transaction hash and an explorer link.

### Your USDC is on Injective?

The payment page says **Pay with USDC (Injective) on Safrochain**: Dyma takes Circle USDC that came
from Injective, on Safrochain. If your USDC is still on Injective, bridge it over IBC first (a minute
or two):

1. In Keplr or Leap, open **USDC on Injective** and choose an IBC transfer (Keplr: *IBC Transfer*;
   Leap: *Send* with Safrochain as the destination).
2. Destination chain **Safrochain**. If the wallet asks for a channel, use **`channel-495`** (the
   Injective side; it arrives on Safrochain `channel-2`).
3. Send it to your own `addr_safro1…` address and keep a little SAF there for the payment fee.
4. It shows up as USDC (`ibc/1E18…5C38`). Come back and pay.

When Dyma has configured a bridge page, the payment page also shows a **Bridge USDC** button.

### Paying directly on Injective

Studio lists **Pay directly on Injective** as a second network. It shows *Coming soon* until Dyma
opens it; then the payment request asks for USDC on Injective
(`erc20:0xa00C59fF5a080D2b954d0c75e46E22a0c371235a`) sent to Dyma's `inj1…` treasury with the memo,
from any Injective wallet or exchange that supports memos (fee in INJ). Paste the transaction hash
in Studio (Dyma also watches the Injective treasury). Signing from Studio with a wallet is not
available on Injective yet.

### What the verification checks

| Check | Refused with |
|---|---|
| The transaction exists and succeeded on the billing chain | `TX_NOT_FOUND` (retried), `TX_FAILED`, `CHAIN_MISMATCH` |
| It transfers to the treasury (bank send, multi-send, or inside an authz exec) | `WRONG_RECIPIENT` |
| In an accepted denom, exactly | `WRONG_DENOM` |
| With the request's memo | `MEMO_MISMATCH` |
| Sent between 5 minutes before the request and its expiry plus the late-payment window (3 days) | `PREDATES_INVOICE`, `TOO_LATE` |
| Confirmed (1 block by default) | `NOT_CONFIRMED` (retried) |
| Never used for another payment | `ALREADY_USED` |

- **Short payment**: the request becomes *Partially paid* and shows what is left; send the rest
  with the same memo, the transfers add up.
- **Expired request**: a transfer that arrives within 3 days after expiry still settles it. After
  that, create a new request.
- Only **one payment can be in flight per project** at a time; cancel a pending request to start
  another.
- The minimum charge is 1 USD.

## Changing plan

| Change | Effect |
|---|---|
| New (from Free, or after a lapse) | the term starts when the payment settles |
| Renewal (same plan) | the term end moves by the months bought |
| Upgrade (pricier plan) | switch now and pay only the difference for the days left in the term, plus any extra months |
| Downgrade (cheaper paid plan) | prepaid, starts at the end of the current term; no refund for unused time |
| Back to Free | scheduled at the end of the term (or now, if you choose) |

## Renewals and grace

- Nothing is charged automatically. Reminders arrive **7, 3 and 1 days** before the term ends and on
  the day itself (e-mail and Studio notifications; they cannot be muted).
- If the term ends unpaid, a **7-day grace** starts: your plan's limits stay in place, the
  subscription shows *past due*, and reminders follow on days 3 and 6.
- Paid during the grace, the new term starts where the old one ended (grace days are not free).
- When the grace ends unpaid, the project moves to **Free** and Free's limits apply from then on
  (300 verifications a month by default).
- A project suspended by Dyma is not reactivated by a payment; contact support.

## Free plan

Free never expires. Its usage counter resets every month.

## AI reviews

Paid plans include a monthly number of **AI reviews**: Claude reviews the submissions of manual and
hybrid quests and approves or rejects them (Starter 100, Growth 500, Pro 2,500, Enterprise 10,000
a month by default; Free has none). Past the quota, submissions wait for your moderators until the
next month. See [Moderation and AI review](./ai-review).

## Invoices

**Billing → Invoices** lists every paid request with its number, amount, asset, payer address,
transaction hash and explorer link. Card invoices exist only if Dyma ever enables Stripe, which is
switched off by default.
