---
sidebar_position: 9
---

# Integrations: X, Discord, Telegram, YouTube, GitHub

Social quests are verified with the earner's **own linked account** and, for Discord, Telegram and
GitHub, a connection your project sets up once in **Project → Settings → Integrations**.

Each quest has a verification mode:

| Mode | Behaviour |
|---|---|
| Automatic (platform API) | checked against the platform; a provider outage is shown as "check unavailable", never as a rejection |
| Hybrid | automatic first; after a provider error, or 3 failed checks, the earner can **request a manual review** with a note and screenshots, which lands in your review queue |
| Manual | always reviewed by your moderators, even when a check would pass |

Anti-abuse rules apply to every provider: one social account completes a quest for one Dyma account
only, and checks only trust what Dyma recorded on its servers.

## X (Twitter)

- **Earners** link X once (OAuth 2.0; the consent screen asks for read access to posts, likes and
  follows).
- **Quests**: follow, like, repost, comment, hashtag post. Posts must be published after the quest
  (or campaign) started; long posts and hashtags in any script are supported; a post can complete
  the quest for one account only.
- Thread and meme quests are **reviewed by moderators** (automatic checks for them need X's search
  tier).
- Checks run on Dyma's X application. If X refuses because of the application's API tier or usage
  cap, earners see "check unavailable" (hybrid quests offer a review) — their tokens are never wiped.

## Discord

1. **Connect your server**: in Integrations → Discord, add the **Dyma bot** to your server. Discord
   asks you to pick the server; Dyma binds it only from Discord's own answer, and the person
   installing must still be a project admin.
2. The bot needs **View Channels** and **Read Message History** (it is installed with exactly these
   permissions). Reinstall it if an older install only had View Channels.
3. **Quests**: join the server, hold a role, post a message in a channel (optionally containing a
   given text). Earners link their Discord account; members still in membership screening do not
   count yet.

:::info Message Content intent
"Message must contain …" checks need Discord's privileged **Message Content intent** on Dyma's
Discord application (Developer Portal → Bot → Privileged Gateway Intents → Message Content Intent).
Dyma detects it automatically. When it is off, Studio disables the "message must contain" field and
explains why, and existing quests of that kind answer with a configuration error instead of a
wrong verdict. Operators: see [Integrations credentials](../platform/integrations#discord).
:::

## Telegram

1. Create a bot with **@BotFather** and paste its token in Integrations → Telegram. Dyma stores it
   encrypted; **Test bot** checks it and **Register webhook** points Telegram at Dyma.
2. For **Join** quests, make your bot an **admin** of each group or channel. The quest editor's
   preview tests the bot on the quest's chat before you publish.
3. **Bot start** quests deep-link earners to your bot with a per-earner payload.
4. Earners link Telegram once through the **Dyma bot** (the quest shows the link). Restricted
   members who are in the chat count as joined.

## YouTube

- **Earners** link YouTube (Google OAuth) for subscribe and like checks, which read their own
  account through the YouTube Data API.
- **Visit** quests (watch a video, visit a channel) count the visit and enforce the waiting time
  on the server.
- Comment quests can be checked automatically or reviewed, depending on the mode you choose.
- Dyma's YouTube API quota is shared; when it is exhausted, checks report "check unavailable".

## GitHub

1. In Integrations → GitHub, add the repositories your quests use. Public repositories need nothing
   else.
2. For a **private** repository, choose **Authorize private access**: a GitHub OAuth grant with the
   `repo` scope, stored encrypted and kept only while a private repository is linked
   (disconnecting revokes it).
3. **Quests**: star, fork, commit, pull request (issues are reviewed). Earners link GitHub with the
   `read:user` scope only.

## Your own API

For anything else, point a quest at your own HTTPS endpoint, signed by Dyma: see
[Project REST verification](./rest-verification) (Growth plan and above).
