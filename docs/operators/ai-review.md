---
sidebar_position: 5
---

# AI review operations

How Dyma runs **Dyma AI review**: Claude reviews pending submissions of manual and hybrid quests
(see [Moderation and AI review](../projects/ai-review) for what projects see).

## The Claude API key

- Stored encrypted as the platform credential `anthropic` (`apiKey`, optional `workspaceId`) in
  **Admin → Integrations → Claude**. The key is never shown again; **Test key** lists the models,
  which spends no tokens.
- Keys that are not scoped to a workspace (personal keys starting `sk-ant-usr`) are refused by the
  Claude API without a workspace: add the workspace id (`wrkspc_…`, Claude Console → Settings →
  Workspaces) next to the key. Workspace keys work without it.
- Bootstrap: when no `anthropic` credential exists, the API stores `CLAUDE_API_KEY` (or
  `ANTHROPIC_API_KEY`) from its environment at boot, with `CLAUDE_WORKSPACE_ID` when set. Admin owns
  the key from then on.

## Settings (Admin → Settings → AI review)

| Setting | Default | Notes |
|---|---|---|
| Mode | `off` (or `AI_REVIEW_MODE`) | `off`: nothing reviewed. `shadow`: a test, Claude reviews a few pending items a day and only records its verdict, ignoring plans and quotas. `live`: verdicts are applied within each project's quota |
| Model | Claude Opus 5.5 | Sonnet 5.5 and Haiku 5.5 can be picked; Haiku 5.5 is by far the cheapest |
| Effort | `low` | keeps reasoning, and tokens, to a minimum |
| Approve / reject from | 80% / 85% | below, the item stays with the moderators with the verdict attached |
| Images per review, image size | 2, 640px | fewer and smaller images cost fewer tokens |
| Shadow reviews per day | 5 (or `AI_REVIEW_SHADOW_LIMIT`) | shadow mode only |
| Platform reviews per day | 1,000 | safety cap across every project |
| Monthly budget | $100 | estimated spend; past it, AI review pauses until the next month |

A mode saved in Admin wins over the environment defaults. Every save is audit-logged.

## How a review runs

1. A submission enters the review queue (or the 5-minute sweep finds a pending one): a job goes to
   the BullMQ queue `ai-review` (one at a time, at most 20 a minute, 3 attempts with backoff).
2. Live mode checks eligibility: key stored, the project's plan has AI reviews (Starter 100,
   Growth 500, Pro 2,500, Enterprise 10,000 a month by default, edited in Pricing & plans), a paid
   subscription (active or in its renewal grace, not a trial), reviews left this UTC month, and the
   platform caps. A project without AI reviews or with its quota used is skipped once and left to
   people; platform caps make it wait for the next day or month.
3. Claude gets the quest, the earner's inputs and up to the configured number of images. Links are
   never fetched. The answer is a structured verdict: approve, reject or needs a human, a
   confidence, a reason for moderators and a short message for the earner.
4. Live mode applies it through the same path as a moderator (`ai:claude` as the reviewer, only
   while the item is still pending, so a human decision always wins).

Each review stores its tokens and estimated cost; **Settings → AI review** shows the month's totals,
decisions, top projects and the latest reviews. The API logs one line per review (item, project,
task type, mode, decision, confidence, tokens, cost) and never the evidence or the key.

## Rollout

1. Store the key (and workspace id when needed) and test it.
2. Turn on **shadow** with a small daily limit, or run **Review with AI now** on one item from
   Admin → Moderation (in shadow mode it only records the verdict). Check the verdicts and costs in
   Settings → AI review.
3. Switch to **live**. Pending items of eligible projects are reviewed by the sweep, oldest first.
4. Watch the month's cost against the budget; lower the effort, the images or switch to a cheaper
   model if needed.
