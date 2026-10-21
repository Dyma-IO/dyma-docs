---
sidebar_position: 5
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
| X (Twitter) | Follow, like, retweet, reply, hashtag, quote, mention, bio, pinned post, X Spaces (join, speak, host) | Platform API (paid API tier) / hybrid |
| On-chain | Swap, stake, transfer, … | API reads the chain's REST endpoints |
| Email | Verified email link | Platform API |
| Referral | Invite friends | Platform API |

## Verification methods

| Method | ID | Used for |
|--------|-----|----------|
| On-chain | `on_chain` | Cosmos / IBC transactions, read by the API from chain REST endpoints |
| Platform API | `platform_api` | OAuth social integrations |
| Project REST API | `project_rest` | Custom project logic |
| Manual review | `manual` | Links, content, moderators |
| Hybrid | `hybrid` | Auto first, manual fallback |
| AI verify | `ai_verify` | review queue; Dyma AI review (Claude) decides first on paid plans |
| Hybrid + AI | `hybrid_ai` | review queue; Dyma AI review (Claude) decides first on paid plans |

## Full catalog

### Social — X / Twitter

| ID | Name | Auto? |
|----|------|-------|
| `social_twitter_follow` | Twitter Follow | Yes |
| `social_twitter_like` | Twitter Like | Semi |
| `social_twitter_retweet` | Twitter Retweet | Semi |
| `social_twitter_comment` | Twitter Comment | Semi |
| `social_twitter_thread` | Twitter Thread | No (review) |
| `social_twitter_hashtag` | Twitter Hashtag Post | Semi |
| `social_twitter_meme` | Twitter Meme / Creative Post | No (review) |
| `social_twitter_hashtag_ai` | Twitter Hashtag + AI Verify | No (review) |
| `social_twitter_quote` | Twitter Quote Post | Semi (hybrid) |
| `social_twitter_mention` | Twitter Mention | Semi (hybrid) |
| `social_twitter_bio` | Twitter Bio / Display Name | Yes |
| `social_twitter_pin` | Twitter Pinned Post | Yes |
| `social_twitter_space_attend` | Join an X Space | Yes (live code) |
| `social_twitter_space_speak` | Speak in an X Space | Semi (hybrid) |
| `social_twitter_space_host` | Host an X Space | Semi (hybrid) |

#### How the X checks work

Every X quest runs through the dedicated X runner (`POST /v1/quests/:id/twitter/verify`): the earner links X once (scopes
`tweet.read users.read like.read follows.read offline.access`, no other scope is ever requested) and Dyma reads the X API
when they verify. Points are credited the moment a `platform_api` check passes; `hybrid` quests fall back to a reviewer
after three negative checks or at once when X itself fails (outage, rate limit, or a feature the X API plan lacks).

| Quest | What Dyma reads | Passes when | Method |
|-------|-----------------|-------------|--------|
| Quote | the earner's posts since the campaign started (reposts skipped, at most 2 pages of 100) | a post quotes the target (`referenced_tweets` type `quoted`) | hybrid |
| Mention | the earner's original posts since the campaign started (replies and reposts skipped) | a post mentions the account (`entities.mentions`), with the optional text and hashtags | hybrid |
| Bio / display name | `GET /2/users/me` with `description` | the display name and/or bio contains the text (case-insensitive) | platform API |
| Pinned post | `GET /2/users/me` with the `pinned_tweet_id` expansion | the pinned post is the target post or **quotes** it (X only lets people pin their own posts), or carries every required hashtag | platform API |
| Join an X Space | the Space (`GET /2/spaces/:id`, app bearer token) | the code the host says live matches (trimmed, case-insensitive) while the Space is live or within the grace after it ends | platform API |
| Speak in an X Space | the Space's `speaker_ids` / `host_ids` (app bearer token) | the earner's linked X id is on stage; retry while the Space is live | hybrid |
| Host an X Space | the Space the earner submits (`creator_id`, `host_ids`, `title`, `started_at`, optional `participant_count`) | they created or co-hosted it, the title contains every keyword, it started inside the campaign window and had enough listeners | hybrid |

**X Spaces and the API plan.** X does not expose who listens to a Space, so "Join an X Space" is proven by a code the
host says live. Spaces lookups use the app-only bearer token (Admin → Integrations → X), because user-context Spaces reads
need the `space.read` scope Dyma does not request. When the token is missing or the X API plan refuses Spaces lookups
(403 `client-not-enrolled` and similar), the earner sees "Reading X Spaces is not available on Dyma's current X API plan":
hybrid quests go to manual review, and the join quest falls back to the window the project set on the quest (start, end
and grace). `participant_count` is not returned on every plan; a host quest with a minimum listener count then goes to
review instead of failing. Wrong Space codes are rate-limited like the secret-code quest (10 per 15 minutes per earner).

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

Bot needs **View Channels** and **Read Message History**. Reinstall the bot if an older install only had View Channels. A `requireSubstring` check also needs the privileged **Message Content intent** on Dyma's Discord application (see [Integrations and credentials](./integrations#discord)); without it Studio disables the option.

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
4. `POST /v1/quests/:questId/telegram/verify` → credited at once when the check passes

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
| `content_media_upload_ai` | Media Upload + AI Verify | No (review) |
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

Passing credits the quest at once. A failed attempt returns which answers were right or wrong (the corrections only after a pass, when explanations are on); attempts are limited (`maxAttempts`, default 3, `retryCooldownMinutes`, default 1). Admin catalog: enable/logo for `learn_quiz` under Integrations / Task Types (no credentials panel).

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
3. `POST /v1/quests/:questId/email-link/verify`: body `{ code }` or `{ useLinkedEmail: true }`; upserts `UserEmail` and credits the quest

Verification does not stub-auto-pass for this type: a verified profile email matching domain rules is required. On-chain email attestation is deferred; OTP is the v1 path (same crypto and TTL rules as profile email link).

### Engagement

| ID | Name | Auto? |
|----|------|-------|
| `engagement_daily_checkin` | Daily Check-in | Yes |
| `engagement_secret_code` | Secret Code | Yes |
| `engagement_lucky_draw` | Lucky Draw | Yes |
| `engagement_app_install` | Mobile App Install | No |
| `engagement_app_install_ai` | App Install + AI Verify | No (review) |

#### Daily Check-in (`engagement_daily_checkin`)

No Studio verification JSON or custom inputs. Earners open the quest once per UTC day and tap Check in.

1. `GET /v1/quests/:questId/daily-checkin/status`: whether the user can check in today, streak, next availability
2. `POST /v1/quests/:questId/daily-checkin/check-in`: credits the quest for the current UTC day at once (409 `QUEST_COOLDOWN` if already checked in)

### On-chain (Cosmos / IBC)

Verified by the API, which reads each chain's REST endpoints (with fallbacks) and matches the earner's transaction; a transaction that is not indexed yet is re-checked. `chain_lp_hold` is disabled (it needs balance sampling over time).

| ID | Name |
|----|------|
| `chain_transfer` | Token Transfer |
| `chain_swap` | DEX Swap |
| `chain_lp_add` | Add Liquidity |
| `chain_lp_hold` | Hold LP Position (disabled) |
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
