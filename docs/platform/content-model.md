---
sidebar_position: 2
---

# Content model

All content follows **Project → Campaign → Quest**.

## Project

| Field | Description |
|---|---|
| Name, slug, logo, cover | branding; the cover drives social cards |
| Description, website, socials, category | the public project page |
| Members | project admins and moderators (seats per plan) |
| Plan | subscription plan and its monthly verification quota |
| Integrations | Discord bot, Telegram bot, GitHub repositories, REST signing secret |
| Reward tokens | tokens the project pays in, inspected and approved by Dyma |
| SEO profile | title, description, keywords, card overrides |
| Status | draft → pending approval → live, or suspended (owners never write it; see below) |

Projects are submitted for review; automatic approval is on by default (Dyma can turn it off and
can always suspend a project).

## Campaign

| Field | Description |
|---|---|
| Name, description, cover | campaign page and social card |
| Start / end | required for automatic distribution; optional for manual |
| Status | draft · pending review · scheduled · active · paused · ended ([lifecycle](../projects/campaign-lifecycle)) |
| Distribution | mode (manual / automatic), reward token, pool, minimum payout, cap per earner, review grace, challenge window |
| Eligibility | verified e-mail, minimum account age, required linked accounts, allowlist |
| Quests | ordered list |

## Quest

| Field | Description |
|---|---|
| Title, description, instructions, logo | what earners see |
| Task type | from the global catalog ([Task types](./task-types)); admins can disable types |
| Verification method | platform API, on-chain, project REST, manual, hybrid ([Verification](./verification)) |
| Reward | points (DP) and XP, stored on each submission when it is verified |
| Configuration | type-specific settings (channel, repository, chain rule, quiz questions…), validated before the quest goes live |
| Input schema | fields the earner fills in, for review-based and REST quests |
| Recurrence and limits | once, interval, unlimited; max per earner; max in total ([recurring quests](../earners/recurring-quests)) |
| Unlock rules | prerequisites (complete another quest first) and date rules |
| Position | display order in the campaign |
| Status | draft · live · paused · archived |

## Submission

One earner's attempt at a quest: inputs, files (private evidence), status
(started · verifying · claimed · rejected), the points and XP credited, the period it belongs to
(the UTC day for check-ins, the interval for repeatable quests), verification attempts and the
review decision.

## Distribution

One per campaign: mode, status (not configured → awaiting funding → funded → active → … →
completed), token, pool, settings, the frozen allocation (one row per earner: payout address, points,
weight, amount, status, payout transaction) and every tracked chain operation. Automatic campaigns
also have an escrow record mirroring the on-chain contract.
