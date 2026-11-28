---
description: How Dyma UTXO's operators run Dyma Jobs, its settings, negotiated rates, the job escrow, suspensions and disputes.
---

# Running Dyma Jobs

Dyma Jobs is paid work that projects post outside their campaigns (see [Jobs](../earners/jobs) for
earners). It is on by default on Dyma UTXO. Operators run it from Admin, with the `platform:manage`
permission; disputes are also open to `moderation:global`.

## Settings

**Admin → Settings → Jobs** holds every setting. Changes apply to jobs published from then on; a
published job keeps the terms it was published with.

| Setting | Default | Range | What it does |
|---|---|---|---|
| Jobs on | on | | Off stops new work only: the board, applications, drafts, publishing, invitations and hiring. Work under way keeps going (deliveries, reviews, claims, payouts, disputes). |
| Default fee | 5% | 0–10% | Dyma's commission per task or per period, never per revision. 10% is the job escrow's cap. |
| The project pays the fee on top | on | | On: the worker gets the advertised reward and the project pays the reward plus the fee. Off: the fee comes out of the reward. |
| Assets | ADA, USDM, USDCx | | The assets a job may pay in, matched by exact unit. No other token is ever accepted. |
| Minimum reward | 10 ADA, 5 USDM, 5 USDCx | | Per task or per period. |
| Dyma Points per task, per period | 100, 40 | 0–1,000,000 | Granted when the project approves a task or a period. |
| Reputation per task, per period | 10, 4 | 0–100,000 | Granted with the points. |
| Review deadline | 7 days | 1–90 | After a delivery, before the worker may report a review that never came. |
| Payment deadline | 7 days | 1–90 | Direct jobs: after approval, before the worker may report a missing payment. |
| Dispute window | 7 days | 1–90 | How long a worker may contest a rejection, an ending, or a late review or payment. |
| Escrow claim margin | 60 days | 7–3,650 | Added to the last deadline an escrow funds: until then the project cannot reclaim the escrow without Dyma. |
| Open jobs per project | 50 | 1–10,000 | Published and not yet closed. |
| Applications per job | 200 | 1–100,000 | A public job stops taking applications at this count. |
| Applications per person per day | 20 | 1–1,000 | Across every job, per UTC day. |

On Dyma (Cosmos) jobs stay off and cannot be turned on: there is no Cosmos job escrow or fee rail.

## Negotiated rates

**Settings → Jobs → Negotiated rates** gives a project its own fee instead of the default: its slug or
id, the rate (0–10%) and a note saying what was agreed. The rate applies to the jobs the project
publishes from then on; **Back to the default** removes it. Studio shows the project its rate. Every
change is in the audit log.

## The job escrow

Escrow jobs lock their reward and Dyma's fee in the job escrow, a contract of its own, separate from
the campaign escrow (see [Smart contracts](../contracts/overview#job-escrow) and
[Deployments](../contracts/deployments#preprod-job-escrow)).

1. **The attester key.** Dyma signs every job funding ticket and every approval (assignment,
   release, withdrawal) with the `jobs_attester` credential, a raw Ed25519 key distinct from the
   campaign ticket key. In **Admin → Escrow → Cardano → Job escrow**, a super admin stores or
   rotates it, and **Test** shows its public key. In production,
   `ops/prod-set-credentials.sh --edition utxo jobs` stores it from the secrets folder.
2. **Deploy** with the contracts repository's `scripts/deploy/deploy-jobs.mjs`: the configuration
   names the governance keys, the attester's public key, the treasury that receives Dyma's fees and
   the fee cap. The record `deployments/<network>.jobs.json` is committed to the repository.
3. **Register** it: **Job escrow → Register deployment**, pick the network and paste or upload the
   record. It becomes the network's active job escrow; one it replaces stays listed, inactive, and
   its jobs keep working.

The panel then reads the active deployment on chain on every load: whether its attester is Dyma's key,
the treasury, the fee cap, whether governance paused it, and how many jobs it holds. A paused job
escrow refuses fundings, assignments, releases and withdrawals; owners can still reclaim after
expiry.

Without a job escrow on a network, projects there can still post **direct** jobs: they pay workers
themselves and pay Dyma's fee in advance.

Dyma's operator wallet pays the network fee and collateral of every worker's claim and every
assignment, within the daily budget of sponsored claims (**Escrow → Cardano → Sponsored claims**).

## Jobs and disputes

**Admin → Jobs** lists every job, with filters (status, funding, suspension, open disputes) and the
next step each one waits for. A job's page shows its work round by round with the project's reviews,
the payouts, the escrow (pool, claimable, reserved, withdrawable, expiry), direct fees and credits,
the activity and the audit trail. From there an operator can:

- **Suspend** a job, with a reason sent to the project: it leaves the board and nothing moves until
  the suspension is lifted.
- **Cancel** it as Dyma, with a reason: the work ends and applicants are told. Approved work keeps its
  pay; funds no approved work needs go back to the project.

**Admin → Jobs → Disputes** is the queue of disputes workers opened. Notices to the operators' inbox
link each new one. Open one, read the worker's reason and the job, and **Resolve**:

| Decision | Effect |
|---|---|
| Release to the worker | The task or period is approved, for its whole reward or the part you enter. Escrow: the worker can claim it. Direct: the project owes the payment. On a direct job, the fee prepaid on a part not released becomes a credit of the project. |
| Return to the project | The task or period closes unpaid. Escrow: its funds become withdrawable by the project. Direct: its prepaid fee becomes a credit of the project. |

The decision note is required; the project and the worker both read it. While a dispute is open, the
funds it covers cannot be withdrawn.
