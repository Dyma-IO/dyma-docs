---
sidebar_position: 3
---

# For projects

Projects use **Studio** to run task-to-earn campaigns with a strict three-level hierarchy.

## Content hierarchy

```
Project
 └── Campaign (1..n)
      └── Quest (1..n)
```

Nothing is published without this chain.

### Project

The organization profile on Dyma: branding, category, subscription plan, optional verification API, and SEO settings.

### Campaign

A time-bound program with shared escrow, eligibility rules, and analytics. Status flows: Draft → Scheduled → Active → Paused → Ended.

### Quest

An individual completable task with a task type, verification method, reward, input schema (for manual tasks), and per-user limits.

## Reward models

| Model | Description | Best for |
|-------|-------------|----------|
| **DP model** | Rewards in Dyma Points; project handles final token distribution | Fastest onboarding |
| **IBC model** | Tokens deposited in escrow on Safrochain; on-chain settlement | Projects with IBC assets |
| **Token factory** | Mint project token on Safrochain for campaigns | Branded on-chain distribution |

## Verification options

| Method | Typical SLA | Use when |
|--------|-------------|----------|
| On-chain indexer | ~1.8s median | Swaps, stakes, transfers, deploys |
| Platform API | Seconds | X, Discord, Telegram, GitHub actions |
| Project REST API | Configurable (default 30s) | Custom business logic on your servers |
| Manual review | ≤ 24h (≤ 12h on Pro) | Content, quality review, edge cases |
| Hybrid | Varies | Auto first, manual fallback |

Growth and Pro plans can register a **project REST API** endpoint for custom verification. See [Verification](../platform/verification#project-rest-api).

## Moderators

Seat count depends on subscription tier. Project moderators review manual quests for their project only. Dyma moderators handle global queues and appeals.

## Plans and quotas

Pricing is dynamic and managed from admin. Each plan defines monthly verification quota, moderator seats, and feature flags (API access, data export, AI SEO, and more). One verification equals one validated quest submission.

Apply for Studio access at [studio.dyma.io](https://studio.dyma.io).
