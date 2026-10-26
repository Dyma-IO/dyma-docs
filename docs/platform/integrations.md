---
sidebar_position: 7
description: "Third-party credentials are stored encrypted (AES-256-GCM under CREDENTIALSMASTERKEY) in"
---

import Credentials from '@site/docs-shared/platform/_credentials.mdx';
import IntegrationServices from '@site/docs-shared/platform/_integration-services.mdx';

# Integrations and credentials

<Credentials />

## Providers

| Provider | Key | Used for |
|---|---|---|
| X | `twitter` | sign-in and X quest checks; the app bearer token (`bearerToken`, or `TWITTER_BEARER_TOKEN`) serves app-only lookups: Studio target resolution and the X Spaces quests |
| Discord | `discord` | sign-in, account linking, the Dyma bot (join, role, message quests) |
| Telegram | `telegram` | the Dyma bot that links earners' Telegram accounts |
| GitHub | `github` | sign-in, account linking, project repository authorization |
| YouTube | `youtube` | account linking, subscribe/like checks, metadata (optional API key) |
| Google | `google` | sign-in |
| S3 storage | `hetzner_s3` | uploads (any S3-compatible bucket) |
| AWS SES | `aws_ses` | e-mail (read from the environment in practice) |
| Anthropic (Claude API) | `anthropic` | Dyma AI review: `apiKey`, and `workspaceId` for keys not scoped to a workspace (Admin → Integrations → Claude) |
| AI provider | `ai_provider` | reserved (unused) |
| Stripe | `stripe` | kept but disabled; Stripe secrets are read from the environment |
| Escrow keys | `escrow_operator`, `escrow_ticket`, `escrow_pauser` | the escrow's hot keys in mnemonic mode, super admin only, write-only (Admin → Settings → Credentials shows the derived address and balance) — see [Escrow operations](../operators/escrow-operations) |

<IntegrationServices />
