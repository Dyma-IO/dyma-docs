---
sidebar_position: 6
description: "In manual mode you keep the pool and pay earners yourself after the campaign. Dyma computes the"
---

import ManualPayoutsWhen from '@site/docs-shared/projects/_manual-payouts-when.mdx';
import ManualPayoutsOther from '@site/docs-shared/projects/_manual-payouts-other.mdx';

# Manual payouts

<ManualPayoutsWhen />

## Paying with the payout assistant

1. Open **Rewards → Escrow & payouts** and the campaign's **Payout assistant**. Earners are grouped
   in batches of up to **100 transfers** — one bank `MsgMultiSend` per batch (one input: your wallet;
   one output per earner with the exact amount), each with its own memo.
2. Connect a wallet of the project team (Zunia, Keplr, Cosmostation, EightSaf or WalletConnect) on the
   token's chain. It needs the batch total plus SAF for the fee.
3. Sign the batch. Studio sends the transaction hash to Dyma, which checks it on chain:
   - the transaction succeeded and contains only bank sends,
   - the sender is a wallet of the project team,
   - every recipient has an unpaid allocation in this distribution, appears once, and receives
     **exactly** its amount in the campaign's token.
4. The matching allocations become **paid**; earners see "Paid by *your project*" with the
   transaction link and get a notification.

Repeat for each batch. The assistant shows what is pending, submitted and paid.

<ManualPayoutsOther />
