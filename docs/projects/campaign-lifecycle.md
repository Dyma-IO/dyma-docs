---
sidebar_position: 2
description: "A campaign moves through explicit steps. Its status is never edited directly: each move is an"
---

import CampaignLifecycle from '@site/docs-shared/projects/_campaign-lifecycle.mdx';

# Campaign lifecycle

<CampaignLifecycle />

## After the end

Points stop at the end; reviews still pending can be decided during the **review grace** (24 hours
by default). Then the reward split is computed and paid: by you
([Manual payouts](./manual-payouts)) or through the escrow, where earners claim their shares during
the claim window and you withdraw what was not claimed afterwards
([Automatic distribution](./automatic-escrow)).
