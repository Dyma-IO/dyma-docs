# dyma-docs

Public documentation for [Dyma](https://dyma.io), built with [Docusaurus](https://docusaurus.io) 3.

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

Write only what ships; label anything not built. Pages are MDX: keep `{`, `}` and `<tag>`-like text
inside code spans.

## Quick start

```bash
npm install
npm start          # http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | dev server |
| `npm run build` | production build — broken links, anchors and Markdown links fail it |
| `npm run serve` | preview the build |
| `npm run typecheck` | TypeScript check |

## Deploy

- GitHub Pages: `.github/workflows/deploy.yml` on pushes to `main`.
- Self-hosted (testnet): release directories and an atomic `current` switch served by nginx —
  [deploy/README.md](deploy/README.md). Set `DOCS_URL` / `DOCS_BASE_URL` for a subdomain root.

CI (`.github/workflows/ci.yml`, Node 22): typecheck and build.

## Related

- [Dyma-IO organization](https://github.com/Dyma-IO)
- [Community Discussions](https://github.com/orgs/Dyma-IO/discussions)

## License

MIT © [Dyma IO](https://github.com/Dyma-IO)
