---
description: Paid work that projects post outside their campaigns, one-off tasks and recurring opportunities, paid in ADA, USDM or USDCx.
---

# Jobs

Besides campaigns, projects on Dyma UTXO post **jobs**: paid work for one person, with a fixed reward.
Find them under **Jobs** in the app's menu.

| | Task | Opportunity |
|---|---|---|
| What it is | one piece of work, delivered once | the same work every period, for one person |
| Pay | the reward, once | the reward every week, two weeks, month or N days |
| Example | translate a guide, fix a bug, design a banner | moderate a community, publish a weekly video |

A job pays in **ADA, USDM or USDCx** only. The reward shown is what you receive: the project pays
Dyma's fee on top of it.

Each approved task or period also earns you **Dyma Points and reputation**, shown on the job page under
**Also earn**.

## Find a job

The **Jobs board** lists public jobs. Search them, filter them by kind (tasks or opportunities),
asset and skills, keep only jobs funded on Cardano or show assigned ones too, and sort them by newest
or highest reward.

- **Funded on Cardano**: the project locked the reward and Dyma's fee in the job escrow before
  publishing. Your pay waits for you on chain.
- **Paid by the project**: the project pays you directly once your work is approved, and has paid
  Dyma's fee for it in advance.
- **Assigned**: someone was hired. Who it is never shows.

The job page has the description, the proofs the project expects, the schedule and the pay.

## Apply

1. Open a job and choose **Apply now**.
2. Say why you fit, with links to your work, and attach files if they help.
3. Choose **Send application**.

You can withdraw an application, and apply again later, until the project hires. The project picks
one person per job; you are told when you are shortlisted, hired or not selected.

To be hired you need a **Cardano payout wallet**: a wallet linked to your account whose payment address
you proved ([Your payout address](./wallets#your-payout-address)). The job page says when yours is
missing.

**Private jobs** are never listed. A project invites one person directly; the invitation shows under
**My jobs → Invitations**, where you accept or decline it.

## Do the work

Your jobs are under **My jobs**:

| Tab | What is there |
|---|---|
| Applications | your applications and where they stand |
| Invitations | private jobs a project invited you to |
| Work | the jobs you were hired for, each task or period with its deadline |
| Payouts | every approved task or period and its pay |

Start when the task or period says so. **Do not start yet** means the project has not covered it: the
escrow is short, or the project has not paid Dyma's fee for it. It starts as soon as the project pays.

### Deliver

On the work page, choose **Deliver** and send what the job asks for:

- a written **report**: what you did and how (Markdown);
- **links** to the published work;
- **code links**: commits, pull requests or repositories;
- **files and images**.

A late delivery is still accepted, and marked late.

### Reviews

The project reviews every delivery itself; nothing is checked automatically. Its answer is one of:

- **Approved**: the task or period is done, and its pay is yours.
- **Changes requested**: the project lists what to fix, one point each. Fix them and choose
  **Resubmit**, saying what you changed for each point. Earlier rounds stay visible.
- **Rejected**: with the reasons. The work stays unpaid, unless you contest it.

A project may cap the number of rounds; past it, it approves or rejects.

## Get paid

| Funding | How the pay reaches you |
|---|---|
| Escrow (Funded on Cardano) | In **Payouts**, choose **Claim**. Your payout wallet signs the claim and Dyma UTXO pays the network fee. |
| Direct (Paid by the project) | The project sends the pay to your payout address and records the transaction, which Dyma UTXO checks on chain. Confirm with **I received it**. |

Claim escrow pay soon after approval. The escrow has an expiry, by default 60 days after the last
deadline it funds; after it, the project can take back everything left in the escrow without Dyma,
unclaimed pay included.

When a direct payment does not come, **Report not paid** opens a dispute once the payment deadline
has passed (7 days after approval by default).

## Disputes

You can contest, within the dispute window (7 days by default):

- a **rejection** you disagree with;
- a job **ended** while your delivery was still waiting for review;
- a delivery the project **never reviewed** (7 days after you delivered, by default);
- a direct **payment that did not come**.

Say what happened and why. Dyma decides, with a note you and the project both read: it can release
all or part of the reward to you, or return it to the project. While a dispute is open, the project
cannot withdraw the funds it covers.

## Leaving a job

You can leave a job you were hired for, with a reason the project reads. Work already approved stays
yours.
