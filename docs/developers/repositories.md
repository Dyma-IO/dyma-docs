---
sidebar_position: 1
---

# Repositories

Open source code for Dyma lives under the [Dyma-IO](https://github.com/Dyma-IO) organization.

## Application repos

| Repository | Deploy target | Stack |
|------------|---------------|-------|
| Repository | Deploy target | Stack |
|------------|---------------|-------|
| [`dyma-landing`](https://github.com/Dyma-IO/dyma-landing) | `dyma.io` | Next.js 15 |
| [`dyma-client`](https://github.com/Dyma-IO/dyma-client) | `dyma.io/app` | Next.js 15 |
| [`dyma-admin`](https://github.com/Dyma-IO/dyma-admin) | `admin.dyma.io` | Next.js 15 |
| [`dyma-api`](https://github.com/Dyma-IO/dyma-api) | `api.dyma.io` | NestJS |
| [`dyma-shared`](https://github.com/Dyma-IO/dyma-shared) | npm package `@dyma-io/shared` | TypeScript |

## Infrastructure repos

| Repository | Purpose | Stack |
|------------|---------|-------|
| [`dyma-contracts`](https://github.com/Dyma-IO/dyma-contracts) | Escrow, reputation, token factory | Rust / CosmWasm |
| [`dyma-indexer`](https://github.com/Dyma-IO/dyma-indexer) | Multi-chain quest verification | Rust |
| [`dyma-docs`](https://github.com/Dyma-IO/dyma-docs) | This documentation site | Docusaurus |

## Planned

| Repository | Deploy target |
|------------|---------------|
| `dyma-studio` | `studio.dyma.io` |

## Local development

Each repository includes a `README` with setup steps. Typical flow:

```bash
git clone https://github.com/Dyma-IO/dyma-landing.git
cd dyma-landing
cp .env.example .env.local
npm install
npm run dev
```

API local Swagger: `http://localhost:4000/docs` when running `dyma-api`.

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
