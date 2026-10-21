---
sidebar_position: 3
---

# Verification

Every quest has a task type (what to do) and a verification method (how Dyma checks it). A
verified submission is credited immediately: there is no separate claim step.

## Methods

| Method | ID | Mechanism |
|---|---|---|
| Platform API | `platform_api` | X, Discord, Telegram, YouTube, GitHub checks with the earner's linked account (see [Integrations](../projects/integrations)) |
| On-chain | `on_chain` | the API reads the chain's REST endpoints and matches the earner's transaction to the quest rule |
| Project REST API | `project_rest` | the project's own endpoint, called and signed by Dyma (see [Project REST verification](../projects/rest-verification)) |
| Manual review | `manual` | the project's (or Dyma's) moderators approve or reject |
| Hybrid | `hybrid` | automatic first; after a provider error or 3 failed checks the earner can request a review |
| AI verify, Hybrid + AI | `ai_verify`, `hybrid_ai` | routed to review, where Dyma AI review (Claude) decides first on paid plans |

Submissions that go to review (`manual`, `hybrid` after its fallback, `ai_verify`, `hybrid_ai`) are
first reviewed by **Dyma AI review** when the project's paid plan includes AI reviews: Claude
approves or rejects above its confidence thresholds, otherwise the item stays with the moderators
(see [Moderation and AI review](../projects/ai-review)).

Built-in flows verify themselves on the server: quizzes (answers never leave the server), secret
codes, visits (waiting time enforced), daily check-ins, lucky draws, referrals, e-mail links and
signed messages.

## Submission states

```
started ──► verifying ──► claimed (verified and credited)
                 │
                 └──────► rejected (reason shown; the earner may submit again)
```

- **claimed** — set at verification with `verifiedAt = claimedAt`, the quest's points and XP stored
  on the submission at that moment. (`claimable` exists only on legacy rows.)
- **verifying** — waiting for a moderator, or for an automatic re-check (an on-chain transaction not
  indexed yet, a waiting time not over).
- A temporary miss keeps the submission open; a final failure rejects it; credited and rejected
  submissions never change again (except an explicit admin action).

Every completion path goes through one participation guard (quest live, campaign window, project
live, eligibility, prerequisites, recurrence limits, plan quota) and one lifecycle service that
serializes completions per earner and quest with a database lock, so parallel taps never credit
twice. The generic `POST /v1/quests/:questId/submissions` refuses task types that have their own
flow (`USE_DEDICATED_FLOW`) and ignores input keys only the server may write.

## On-chain quests

- The earner's address on the quest's chain is the linked wallet with that chain's prefix, or an
  address derived from a linked wallet with the same key type (never across Ethereum-style and
  Cosmos keys).
- Transactions are read from the chain's REST endpoints (with fallbacks); events, messages, memos,
  fee payers and authz wrappers are understood.
- The window opens at the campaign start (else the quest's publication). A transaction proves one
  quest for one earner; reusing it is refused.
- An unknown transaction hash is retried for 15 minutes after submission before being refused; too
  few confirmations or a node outage is retried too.
- Supported: transfers, swaps (Osmosis or a configured DEX contract), liquidity adds, staking,
  unstaking and redelegation, votes and proposals, NFT mints, contract interactions, data
  availability blobs, bridges (counterparty checked through the channel's light client), wallet
  proofs and signed messages. **Hold LP position** is disabled (it needs balance sampling over time).

There is no standalone chain indexer: `POST /v1/webhooks/indexer` (HMAC-signed with
`INDEXER_WEBHOOK_SECRET`, 5-minute skew) is reserved for one, but none runs today.

## Moderation

- Project moderators review their project's queue in Studio; Dyma moderators see the global queue.
- Decisions apply only to items still pending (checked under the same lock): approval credits the
  points, rejection records the reason and notifies the earner.
- Bulk decisions (plan feature) continue past failures and report them per item.
- Evidence files are private: only the uploader, the project team and Dyma operators can open them.

## Escrow settlement

Verification produces points; token payouts happen after the campaign — see
[Distribution modes and the split](../projects/distribution).
