---
sidebar_position: 4
---

# Task types

Dyma ships a **global task type catalog** managed in super admin. Projects pick types when creating quests in Studio. The canonical list lives in [`dyma-shared`](https://github.com/Dyma-IO/dyma-shared) as `TASK_TYPE_CATALOG`.

Catalog aligns with common quest-platform patterns (social, content, engagement, on-chain) while staying **Cosmos / IBC-first**. The following third-party builder types are **not** included: generic EVM contract builders, generic token/NFT holder apps, Substrate pallet tasks, faucets, partner-specific DEX integrations, and meta-platform tasks.

## Tier 1 integrations

Priority platforms for launch and marketing:

| Platform | Task types | Verification |
|----------|------------|--------------|
| Discord | Join, role | Platform API (free) |
| Telegram | Join, bot start | Platform API (free) |
| GitHub | Star, fork, commit | Platform API (free) |
| YouTube | Subscribe, like, visit channel, video submit | Platform API / manual |
| X (Twitter) | Follow, like, retweet, hashtag | Platform API (paid API tier) |
| On-chain | Swap, stake, transfer, … | `dyma-indexer` |
| Email | Verified email link | Platform API |
| Referral | Invite friends | Platform API |

## Verification methods

| Method | ID | Used for |
|--------|-----|----------|
| On-chain indexer | `on_chain` | Cosmos / IBC transactions |
| Platform API | `platform_api` | OAuth social integrations |
| Project REST API | `project_rest` | Custom project logic |
| Manual review | `manual` | Links, content, moderators |
| Hybrid | `hybrid` | Auto first, manual fallback |
| AI verify | `ai_verify` | Memes, screenshots, app install proof |
| Hybrid + AI | `hybrid_ai` | AI with manual fallback |

## Full catalog

### Social — X / Twitter

| ID | Name | Auto? |
|----|------|-------|
| `social_twitter_follow` | Twitter Follow | Yes |
| `social_twitter_like` | Twitter Like | Semi |
| `social_twitter_retweet` | Twitter Retweet | Semi |
| `social_twitter_comment` | Twitter Comment | No |
| `social_twitter_thread` | Twitter Thread | No |
| `social_twitter_hashtag` | Twitter Hashtag Post | Semi |
| `social_twitter_meme` | Twitter Meme / Creative Post | Semi (AI) |
| `social_twitter_hashtag_ai` | Twitter Hashtag + AI Verify | Semi (AI) |

### Social — Discord & Telegram

| ID | Name | Auto? |
|----|------|-------|
| `social_discord_join` | Discord Join | Yes |
| `social_discord_role` | Discord Role | Yes |
| `social_discord_message` | Discord Message | Yes |
| `social_telegram_join` | Telegram Join | Yes |
| `social_telegram_bot_start` | Telegram Bot Start | Yes |

### Discord Message

Auto-verified via the Dyma Discord bot. Studio config: `guildId` (from project Discord connection), `channelId` / `channelName`, optional `inviteUrl`, optional `requireSubstring`.

**Earner flow**

1. Link Discord (OAuth)
2. Post in the configured channel (optionally paste a message URL)
3. `POST /v1/quests/:questId/discord/verify` → bot scans recent messages for the linked Discord user

Bot needs **View Channels** and **Read Message History**. Reinstall the bot if an older install only had View Channels.

Studio dry-run: `POST /v1/quests/:questId/discord/preview/status|verify`.

### Telegram Join + Bot Start

Two separate quest types. Two bots with clear jobs:

| Bot | Where configured | Used for |
|-----|------------------|----------|
| **Dyma platform bot** | Admin → Integrations → Telegram | Earner account linking only |
| **Project bot** | Studio → Settings → Integrations → Telegram | Join verification + Bot Start deep links |

**Join** (`social_telegram_join`) Studio config: `chatId`, optional `inviteUrl` / `chatTitle`, `requireStatus`. Project bot must be an admin in that chat.

**Bot Start** (`social_telegram_bot_start`) Studio config: optional `customStartMessage`. Deep link opens the **project** bot. Start payload is server-generated per user.

**Earner flow**

1. `POST /v1/users/me/telegram/link-url` then open Dyma bot deep link (once)
2. `GET /v1/quests/:questId/telegram/status`
3. Open invite (Join) or **project** bot deep link (Bot Start)
4. `POST /v1/quests/:questId/telegram/verify` → claimable submission

**Studio**

- Connect project bot: `PUT /v1/projects/:id/telegram/bot` with `{ botToken }`
- Dry-run preview: `POST /v1/quests/:questId/telegram/preview/status|verify`

Webhooks: `POST /v1/telegram/webhook` (Dyma bot), `POST /v1/telegram/webhook/project/:projectId` (project bot).

### Social — Instagram

| ID | Name | Auto? |
|----|------|-------|
| `social_instagram_follow` | Instagram Follow | Semi |
| `social_instagram_view_post` | Instagram View Post | Semi |
| `social_instagram_visit_profile` | Instagram Visit Profile | No |

### Social — YouTube

| ID | Name | Auto? |
|----|------|-------|
| `social_youtube_subscribe` | YouTube Subscribe | Yes |
| `social_youtube_like` | YouTube Like | Semi |
| `social_youtube_comment` | YouTube Comment | No |
| `social_youtube_visit_channel` | YouTube Visit Channel | Semi |

### Social — Product Hunt, URL, Referral

| ID | Name | Auto? |
|----|------|-------|
| `social_producthunt_upvote` | Product Hunt Upvote | Semi |
| `social_producthunt_comment` | Product Hunt Comment | No |
| `social_producthunt_visit` | Product Hunt Visit | No |
| `engagement_url_visit` | Visit URL | Semi |
| `engagement_url_share` | Share URL | No |
| `social_referral` | Referral | Yes |

### Developer — GitHub

| ID | Name | Auto? |
|----|------|-------|
| `social_github_star` | GitHub Star | Yes |
| `social_github_fork` | GitHub Fork | Yes |
| `dev_github_pr` | GitHub Pull Request | Yes |
| `dev_github_issue` | GitHub Issue | No |
| `dev_github_commit` | GitHub Commit | Yes |
| `dev_deploy_contract` | Deploy Smart Contract | Yes |
| `dev_deploy_workload` | Deploy Workload | No |

### Content

| ID | Name | Auto? |
|----|------|-------|
| `content_blog_write` | Write Blog Post | No |
| `content_blog_comment` | Comment on Blog | No |
| `content_media_upload` | Media / Screenshot Upload | No |
| `content_media_upload_ai` | Media Upload + AI Verify | Semi (AI) |
| `dev_tutorial_submit` | Tutorial / Article | No |
| `dev_video_submit` | Video Submission (YouTube, Loom, …) | No |
| `content_kickstarter_support` | Kickstarter Support | No |

### Learn & forms

| ID | Name | Auto? |
|----|------|-------|
| `learn_quiz` | Quiz / Assessment | Yes |
| `learn_course_complete` | Course Completion | Semi |
| `custom_form` | Form / Survey | No |

### Quiz / Assessment (`learn_quiz`)

Studio authors build in-app questions (single or multi correct options), a pass score (%), and optional shuffle / explanations. Correct answers stay in `verificationConfig` server-side only.

**Earner APIs**

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/v1/quests/:questId/quiz` | Public questions (answers stripped) |
| `GET` | `/v1/quests/:questId/quiz/status` | Auth; prior submission state |
| `POST` | `/v1/quests/:questId/quiz/submit` | Auth; body `{ answers: { [questionId]: optionId[] } }` |

Passing creates a claimable submission. Failing returns the score without awarding. Admin catalog: enable/logo for `learn_quiz` under Integrations / Task Types (no credentials panel).

### Identity

| ID | Name | Auto? |
|----|------|-------|
| `identity_wallet_link` | Wallet Connect | Yes |
| `email_link` | Verified Email | Yes |
| `attestation_sign` | Signed Message | Yes |
| `engagement_terms_accept` | Terms & Conditions | Yes |

### Verified Email (`email_link`)

Earners prove ownership of an email with a quest-scoped OTP. Studio configures optional domain allowlists, whether to reuse an already-linked profile email, and optional mail intro copy.

**Earner flow**

1. `GET /v1/quests/:questId/email-link/status`: linked email, domain match, `canSkipOtp`
2. `POST /v1/quests/:questId/email-link/send-otp`: body `{ email }`; sends `quest.email_link_otp` with project and quest context
3. `POST /v1/quests/:questId/email-link/verify`: body `{ code }` or `{ useLinkedEmail: true }`; upserts `UserEmail` and marks the submission claimable

Verification does not stub-auto-pass for this type: a verified profile email matching domain rules is required. On-chain email attestation is deferred; OTP is the v1 path (same crypto and TTL rules as profile email link).

### Engagement

| ID | Name | Auto? |
|----|------|-------|
| `engagement_daily_checkin` | Daily Check-in | Yes |
| `engagement_secret_code` | Secret Code | Yes |
| `engagement_lucky_draw` | Lucky Draw | Yes |
| `engagement_app_install` | Mobile App Install | No |
| `engagement_app_install_ai` | App Install + AI Verify | Semi (AI) |

#### Daily Check-in (`engagement_daily_checkin`)

No Studio verification JSON or custom inputs. Earners open the quest once per UTC day and tap Check in.

1. `GET /v1/quests/:questId/daily-checkin/status`: whether the user can check in today, streak, next availability
2. `POST /v1/quests/:questId/daily-checkin/check-in`: creates a claimable submission for the current UTC day (rejects if already checked in)

### On-chain (Cosmos / IBC)

Verified by [`dyma-indexer`](https://github.com/Dyma-IO/dyma-indexer) — equivalent to subgraph-style indexing for the interchain.

| ID | Name |
|----|------|
| `chain_transfer` | Token Transfer |
| `chain_swap` | DEX Swap |
| `chain_lp_add` | Add Liquidity |
| `chain_lp_hold` | Hold LP Position |
| `chain_stake` | Stake / Delegate |
| `chain_unstake` | Unstake / Redelegate |
| `chain_vote` | Governance Vote |
| `chain_proposal_submit` | Submit Proposal |
| `chain_nft_mint` | NFT Mint |
| `chain_contract_interact` | Contract Interaction |
| `chain_blob_post` | Data Availability Blob |
| `chain_bridge` | Cross-chain Bridge |
| `chain_wallet_connect` | Wallet Connect Proof |

### Custom

| ID | Name |
|----|------|
| `custom_rest` | Custom (Project REST API) |
| `custom_manual` | Custom (Manual) |

## Quest categories

Filters in the client and Studio map to these slugs:

`on-chain` · `staking` · `governance` · `developer` · `learn` · `social` · `content` · `identity` · `engagement` · `custom`

## Admin

Super admin can enable or disable any task type platform-wide at **admin.dyma.io → Task Types**. Disabled types are hidden from Studio but existing quests remain until archived.

See also [Verification](./verification) and [Content model](./content-model).
