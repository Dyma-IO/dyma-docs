---
sidebar_position: 2
---

# Content model

All quest content follows **Project → Campaign → Quest**. Studio workflows map directly to this hierarchy.

## Project

| Field | Description |
|-------|-------------|
| Name, slug, logo, cover | Branding; cover drives OG images |
| Description, website, socials | Public project page |
| Project category | e.g. DEX, Layer-1, Validator (admin-managed) |
| Subscription plan | Dynamic tier from admin pricing |
| Project moderators | Seat count limited by plan |
| Verification API | Optional REST endpoint for custom tasks |
| SEO profile | Title, description, keywords, OG overrides |
| Status | Draft · Pending approval · Live · Suspended |

## Campaign

| Field | Description |
|-------|-------------|
| Name, description, cover | Optional campaign-specific OG |
| Start / end datetime | Scheduling |
| Status | Draft · Scheduled · Active · Paused · Ended |
| Reward pool | DP plus optional on-chain escrow |
| Eligibility rules | Reputation floor, regions, wallet age, etc. |
| Quest count | Auto and manual breakdown |

## Quest

| Field | Description |
|-------|-------------|
| Title, description, instructions | User-facing copy |
| Task type | From global catalog (admin can disable types) |
| Quest category | Filter tag (On-chain, Social, Developer, etc.) |
| Verification method | Indexer · Platform API · Project REST · Manual |
| Reward | DP, XP, optional token amount |
| Input schema | Dynamic fields for manual or custom submissions |
| Limits | Max completions, per-user cap, cooldown |
| Status | Draft · Live · Paused · Archived |

## Task type catalog

Task types are stored globally. Super admin can enable or disable types platform-wide. Disabled types are hidden from Studio but existing quests remain until archived.

Each task type defines default verification, required integrations, default input schema, and compatible quest categories.

Examples:

| Task type | Category | Verification |
|-----------|----------|--------------|
| Twitter Follow | Social | Platform API |
| GitHub Star | Developer | Platform API |
| DEX Swap | On-chain | On-chain indexer |
| Tutorial submit | Content | Manual review |
| Custom logic | Any | Project REST API |

See [Verification](./verification) for how submissions are validated.
