---
description: What Dyma UTXO covers on Cardano today, and what comes next, Apex Fusion and then Midnight.
---

# Roadmap

Dyma UTXO brings Dyma's platform to the UTXO ecosystem one network at a time. These pages describe
only what is built; this one says what comes next.

## Cardano, today

- Sign-in with CIP-30 wallets, quests checked on Cardano, plans paid in ADA or USDM, manual
  distribution.
- The escrow and the CIP-68 reputation badges: deployed on preprod. Their mainnet deployment comes
  next ([Deployments](./contracts/deployments)).
- Swap and liquidity quests will come DEX by DEX: Cardano DEXes settle through batchers, so each one
  needs its own check ([Quests on Cardano](./earners/quests-on-cardano#not-available-on-cardano)).

## Apex Fusion, next

Apex Fusion's Prime and Vector chains run Cardano's ledger. Dyma UTXO will add them as further
networks of its Cardano family once their parameters are confirmed: they share Cardano mainnet's
network id and address format, so each needs its own chain configuration and data provider.

## Midnight, then

Midnight follows Apex Fusion. Like each new network, it is added after a short study of how its
wallets and transactions can sign in earners, prove quests and pay rewards; these pages will describe
it once it ships.
