---
description: Post paid work outside your campaigns in Studio, hire one person, review deliveries and pay in ADA, USDM or USDCx, through the job escrow or directly.
---

# Jobs

A **job** is paid work your project posts outside its campaigns: one person, a fixed reward, and a
review by your team. Jobs are under **Jobs** in Studio's project menu. Earners find public jobs on the
app's Jobs board (see [Jobs](../earners/jobs) from their side).

| | Task | Opportunity |
|---|---|---|
| What it is | one delivery, paid once | the same work every period, for one person |
| Pay | the reward, once | the reward every week, two weeks, month or N days |
| Schedule | a fixed deadline, or a number of days after you hire | a start (when you hire, or a date) and a number of periods (empty: open-ended) |

## Fees

Dyma charges a fee **per task or per period**, never per round of changes: 5% by default, or the rate
your project negotiated with Dyma. You pay it **on top of the reward**, so the worker receives the
reward you advertise. The editor shows the fee and what you pay before you publish.

## Post a job

1. **Jobs → New job**, then choose a task or an opportunity.
2. Fill in:
   - the **title** and a one- or two-sentence **summary**, shown on the board card;
   - the **description**: the brief, in Markdown, with a live preview;
   - up to 8 **skills**, which earners filter the board by;
   - what the worker must **deliver**: a written report, links, code links (commits, pull requests,
     repositories), files, images;
   - the **reward** and its **asset**: ADA, USDM or USDCx;
   - the **funding** (below);
   - the **schedule**;
   - **public** (listed on the board, earners apply) or **private** (you invite one person by
     username or Cardano address);
   - optionally a **minimum reputation** tier, a cap on **rounds of changes**, and a date when
     **applications close**.
3. **Save draft**: nobody sees a draft until you publish it.
4. **Publish**: public jobs go on the board, and private ones send their invitation.

Once published, the text can still change; the reward, asset and funding are fixed.

### Funding: escrow or direct

| | Escrow on Cardano | Pay directly |
|---|---|---|
| When you publish | your wallet locks the reward and Dyma's fee in the job escrow (**Fund and publish**), plus a refundable ADA deposit Cardano requires | the job opens at once |
| The board shows | **Funded on Cardano**, once the funding confirms | no escrow badge |
| Dyma's fee | taken from the escrow at each payment | paid in advance: when you hire for a task, before each period for an opportunity |
| Paying the worker | the worker claims each approved task or period from the escrow; Dyma pays the network fee | you send the pay and record the transaction, which Dyma checks on chain |

For an opportunity in escrow, choose how many **periods to lock now** (at least one) and **top up**
later. When the escrow is short of the next period, that period waits ("awaiting funds") and the worker
is told not to start. With direct funding the same happens until you pay the period's fee. Fees you
prepaid for work that ends unapproved become a **fee credit**, used first for your next fee.

## Hire

**Applicants** lists the applications to a public job: each pitch with its links and files, and the
applicant's reputation tier, Dyma Points, completed jobs and verified accounts. You can:

- **Shortlist** an applicant, or **Decline** one, with a reason the applicant reads if you give one.
- **Hire** one person. A worker needs a Cardano payout wallet first; the applicant's card says when
  one is missing.
  - Escrow: **Hire and sign**. Your wallet signs the assignment and Dyma pays its network fee.
  - Direct: **Hire and pay the fee**, unless your fee credit covers it.

The job then shows **Assigned** on the board, never who took it, and the other applicants are told.
For a private job, the invitee accepts or declines; if they decline, invite someone else.

## Review the work

**Work** shows each task or period with its deliveries, round by round. For each delivery:

- **Approve**: the task or period is done. The worker earns its pay, Dyma Points and reputation.
- **Request changes**: list what to fix, one point each, with details if useful. The worker resubmits
  and earlier rounds stay visible. If you set a cap on rounds and it is reached, you approve or reject.
- **Reject**: give the reasons; the work stays unpaid. The worker can contest a rejection (below).

Review within the review deadline (7 days by default): after it, the worker may report a review that
never came.

For a direct job, approved work shows **To pay**. Send the worker's pay to their payout address, then
record the transaction hash; Dyma checks on chain that it pays what is owed. Pay within the payment
deadline (7 days by default).

## The escrow

**Overview** shows the escrow, read from the chain:

| Line | Meaning |
|---|---|
| In the pool | rewards and fees locked |
| Claimable | approved work the worker has not claimed yet |
| Reserved | work in progress, submitted or approved |
| Withdrawable | what no work needs: you can take it back with **Withdraw funds** |
| Deposit | the refundable ADA deposit, returned at the end |
| Expires | after this date you can **Reclaim everything** without Dyma |

**Top up the escrow** adds periods or an amount and pushes the expiry later. The expiry is the last
deadline the escrow funds plus a claim margin (60 days by default). Until then, Dyma cannot send the
funds anywhere but to the worker you hired, and only with the worker's signature. You cannot take
back approved pay before the expiry. If Dyma ever disappeared, the expiry would still let you
reclaim everything.

## End, withdraw or reopen

- **Withdraw the job** before anyone is hired: it leaves the board. An escrow job's funds come back
  with **Withdraw funds** on the Overview.
- **End the job** while someone works on it, with a reason the worker reads.
  - An opportunity can end now or after the current period.
  - Approved work keeps its pay.
- **Reopen to hire again**: an opportunity that ended can hire someone new.

## Disputes

A worker can contest within the dispute window (7 days by default):

- a rejection;
- a job you ended while their delivery waited for review;
- a review that never came;
- a direct payment that did not come.

Dyma decides in its console, with a note both sides read:

- **Release** all or part of the reward to the worker. In escrow they claim it; in direct you owe it.
- **Return** it to your project. In escrow its funds become withdrawable; in direct its prepaid fee
  becomes a credit.

While a dispute is open, the funds it covers cannot be withdrawn.
