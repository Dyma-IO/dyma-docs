---
sidebar_position: 2
---

# Campaign lifecycle

A campaign moves through explicit steps. Its status is never edited directly: each move is an
action in Studio (or by Dyma in admin), checked by the API.

```
draft ──submit──► pending review ──approved──► scheduled ──start date──► active ──end date──► ended
  ▲                    │                           │  ▲                     │  ▲
  └── back to draft ◄──┘ (pause while in review)   │  └───── resume ───────┐│  │
                                                   └──────── pause ────────►paused
```

| Status | Earners see | Notes |
|---|---|---|
| Draft | nothing | you edit freely |
| Pending review | nothing | waiting for Dyma; pausing it sends it back to draft |
| Scheduled | **Upcoming** | approved, starts at its start date |
| Active | **Live** | quests can be completed |
| Paused | **Paused** | completions refused; dates keep running |
| Ended | **Ended**, then **Distributing** / **Distributed** | terminal: duplicate the campaign to run it again |

## Submitting for review

**Submit** sends the campaign to Dyma's review queue. It is refused until:

- the project is live,
- at least one quest is **live** (the wizard creates quests as drafts: publish them),
- the reward token is not declined, and the end date (if any) is in the future,
- in **automatic** mode: both dates are set, the campaign has a Wallet Connect quest on the
  escrow's network, and the escrow is **funded** (see [Funding the escrow](./funding-step-by-step)).

Approval also requires an approved reward token. Plans with **campaign approval bypass** (Pro and
above by default), or a platform where Dyma turned on automatic campaign approval, skip the queue:
the campaign is scheduled or activated immediately. Rejections come back with a note.

## Running

A job runs every minute: it activates scheduled campaigns at their start date (only while the
project is live) and ends campaigns at their end date, paused ones included. Participants get an
"ending soon" notice 24 hours before the end.

| Action | Allowed from | Effect |
|---|---|---|
| Pause | scheduled, active | completions refused; a pause by Dyma can only be lifted by Dyma |
| Resume | paused | back to scheduled or active according to the dates, or ended if the end date passed |
| End now | scheduled, active, paused | ends immediately (terminal). Refused for a funded automatic campaign: its end date is fixed on chain |
| Duplicate | any | a new draft with draft copies of the quests (unlock rules re-pointed) |
| Delete | any status except active and paused | soft delete; also refused while a funded escrow is not completed |

## What you can edit

- Before it starts: everything. Explicitly clearing a field (description, dates, cover, eligibility,
  token, pool) is allowed.
- Once started: the start date is fixed.
- Once an automatic campaign's escrow is funded: dates, reward token and pool are fixed (they are
  bound by the on-chain escrow).
- Once ended: nothing. Quests in an ended campaign can only be archived.

Dates: an **automatic** campaign needs a start and an end date. A **manual** campaign can be
open-ended; its points stop counting when you end it.

## Quests

| Quest status | Meaning |
|---|---|
| Draft | invisible to earners |
| Live | can be completed (the configuration is validated when it goes live) |
| Paused | visible, not completable |
| Archived | final; kept for history |

Deleting a quest that already credited earners archives it instead, so nobody loses points. Quests
are shown in the order you set (drag to reorder in the wizard).

In a campaign paid by an escrow, the last Wallet Connect quest on the escrow's network cannot be
deleted, archived or moved to another chain: it is how earners register the wallet they claim with.

## Eligibility

The **Eligibility** step sets who may take part, checked on every completion:

| Rule | Example |
|---|---|
| Verified e-mail required | yes / no |
| Minimum account age | 7 days |
| Linked accounts required | X, Discord, Telegram, GitHub, YouTube |
| Allowlist | wallet addresses, e-mails, public ids or usernames |

Earners see the rules (never the allowlist itself) and whether they qualify.

## After the end

Points stop at the end; reviews still pending can be decided during the **review grace** (24 hours
by default). Then the reward split is computed and paid: by you
([Manual payouts](./manual-payouts)) or through the escrow, where earners claim their shares during
the claim window and you withdraw what was not claimed afterwards
([Automatic distribution](./automatic-escrow)).
