---
sidebar_position: 1
---

# Repositories

Open source code for Dyma lives under the [Dyma-IO](https://github.com/Dyma-IO) organization.

## Application repos

| Repository | Deploy target | Stack |
|------------|---------------|-------|
| [`dyma-landing`](https://github.com/Dyma-IO/dyma-landing) | `dyma.io` | Next.js 15 |
| [`dyma-client`](https://github.com/Dyma-IO/dyma-client) | `app.dyma.io` | Next.js 15 |
| [`dyma-studio`](https://github.com/Dyma-IO/dyma-studio) | `studio.dyma.io` | Next.js 15 |
| [`dyma-admin`](https://github.com/Dyma-IO/dyma-admin) | `admin.dyma.io` | Next.js 15 |
| [`dyma-api`](https://github.com/Dyma-IO/dyma-api) | `api.dyma.io` | NestJS 11, Prisma 6 |
| [`dyma-shared`](https://github.com/Dyma-IO/dyma-shared) | package `@dyma-io/shared` (sibling `file:` dependency) | TypeScript |

## Infrastructure repos

| Repository | Purpose | Stack |
|------------|---------|-------|
| [`dyma-contracts`](https://github.com/Dyma-IO/dyma-contracts) | campaign reward escrow (factory + per-campaign escrow); a reputation contract placeholder | Rust / CosmWasm 2.2 |
| [`dyma-indexer`](https://github.com/Dyma-IO/dyma-indexer) | scaffold only, not used: the API verifies on-chain quests itself | Rust |
| [`dyma-docs`](https://github.com/Dyma-IO/dyma-docs) | this documentation site | Docusaurus 3 |
| `token-registry` | Safrochain chain, token, NFT and IBC registry (`@safrochain/token-registry`) | JSON + TypeScript lint |

## Local development

The apps consume `dyma-shared` as a sibling directory and read its compiled `dist/`, so clone the
repositories side by side and build the shared package first:

```bash
mkdir dyma && cd dyma
git clone https://github.com/Dyma-IO/dyma-shared.git
git clone https://github.com/Dyma-IO/dyma-api.git
git clone https://github.com/Dyma-IO/dyma-client.git     # and dyma-studio, dyma-admin, dyma-landing
cd dyma-shared && npm install && npm run build && cd ..
```

| App | Dev port | Env file |
|---|---|---|
| dyma-api | 4000 | `.env` (`cp .env.example .env`, then set `JWT_SECRET` and `CREDENTIALS_MASTER_KEY`) |
| dyma-landing | 3000 | `.env` (its scripts source it) |
| dyma-client | 3001 | `.env.local` |
| dyma-admin | 3002 | `.env.local` |
| dyma-studio | 3003 | `.env.local` |

Each repository's README has the details. API Swagger: `http://localhost:4000/docs`. After changing
`dyma-shared`, rebuild it (or run `npm run dev` there). If a Next.js dev server misses changes in
this multi-repo layout, start it with `WATCHPACK_POLLING=true`.

## CI and deployment

Every repository has a GitHub Actions workflow on pull requests and `main` (Node 22) and a
`deploy/` folder with a release-based deploy script and an nginx vhost. See
[Deployment](../operators/deployment).

## Documentation site

This site is built with [Docusaurus](https://docusaurus.io) and published to GitHub Pages:

**https://dyma-io.github.io/dyma-docs/**

To run locally:

```bash
git clone https://github.com/Dyma-IO/dyma-docs.git
cd dyma-docs
npm install
npm start
```
