---
description: In manual mode you pay earners yourself on Cardano, in batches of 60 that Dyma UTXO checks before marking anyone paid.
---

import ManualPayoutsWhen from '@site/docs-shared/projects/_manual-payouts-when.mdx';
import ManualPayoutsOther from '@site/docs-shared/projects/_manual-payouts-other.mdx';

# Manual payouts

<ManualPayoutsWhen />

## Paying with the payout assistant

1. Open **Rewards → Escrow & payouts** and the campaign's **Payout assistant**. Earners are grouped
   in batches of up to **60 payouts**: one Cardano transaction per batch, with one output per earner
   carrying exactly their amount. (Outputs of native tokens are larger, and Cardano caps a
   transaction at 16 KB.)
2. Connect a wallet of the project team (Lace, Eternl, VESPR, Yoroi or another CIP-30 wallet) on the
   token's network. It must be linked to a team member's account with its payment address proven;
   Studio asks for the signatures the first time. It needs the batch total plus ADA for the fee.
3. Studio prepares the batch's transaction from that wallet's own UTxOs and your wallet signs it. A
   prepared batch stays valid 10 minutes and only one is in flight per batch, so a batch is never
   paid twice.
4. Dyma UTXO checks the transaction on chain:
   - it succeeded, and every input comes from a wallet of the project team;
   - every output pays an unpaid allocation of this distribution, once, with **exactly** its amount
     and nothing else: only ADA for an ADA pool; for a native token, exactly that token plus the ADA
     the output must hold;
   - any other output is change back to the team.

   Any mismatch rejects the whole transaction.
5. The matching allocations become **paid**; earners see "Paid by *your project*" with the
   transaction link and get a notification.

Repeat for each batch. The assistant shows what is pending, submitted and paid.

### The minimum ADA per payout

Every Cardano output must hold a minimum of ADA (about 1 ADA, set by the protocol parameters).

- **Native-token payouts**: each output carries that ADA as well, paid from your wallet and kept by
  the earner. Plan for it on top of the batch total.
- **ADA payouts**: a share below that minimum cannot be sent on its own. The assistant refuses the
  batch and lists those shares: pay them another way, then **Mark as paid** (below).

A transaction signed with another tool can be attached by its hash (below) when its inputs come from
payment keys your team proved. A payment from a script address, such as a native multisig wallet,
cannot be matched that way: mark those payouts as paid and add the transaction hash.

<ManualPayoutsOther />
