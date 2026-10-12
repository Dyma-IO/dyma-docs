---
sidebar_position: 4
---

# Authentication

Dyma has two separate identity systems:

1. **Users** — earners and project teams (`dyma-client`, `dyma-studio`): wallets, OAuth, e-mail
   codes, and Studio passwords.
2. **Admin operators** (`dyma-admin`): e-mail and password with two-factor authentication and
   role-based permissions.

Every successful sign-in returns an API token that the app's server keeps in an httpOnly cookie on
its own host. Users get a stable public id `dymauser_<32 hex>`; admins `dymaadmin_<32 hex>`.

## User sign-in methods

`GET /v1/auth/methods` lists what is enabled in an environment.

| Method | Where | Notes |
|---|---|---|
| Wallet | earner app, account linking | Keplr, Leap, Cosmostation, EightSaf, WalletConnect — see below |
| Google | earner app, Studio | OAuth 2.0 |
| X | earner app | OAuth 2.0 with PKCE; the grant also covers X quest checks |
| GitHub | earner app, Studio | OAuth (`read:user` for account linking) |
| Discord | earner app | OAuth |
| E-mail code | earner app | one-time code |
| Password | Studio | e-mail verification at sign-up, optional 2FA (authenticator app or e-mail code), Turnstile bot protection |

Accounts can link several methods; linking a wallet or social account already used by another
account offers to **merge** the two accounts.

## Wallet sign-in (CAIP-122)

1. `GET /v1/auth/wallet/challenge?address=<addr>&chainId=<chain>` returns a one-time nonce
   (`dyma_nonce_…`, valid 5 minutes) and the message to sign:

   ```
   app.dyma.io wants you to sign in with your Cosmos account:
   addr_safro1…

   Sign in to Dyma.

   URI: https://app.dyma.io
   Version: 1
   Chain ID: safrochain-1
   Nonce: dyma_nonce_…
   Issued At: 2026-10-10T08:00:00Z
   Expiration Time: 2026-10-10T08:05:00Z
   ```

2. The wallet signs it as an ADR-036 arbitrary message (no transaction, no fee).
3. `POST /v1/auth/wallet/verify` with `address`, `pubkey`, `signature`, `nonce`, `chainId` (and an
   optional referral `ref`). The nonce is consumed atomically; any signature error is a 401.

Both secp256k1 chains and Ethereum-style `eth_secp256k1` chains (keccak address derivation, as
Keplr signs them) are supported. Sign-in works on Dyma's curated list of Cosmos chains (Safrochain
by default), extended by `DYMA_EXTRA_KEPLR_CHAINS`; wallets can be linked on any enabled chain
registered in admin. Linking uses `GET /v1/users/me/wallets/challenge` (bound to the account) and
`POST /v1/users/me/wallets`. The legacy `GET /v1/auth/keplr/nonce` and `POST /v1/auth/keplr/verify`
routes answer with the same challenge.

## OAuth callbacks

All provider callbacks answer with a redirect — to the earner app's `/auth/callback`, Studio's
`/login`, or the account-link popup — carrying a readable `error` when something failed; they never
return JSON. Callback URLs are built from `AUTH_CALLBACK_BASE_URL` and redirects are restricted to
the configured app origins.

## Admin authentication

1. `POST /v1/admin/auth/login` with e-mail and password.
2. When 2FA is on: `POST /v1/admin/auth/2fa/verify` with the challenge token and a code from an
   authenticator app or an e-mail code.

| Protection | Rule |
|---|---|
| Wrong codes | 5 per sign-in challenge, 10 per account, then a 15-minute lock |
| Rate limits | credentials 10 per minute, e-mail codes 5 per minute |
| Super admin 2FA | optional platform setting: super admins without 2FA can only reach the 2FA routes |
| Session revocation | password change or reset, 2FA changes, role changes and suspension revoke older tokens |
| Audit | sign-in events with IP and user agent |

Roles: `super_admin` (everything), `dyma_moderator` (global moderation), plus project roles
`project_admin` and `project_moderator` for Studio. Permissions include `platform:manage`,
`credentials:manage`, `plans:manage`, `task_types:manage`, `moderation:global`.

The first super admin is created by the seed from `ADMIN_BOOTSTRAP_EMAIL` and
`ADMIN_BOOTSTRAP_PASSWORD`.

## Identifier prefixes

| Resource | Prefix |
|---|---|
| User public id | `dymauser_` |
| Admin public id | `dymaadmin_` |
| Wallet challenge nonce | `dyma_nonce_` |
| API key (display) | `dyma_key_` |
| Redis keys | `dyma:` |
