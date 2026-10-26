---
description: A campaign moves through explicit steps, each one an action in Studio checked by the API.
---

import CampaignLifecycle from '@site/docs-shared/projects/_campaign-lifecycle.mdx';

# Campaign lifecycle

<CampaignLifecycle />

## After the end

Points stop at the end; reviews still pending can be decided during the **review grace** (24 hours
by default). Then the reward split is computed and paid: by you
([Manual payouts](./manual-payouts)), or through the escrow, where earners claim their shares during
the claim window and Dyma UTXO's operator returns what was not claimed, with your ADA deposit, once
the window is over ([Automatic distribution](./automatic-escrow)).
