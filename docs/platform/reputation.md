---
sidebar_position: 4
---

# Reputation and rewards

## DP — Dyma Points

Universal reward currency and season scoring unit.

- Default reward for most campaigns
- Drives ranks, multipliers, and unlock tiers
- May convert to project tokens per campaign rules
- Partner campaigns can additionally escrow real assets (USDC, ATOM, TIA, SAF, OSMO)

## DR — Dima Reputation

On-chain portable credentials represented as an **upgradable Soulbound NFT** on Safrochain.

- Accumulates from validated tasks across the platform
- Levels provide multipliers and exclusive campaign access
- Composite score uses task quality, sybil confidence, and consistency
- Mint or upgrade may require gas on Safrochain

## Reward models for projects

| Model | Description |
|-------|-------------|
| **DP model (recommended)** | Fast onboarding; project handles final token distribution |
| **IBC model** | Requires IBC to Safrochain; tokens in escrow contract |
| **Token factory** | Mint project token on Safrochain for branded distribution |

## Seasons, guilds, streaks

- **Seasons** — Time-boxed leaderboards with resets and featured campaigns
- **Guilds** — Team streaks, guild ladder, referral cuts on invitee points
- **Streaks** — Daily completion multipliers for consistent contributors

## Privacy

Emails and phone numbers are **never** exported to projects or included in REST verification payloads. Plans with `data_export` may export anonymized wallets and aggregate stats only.

Report data concerns via [Discussions](https://github.com/orgs/Dyma-IO/discussions) or the security contact in [Contributing](../developers/contributing).
