---
description: Where Dyma UTXO's escrow and reputation badges are deployed, with the values of the preprod deployment records.
---

# Deployments

:::info Preprod only, mainnet next
The escrow, the reputation badges and the job escrow are **deployed on Cardano's preprod test
network** (October 2026). They are **not deployed on mainnet yet**: until they are, campaigns on
mainnet use manual distribution only, badge claims stay closed there, and jobs on mainnet are paid
directly by projects.
:::

| Contract | Network | Status | Record |
|---|---|---|---|
| Escrow 0.1.0 | Preprod | deployed, verified against the chain | [`deployments/preprod.json`](https://github.com/Dyma-IO/dyma-contracts-cardano/blob/main/deployments/preprod.json) |
| Reputation badges 0.1.0 | Preprod | deployed | [`deployments/preprod.reputation.json`](https://github.com/Dyma-IO/dyma-contracts-cardano/blob/main/deployments/preprod.reputation.json) |
| Job escrow 0.1.0 | Preprod | deployed | [`deployments/preprod.jobs.json`](https://github.com/Dyma-IO/dyma-contracts-cardano/blob/main/deployments/preprod.jobs.json) |
| Escrow | Mainnet | not deployed yet | `deployments/mainnet.json` once deployed |
| Reputation badges | Mainnet | not deployed yet | `deployments/mainnet.reputation.json` once deployed |
| Job escrow | Mainnet | not deployed yet | `deployments/mainnet.jobs.json` once deployed |

Each record is written by the repository's deployment script after every confirmed step, committed,
and read back from the chain before Dyma UTXO uses it. The values below are those of the records in
[Dyma-IO/dyma-contracts-cardano](https://github.com/Dyma-IO/dyma-contracts-cardano).

## Preprod escrow

| Item | Value |
|---|---|
| Built from | commit `6f56695f0e981756bd1358d19a5624a00da037a5`, Aiken `v1.1.24+bacbeb3` |
| Seed (parameterises the registry) | `3d8344eff37c297060d634b47132fb94588976dd7c05077b7db6b78c975a21a7#0` |
| Registry policy id | [`097c165513145549ec3d36549c6b2c0f46ecf19d4c726d10eefa0a97`](https://preprod.cardanoscan.io/tokenPolicy/097c165513145549ec3d36549c6b2c0f46ecf19d4c726d10eefa0a97) |
| Registry address | `addr_test1wqyhc9j4zv292j0v85m9f8rt9s85dm83n4x8ymgsamaq49cmyrhrh` |
| Registry UTxO at deployment | [`b81cfc28…#0`](https://preprod.cardanoscan.io/transaction/b81cfc28f7c9ac8407955e94c3fe19563fb247b6fa473b6791b1d9a5b9aa2611) |
| Escrow version for new campaigns | policy `27d9f6b54b546f3d3445675e5c8f2fd1a89f7c07d7608f658a635c26`, state `2cca21c453a87cb4bfa256ee47f254c23118d021dfede459470aa06f`, shard `05d153f53b3bfb2db4c0874c66b73ca3c9f9d07ebdc74d427bcf8e1b` |
| Reward accounts of `campaign_payout` and `campaign_admin` | registered in [`cbd1f141…`](https://preprod.cardanoscan.io/transaction/cbd1f141d6125517fc79a5193534a8076d6cf253a8f041d3f03009359a1d4115) |

### Scripts

Each script is stored once as a reference script, in an output at the registry address.

| Script | Hash | Size (bytes) | Reference script UTxO | Address or reward account |
|---|---|---:|---|---|
| `registry` | `097c165513145549ec3d36549c6b2c0f46ecf19d4c726d10eefa0a97` | 5,991 | [`46837145…#0`](https://preprod.cardanoscan.io/transaction/468371457df5c0db1eeee83f808fb9788287f33e77410e594df88600b922c2c1) | `addr_test1wqyhc9j4zv292j0v85m9f8rt9s85dm83n4x8ymgsamaq49cmyrhrh` |
| `campaign_policy` | `27d9f6b54b546f3d3445675e5c8f2fd1a89f7c07d7608f658a635c26` | 5,586 | [`1793c60e…#0`](https://preprod.cardanoscan.io/transaction/1793c60ea65d91da711981cea3c4b821baf62940f5465042f7db400c15c4ac8e) | — |
| `campaign_state` | `2cca21c453a87cb4bfa256ee47f254c23118d021dfede459470aa06f` | 14,734 | [`873b101b…#0`](https://preprod.cardanoscan.io/transaction/873b101bcafcc8b5bf06a8e8fcf38d7fdebae47aa548e035d8b95cefb938d048) | `addr_test1wqkv5gwy2w58ed9l5ftwu3lj2nprzxxsy807mezegu92qmc07805u` |
| `campaign_payout` | `6a2f5f0916151863e645c77115a3f25559de6ba4e0ac7fef450667be` | 13,228 | [`2eca0f99…#0`](https://preprod.cardanoscan.io/transaction/2eca0f9944419904949c2787a3854917f1ac11ced8c589c810282bda1de72c39) | `stake_test17p4z7hcfzc23sclxghrhz9dr7f24nhnt5ns2cll0g5rx00spdxj02` |
| `campaign_admin` | `6adb880c11fce51c0820465b4abf275aa9bab35943ef1b72c9514577` | 10,743 | [`64c334b8…#0`](https://preprod.cardanoscan.io/transaction/64c334b89d09b2b6746caca1dab887e35dcc5336b093f66ca12f10b06c41c24e) | `stake_test17p4dhzqvz87w28qgypr9kj4lyad2nw4nt9p77xmje9g52acxy3l9l` |
| `campaign_shard` | `05d153f53b3bfb2db4c0874c66b73ca3c9f9d07ebdc74d427bcf8e1b` | 9,327 | [`a4c7a4d1…#0`](https://preprod.cardanoscan.io/transaction/a4c7a4d193540515430531bcedb330ae821796da4dd4d9594419331c2604cba5) | `addr_test1wqzaz5l48valktd5czr5ce4h8j3un7ws067uwn2z008cuxc4f3tvf` |

### Configuration

The registry datum as deployed. Preprod roles are software wallets made for testing; on mainnet,
governance and guardian keys are hardware wallets, and the registry stores their payment key
hashes.

| Field | Value |
|---|---|
| Governance | 2-of-3: `1862b21748edc9ee1bc77c2ab00924199095d50ac178f5bf36ee5557`, `8e478fa7613e25c3237ffd35a0d0ce43b8fcdd2ee5af0c43e07359d4`, `dbd619a6726df238a7d6ae4e2f47d357f26bbf60d8dc172a0fa3eac5` |
| Guardian | 2-of-3: `fc7744c31d70da3ec5f2cecff20de0ff0452b45e22d2f103dd6bf185`, `37f5c2c2ce314ecfd04a602b0ff7b13dc8735d66c4cf9a371b647e1a`, `cc7d1edcbf1ba28ab58d80205d81404fae1d2f5ea840fac6261ddb45` |
| Operator (payment key hash) | `b2cf19b3109268fc3bd44f5250b2cd7da5a93d9a9e9c7b8ce0b239f5` |
| Pauser (payment key hash) | `553ab0107a4ff8a1a16981e57af9bd5112738ef4e1130135f581fc6d` |
| Ticket key (Ed25519 public key) | `31c9a648d3d4eb27ca1943dda7e972c735736d7b3e5111a4e472fe9b5c6ed6bf` |
| Treasury | `addr_test1qzf0yt2drnjdhyfe7ahfjak8amvfq7ttrepjtcavvpykxr472f7pfm6wywlcql8df38aamygw6yuy0rhz58rcljelyzsapvz6g` |
| Fee ceiling | `max_fee_bps` 1000 (10%) |

Preprod uses short limits, so a whole campaign can be tested quickly. The defaults of the mainnet
configuration, from the runbook, are shown next to them:

| Limit | Preprod | Mainnet configuration |
|---|---|---|
| Challenge window | 5 minutes to 7 days | 1 hour to 7 days |
| Commit window | 10 minutes to 90 days | 5 to 90 days |
| Re-commit floor after a rejection | 5 minutes | 3 days |
| Claim window | 10 minutes to 365 days | 30 to 365 days |
| Dispute timeout | 15 minutes | 3 days |
| One pause | 1 hour at most | 1 day at most |
| Entries per commit | 100 | 100 |

## Preprod reputation badges

| Item | Value |
|---|---|
| Built from | commit `b505ecfcfb17a6f3bd8688e6912d96c9f20b5310`, Aiken `v1.1.24+bacbeb3` |
| Seed | `f09710d4208e07c3ad559792bca2aff72e17e1773d2a3eb2581923ae4f631ab2#1` |
| Policy id (also the script hash) | [`f06ba45c6e2f4957b3002536ddcf66111d12191ba1962c3d2aae90fe`](https://preprod.cardanoscan.io/tokenPolicy/f06ba45c6e2f4957b3002536ddcf66111d12191ba1962c3d2aae90fe) |
| Address (configuration and badge references) | `addr_test1wrcxhfzudch5j4anqqjndhw0vcg36yserwsevtpa92hfplsx6xc3t` |
| Script size | 5,606 bytes |
| Configuration UTxO at deployment | [`0366ead8…#0`](https://preprod.cardanoscan.io/transaction/0366ead8829635b7dadb7249bab2e106a4c709e120f6cd37f11ec82870f4fb5e) |
| Reference script UTxO | [`ca454fca…#0`](https://preprod.cardanoscan.io/transaction/ca454fcaa7225ca9a7968ddec7819027984f17b4c8a7faebef9adad091bfcf3a) |
| Governance | 2-of-3, the same keys as the escrow's governance |
| Attester (Ed25519 public key) | `ac8e6779880a0b01f1d57f2a210070100471b55af9bd9d6a98b5433c46490d95` |
| Paused | no |
| Collection | Dyma Reputation |

| Tier | Name | From (reputation) | Boost |
|---|---|---:|---|
| 1 | Explorer | 250 | x1.05 |
| 2 | Contributor | 1,000 | x1.10 |
| 3 | Builder | 3,000 | x1.20 |
| 4 | Trailblazer | 7,500 | x1.35 |
| 5 | Champion | 15,000 | x1.50 |
| 6 | Legend | 30,000 | x1.75 |
| 7 | Mythic | 60,000 | x2.00 |

## Preprod job escrow

The escrow of [Dyma Jobs](https://github.com/Dyma-IO/dyma-contracts-cardano/blob/main/docs/SPEC.md#11-job-escrow-dyma-jobs):
one script, parameterised by a seed, is the job tokens' policy and the address of the configuration
and of every job.

| Item | Value |
|---|---|
| Built from | commit `ca03428914b20353ea3fafb91c291c82d8f56c52`, Aiken `v1.1.24+bacbeb3` |
| Seed | `97f4f869d7a2a6a28c10250f3f73e792f6f38ace1a386d37e66c2e000e630df4#2` |
| Policy id (also the script hash) | [`4c97ca97dd722041c881a8ebd899789de58dba0b63fe7e4acb652860`](https://preprod.cardanoscan.io/tokenPolicy/4c97ca97dd722041c881a8ebd899789de58dba0b63fe7e4acb652860) |
| Address (configuration and jobs) | `addr_test1wpxf0j5hm4ezqswgsx5whkye0zw7trd6pd3lulj2edjjscqvxdgcc` |
| Script size | 8,638 bytes |
| Configuration UTxO at deployment | [`6ff96d5f…#0`](https://preprod.cardanoscan.io/transaction/6ff96d5f421ebd40b86472bc100dc349370db671aeefcfcd5d97b3889166e31c) |
| Reference script UTxO | [`08fba9c9…#0`](https://preprod.cardanoscan.io/transaction/08fba9c9aaa493d55911297ce9c6a1c0c577ccaa00db7c5776a54222f3793a86) |
| Governance | 2-of-3, the same keys as the escrow's governance |
| Attester (Ed25519 public key) | `ddccc6b80fe532016d076e94246ef170ef74cc3955093dbe5a14a49713c59e23`, a key of its own |
| Treasury (receives the fee) | the escrow's treasury, `addr_test1qzf0yt2d…sapvz6g` |
| Highest fee a job may set | 10% (1,000 basis points) |
| Paused | no |

## How a deployment is verified

1. **Reproducible build.** `aiken build --trace-level silent` at the recorded commit, with the recorded
   Aiken version, gives the committed `plutus.json`; the deployment refuses a blueprint that differs,
   and CI fails when the committed one differs from a fresh build.
2. **Read back from the chain.** `scripts/deploy/verify.mjs --network preprod` compares the script
   hashes with the recorded commit's blueprint, then reads the reference scripts, the registry UTxO
   and its datum field by field, and the reward accounts.
3. **Registered in Admin.** Dyma UTXO's Admin registers the record and checks it against the chain
   again: the registry NFT at the registry address and every reference script for the escrow
   (**Escrow → Cardano**), the configuration NFT and the reference script for the badges (**Settings →
   Reputation**). See [Escrow operations](../operators/escrow-operations).

## What a mainnet deployment needs

The same procedure, from `deployments/mainnet.config.json`: the governance and guardian keys of
hardware wallets, Dyma UTXO's operator, pauser and ticket keys, the treasury and the mainnet limits.
The deployment stores about 262 ADA of reference-script deposits at the registry address, under
governance; about 300 ADA in all with the registry, the reward accounts and the fees. The procedure
is in the repository's `docs/RUNBOOK.md`.
