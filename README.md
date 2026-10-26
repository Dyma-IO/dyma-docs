# dyma-docs

Public documentation for [Dyma](https://dyma.io), built with [Docusaurus](https://docusaurus.io) 3.
The same repository builds the documentation of Dyma UTXO, Dyma's site for the Cardano ecosystem
(see [Two sites](#two-sites)).

**Live site:** https://dyma-io.github.io/dyma-docs/ · testnet build: https://testnet.docs.dyma.io

## Sections

| Folder | Audience |
|---|---|
| `docs/getting-started`, `docs/intro.md` | everyone |
| `docs/earners` | earners: quests, points, recurring quests, wallets, token rewards, verifying an escrow |
| `docs/projects` | project teams: Studio, campaign lifecycle, distribution and the split, escrow, funding, payouts, exports, billing, integrations, REST verification |
| `docs/contracts` | the campaign escrow: architecture, messages, events, security model, deployments |
| `docs/operators` | running Dyma: environment variables, deployment, escrow operations, billing settings |
| `docs/platform` | reference: topology, content model, verification, authentication, task types, integrations, database |
| `docs/developers` | repositories and contributing |
| `docs-utxo/` | Dyma UTXO's site: the same sections for Cardano (wallets, quests, claims, escrow, billing, badge, contracts, operators) |
| `docs-shared/` | MDX partials both sites import: the text of pages (or sections) that are the same on both |

Write only what ships; label anything not built. Pages are MDX: keep `{`, `}` and `<tag>`-like text
inside code spans.

## Two sites

`DOCS_EDITION` picks the site at build time:

| `DOCS_EDITION` | Site | Pages | Sidebar | Homepage | Static files |
|---|---|---|---|---|---|
| unset or `cosmos` | Dyma | `docs/` | `sidebars.ts` | `src/pages/` | `static/` |
| `utxo` | Dyma UTXO | `docs-utxo/` | `sidebars-utxo.ts` | `src/pages-utxo/` | `static-utxo/` |

Unset builds Dyma's site exactly as before; any other value fails the build. Dyma UTXO's build
needs `DOCS_URL` (`https://docs.<its domain>`): its links (landing, app, Studio) and its contact
address (`hello@<its domain>`) come from that host, or from `DOCS_SITE_DOMAIN` when set. The domain is
never written in the repository, and neither site links to the other.

Text both sites share lives once in `docs-shared/` (files starting with `_`) and is imported by a
page of each tree, for example `import Exports from '@site/docs-shared/projects/_exports.mdx';`
then `<Exports />`. Both trees keep the same page ids (`projects/automatic-escrow`…), so the
relative links of a partial reach each site's own page. Edit a partial only when the change is true
on both sites; write the rest in the site's own page. A Dyma page whose first paragraph moved into a
partial keeps its meta description in front matter.

## Quick start

```bash
npm install
npm start          # http://localhost:3000, Dyma
DOCS_EDITION=utxo DOCS_URL=https://docs.example.invalid npm start   # Dyma UTXO
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | dev server |
| `npm run build` | production build — broken links, anchors and Markdown links fail it (`DOCS_EDITION=utxo DOCS_URL=… npm run build` for Dyma UTXO) |
| `npm run serve` | preview the build |
| `npm run typecheck` | TypeScript check |

## Deploy

- GitHub Pages: `.github/workflows/deploy.yml` on pushes to `main`.
- Self-hosted: release directories and an atomic `current` switch served by nginx —
  [deploy/README.md](deploy/README.md). Set `DOCS_URL` / `DOCS_BASE_URL` for a subdomain root, and
  `DOCS_EDITION=utxo` for Dyma UTXO's site.

CI (`.github/workflows/ci.yml`, Node 22): typecheck, then build both sites.

## Related

- [Dyma-IO organization](https://github.com/Dyma-IO)
- [Community Discussions](https://github.com/orgs/Dyma-IO/discussions)

## License

MIT © [Dyma IO](https://github.com/Dyma-IO)
