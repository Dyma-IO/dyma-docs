---
sidebar_position: 2
---

# Daily, repeatable and lucky-draw quests

On a campaign page, quests are grouped by how often you can do them: **Daily**, **Repeatable**
and **One-time**. The label on each quest ("Daily", "Every 4h", "Every week", "Repeatable",
"One-time") comes from the server, so every app shows the same rule.

## Daily check-in

A daily check-in quest is one tap a day.

- One check-in per **UTC day**. The day resets at 00:00 UTC; the quest shows when the next one opens.
- Points and XP are credited on the spot.
- Tapping twice (or from two devices at once) credits exactly once.
- Your **streak** counts consecutive UTC days with a check-in, ending today (or yesterday, if you
  have not checked in yet today, so the streak survives until the day ends). The last seven days and
  your longest streak are shown next to it.
- The project may cap the number of check-ins per earner or in total.

## Repeatable quests

A project can let a quest be completed more than once:

| Rule | Behaviour |
|---|---|
| Interval (e.g. every hour, day, week, 30 days, or a custom number of hours) | you can do it again once the interval has passed since your **last verified** completion |
| Unlimited | no waiting time |
| Max per earner | optional cap on your completions |
| Max total | optional cap on completions across all earners; once reached the quest shows **Full** |

Only verified completions count: a failed attempt or one still in review never locks you out.
Each verified completion credits the quest's points again.

## Lucky draw

A lucky-draw quest is a single spin of a wheel.

- **One draw per earner.** The result is drawn on Dyma's server (a random roll from 1 to 100 that
  wins when it is at or below the quest's win chance), never in your browser.
- A win credits the quest's points (and shows the prize label the project chose, such as
  "Mystery box"). A loss is final for that quest and is shown as **Played**; it sends no
  "rejected" notification.
- When the project limits the number of winners, the wheel shows how many prizes are left. Once
  every prize is won the draw closes, and you keep your attempt.
- The campaign page replays your result if you come back.

## One-time quests

Everything else can be completed once. If an attempt is rejected (the reason is shown), you can
submit again.
