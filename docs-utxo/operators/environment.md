---
description: The environment of a Dyma UTXO deployment, the edition switches, its URLs, Cardano data and keys.
---

# Environment

Dyma UTXO runs Dyma's code as a deployment of its own: its own domain, database, Redis, secrets,
integrations and release rhythm. Each app reads which site it serves from its environment, and every
domain comes from the environment too: nothing in the code names Dyma UTXO's domain.

Each app has a commented `.env.example`. On servers the env file lives at
`<APP_ROOT>/shared/.env` and is linked into every release (see [Deployment](./deployment)).
`NEXT_PUBLIC_*` values are **baked into the Next.js build**: change them, then deploy again.

## The edition

| App | Variable | Dyma UTXO | When |
|---|---|---|---|
| dyma-api | `DYMA_EDITION` | `utxo` | read at boot; any other value than `cosmos`, `utxo` or empty refuses to start |
| dyma-client, dyma-studio, dyma-admin, dyma-landing | `NEXT_PUBLIC_DYMA_EDITION` | `utxo` | build |
| dyma-docs | `DOCS_EDITION` | `utxo` | build, with `DOCS_URL` |

Unset means Dyma (`cosmos`). With `utxo`, the API serves only UTXO chains (Cardano today), names itself Dyma UTXO
in its messages and e-mails, prefixes every Redis key with `dyma-utxo:` and its queues with
`dyma-utxo` (unless `BULLMQ_PREFIX` says otherwise), so it can never pick up another site's data even
on a shared Redis. The apps show Dyma UTXO's names, wallets and copy.

Dyma UTXO's secrets are its own: never reuse another deployment's `JWT_SECRET`, `ADMIN_JWT_SECRET`,
`CREDENTIALS_MASTER_KEY` or `BFF_SHARED_SECRET`. The other API variables (database, Redis, proxies,
admin bootstrap, files, Turnstile, AI review) work as their `.env.example` describes.

## URLs and contact

| App | Variables | Notes |
|---|---|---|
| dyma-api | `API_PUBLIC_URL`, `AUTH_CALLBACK_BASE_URL`, `AUTH_FRONTEND_REDIRECT_URL`, `CLIENT_APP_URL`, `STUDIO_APP_URL`, `ADMIN_APP_URL`, `LANDING_APP_URL` | bare origins on Dyma UTXO's domain; the wallet sign-in message names the earner app's host; the contact address in e-mails, `hello@<domain>`, comes from `LANDING_APP_URL` |
| dyma-client | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_LANDING_URL`, `NEXT_PUBLIC_STUDIO_URL`, `NEXT_PUBLIC_DOCS_URL`, `CLIENT_APP_URL` | as on any deployment |
| dyma-studio | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLIENT_APP_URL`, `STUDIO_APP_URL` | its contact address, `hello@<domain>`, comes from the earner app's URL (else the API's) |
| dyma-admin | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLIENT_APP_URL` | |
| dyma-docs | `DOCS_URL` (required), `DOCS_BASE_URL` (default `/`), `DOCS_SITE_DOMAIN` (optional) | the site's links and contact addresses come from `DOCS_URL`'s host (its last two labels), or from `DOCS_SITE_DOMAIN` |

Dyma UTXO shows one contact address, `hello@<domain>`, for support, billing, security, privacy and
legal, with `dymaweb3@gmail.com` as the second address wherever contact details are listed.

## Cardano chains and data

| Variable | Default | Notes |
|---|---|---|
| `DYMA_DEFAULT_CHAIN_ID` | `cardano-mainnet` | the chain wallets sign in on when the app names none |
| `PAYMENTS_CHAIN_ID` | the default chain | where plans are paid (`cardano-mainnet`, or `cardano-preprod` for tests) |

The seed registers **Cardano** (`cardano-mainnet`, enabled) and **Cardano Preprod**
(`cardano-preprod`, off until an operator turns it on), with the capabilities the Cardano quests
use: transfers, staking and Plutus scripts. **Admin → Chains** edits them, including where their data
comes from:

- **Blockfrost**, the default provider: store the project ids in **Admin → Integrations →
  Blockfrost** (the `blockfrost` credential, `projectId` or `projectIds`, one per network; their
  `mainnet…` or `preprod…` prefix says which). Without a project id for a network, Koios is used.
- **Koios**: the public API needs no key. A chain can prefer Koios, and then falls back to Blockfrost.

A provider that fails is retried, and quests waiting on it are checked again a few minutes later.

## Escrow

| Variable | Default | Notes |
|---|---|---|
| `ESCROW_ENABLED` | `false` | runs the escrow scan (60 s) and health (5 min) jobs and opens automatic distribution; keep it off until the escrow is deployed on the network and registered in Admin |
| `ESCROW_COMMIT_BATCH` | `1000` | entries per commit, rounded down to a multiple of 20 (at least 20) and capped by the registry's limit (100) |
| `ESCROW_REVIEW_GRACE_HOURS` | `24` | default review grace (1–72) |
| `ESCROW_OPERATOR_MIN_BALANCE_USAF` | `50000000` | on Dyma UTXO, in lovelace: alert when the operator holds less than 50 ADA |
| `ESCROW_OPERATOR_MNEMONIC`, `ESCROW_PAUSER_MNEMONIC`, `ESCROW_TICKET_ED25519_SEED`, `REPUTATION_ATTESTER_ED25519_SEED` | | dev and test deployments only; ignored in production, where the encrypted credentials are the only source ([Escrow operations](./escrow-operations#hot-keys)) |

## Billing

| Variable | Default | Notes |
|---|---|---|
| `PAYMENTS_PROVIDER` | `crypto` | |
| `BILLING_CARDANO_TREASURY_XPUBS` | — | optional allowlist of treasury account keys (`acct_xvk1…`); when set, the key saved in Admin must be one of them |

Everything else (the treasury key, the ADA price sources and lock, confirmations, lifetimes) is set
in **Admin → Billing → Settings**: see [Billing settings](./billing-settings).
