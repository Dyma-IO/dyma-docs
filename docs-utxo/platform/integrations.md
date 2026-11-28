---
description: Third-party credentials of Dyma UTXO, stored encrypted and managed in Admin, and how each integration is wired.
---

import Credentials from '@site/docs-shared/platform/_credentials.mdx';
import IntegrationServices from '@site/docs-shared/platform/_integration-services.mdx';

# Integrations and credentials

<Credentials />

## Providers

| Provider | Key | Used for |
|---|---|---|
| X | `twitter` | sign-in and X quest checks; the app bearer token (`bearerToken`, or `TWITTER_BEARER_TOKEN`) serves app-only lookups: Studio target resolution and the X Spaces quests |
| Discord | `discord` | sign-in, account linking, the platform's bot (join, role, message quests) |
| Telegram | `telegram` | the platform's bot that links earners' Telegram accounts |
| GitHub | `github` | sign-in, account linking, project repository authorization |
| YouTube | `youtube` | account linking, subscribe/like checks, metadata (optional API key) |
| Google | `google` | sign-in |
| S3 storage | `hetzner_s3` | uploads (any S3-compatible bucket) |
| AWS SES | `aws_ses` | e-mail (read from the environment in practice) |
| Anthropic (Claude API) | `anthropic` | Dyma AI review: `apiKey`, and `workspaceId` for keys not scoped to a workspace (Admin → Integrations → Claude) |
| Blockfrost | `blockfrost` | the data provider of the Cardano chains: `projectId` or `projectIds`, one per network (Admin → Integrations → Blockfrost); Koios needs no credential |
| Stripe | `stripe` | kept but disabled; Stripe secrets are read from the environment |
| Escrow keys | `escrow_operator`, `escrow_pauser` (`mnemonic`), `escrow_ticket` (`ed25519Seed`) | the Cardano escrow's hot keys, super admin only, write-only (Admin → Escrow → Hot keys shows the address, the public key and the balance) — see [Escrow operations](../operators/escrow-operations) |
| Reputation attester | `reputation_attester` (`ed25519Seed`) | signs reputation badge attestations, super admin only, write-only (Admin → Settings → Reputation) |
| AI provider | `ai_provider` | reserved (unused) |

<IntegrationServices />
