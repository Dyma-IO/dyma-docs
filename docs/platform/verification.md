---
sidebar_position: 3
---

# Verification

Dyma supports multiple verification paths. Each quest selects one primary method (or hybrid auto-then-manual).

## Methods

| Method | ID | SLA | Mechanism |
|--------|-----|-----|-----------|
| On-chain indexer | `on_chain` | ~1.8s median | Indexer watches chains; matches transactions to quest rules |
| Platform API | `platform_api` | Seconds | X, Discord, Telegram, GitHub integrations |
| Project REST API | `project_rest` | Default 30s | Your server verifies custom logic |
| Manual review | `manual` | ≤ 24h (≤ 12h Pro) | Project or Dyma moderator approves |
| Hybrid | `hybrid` | Varies | Automatic attempt first; manual on failure |

## On-chain indexer

The [`dyma-indexer`](https://github.com/Dyma-IO/dyma-indexer) service watches Safrochain and IBC-connected chains. When a user transaction matches quest criteria, the indexer emits a verification event to the API.

Suited for swaps, stakes, transfers, LP adds, contract deploys, and similar on-chain actions.

## Platform API

OAuth-linked social accounts and platform integrations verify actions like follows, joins, stars, and forks without manual review.

## Manual review

Contributors submit links, text, files, or structured inputs defined by the quest's **input schema**. Project moderators (within plan seat limits) or Dyma moderators approve or reject with a reason.

Manual quest inputs support dynamic field types: text, textarea, URL, number, select, multiselect, file upload, wallet address, date, and more.

## Project REST API

Projects on eligible plans register a verification endpoint in **Studio → Project Settings → Integrations**.

### Flow

```
User submits quest
  → dyma-api validates input schema
  → POST to project endpoint (signed payload)
  → Project returns `{ "verified": true, "reason": "optional", "metadata": {} }`
  → dyma-api records result and settles reward if verified
```

### Endpoint requirements

| Requirement | Detail |
|-------------|--------|
| Method | `POST` |
| Auth | HMAC-SHA256 in `X-Dyma-Signature` (shared secret per project) |
| Payload | `submission_id`, `quest_id`, `campaign_id`, `wallet`, `inputs`, `submitted_at` |
| Response | JSON with `verified` (boolean), optional `reason`, optional `metadata` |
| Timeout | 30s default; configurable 5–60s in Studio |
| Retries | 2 retries with exponential backoff on 5xx or timeout |
| Idempotency | Same `submission_id` returns cached result |

**Security:** Secrets are never exposed client-side. Dyma proxies all calls server-side. Projects never receive user email — only wallet and submitted inputs.

## Escrow settlement

For on-chain reward campaigns:

```
Campaign escrow
  → Quest verified on-chain
  → Settlement to user wallet (~1.8s median)
```

Dyma never takes custody between escrow and the contributor wallet.
