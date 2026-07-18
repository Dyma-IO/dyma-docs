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
| AI verify | `ai_verify` | Seconds–minutes | AI provider scores evidence against quest rules |
| Hybrid AI | `hybrid_ai` | Varies | AI triage first; manual fallback on low confidence |

## On-chain indexer

The [`dyma-indexer`](https://github.com/Dyma-IO/dyma-indexer) service watches Safrochain and IBC-connected chains. When a user transaction matches quest criteria, the indexer emits a verification event to the API.

Suited for swaps, stakes, transfers, LP adds, contract deploys, and similar on-chain actions.

## Platform API

OAuth-linked social accounts and platform integrations verify actions like follows, joins, stars, and forks without manual review.

## Manual review

Contributors submit links, text, files, or structured inputs defined by the quest's **input schema**. Project moderators (within plan seat limits) or Dyma moderators approve or reject with a reason.

Manual quest inputs support dynamic field types: text, textarea, URL, number, select, multiselect, file upload, wallet address, date, and more.

## Project REST API

Projects on eligible plans (`project_rest_api`) configure a shared signing secret in **Studio → Project Settings → Verification**. Each **Custom (Project REST API)** quest defines its own HTTP request:

| Field | Detail |
|-------|--------|
| Method | `GET` or `POST` |
| Request URL | Full HTTPS (or HTTP) endpoint |
| Query params / headers | Key-value pairs; values may use templates |
| JSON body | POST only; string values may use templates |
| Timeout | 5–60 seconds (default 30) |
| Signing | Optional `X-Dyma-Signature` (HMAC-SHA256 of body) when a project secret exists |

### Templates

Dyma expands these before calling your API:

- `{{user.id}}`, `{{wallet}}`, `{{submission.id}}`, `{{quest.id}}`, `{{campaign.id}}`, `{{project.id}}`
- `{{inputs}}` (all earner fields) or `{{inputs.fieldKey}}` for a single field

Earner fields come from the quest **input schema**. Secrets and the raw request are never exposed to the client; Dyma proxies server-side.

### Flow

```
User submits quest inputs
  → dyma-api validates input schema
  → expands templates and calls project endpoint
  → Project returns `{ "verified": true }` or `{ "success": true }`
  → dyma-api records result and settles reward if verified
```

### Response contract

| Requirement | Detail |
|-------------|--------|
| Success | HTTP 2xx **and** JSON with `verified: true` or `success: true` |
| Failure | Non-2xx, or JSON with `verified`/`success` false; optional `reason` |
| Optional | `metadata` object (stored on the verification attempt) |
| Retries | Up to 2 retries with backoff on 5xx or timeout |
| Dry run | Studio preview calls `POST .../verification/rest/dry-run` (no submission) |

**Security:** Secrets are never exposed client-side. Projects never receive user email. Only wallet, user id, and submitted inputs are sent as configured.

## AI verification

For creative or subjective tasks (memes, hashtag posts, content quality), quests can use `ai_verify` or `hybrid_ai`. The API loads prompt templates from `ai_prompt_templates` and provider credentials from `platform_credentials`. AI logs store metadata only (no PII).

`hybrid_ai` routes low-confidence results to the moderation queue automatically.

## Submission state machine

`idle` → `started` → `verifying` → `claimable` → `claimed` (or `rejected`)

Submissions are validated against each quest's JSON **input schema** at runtime (AJV), not hard-coded per task type.

## Escrow settlement

For on-chain reward campaigns:

```
Campaign escrow
  → Quest verified on-chain
  → Settlement to user wallet (~1.8s median)
```

Dyma never takes custody between escrow and the contributor wallet.
