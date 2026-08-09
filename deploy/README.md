# Deploy — dyma-docs (testnet)

Static Docusaurus site. `deploy/deploy.sh` builds to `./build` and **nginx serves
it directly** — no PM2, no runtime, no `dyma-shared`. Manual for now.

- Host: `88.99.211.113` · user `dyma` · under `/home/dyma`
- nginx `testnet.docs.dyma.io` → `root /home/dyma/testnet.docs.dyma.io/build`

```
/home/dyma/
└─ testnet.docs.dyma.io/    this repo → build/ served statically by nginx
```

## baseUrl override (why this differs)

The committed config targets **GitHub Pages**: `url=https://dyma-io.github.io`,
`baseUrl=/dyma-docs/`. A site built with `baseUrl=/dyma-docs/` but served at a
subdomain **root** would 404 all its assets (`/dyma-docs/assets/...`).

The config now reads these from env with the GH-Pages values as defaults:

```ts
url:     process.env.DOCS_URL     ?? 'https://dyma-io.github.io',
baseUrl: process.env.DOCS_BASE_URL ?? '/dyma-docs/',
```

`deploy/deploy.sh` builds with `DOCS_BASE_URL=/` and
`DOCS_URL=https://testnet.docs.dyma.io`, so the testnet build works at the root.
The GitHub Pages workflow sets neither → keeps `/dyma-docs/` unchanged (no
regression).

## One-time setup

```bash
# as user dyma
cd /home/dyma
git clone git@github.com:Dyma-IO/dyma-docs.git testnet.docs.dyma.io
cd testnet.docs.dyma.io
./deploy/deploy.sh          # builds ./build; nginx already points at it
```

No `.env`, no `pm2` — nothing else. nginx serves `build/` as soon as it exists.

## Recurring deploy

```bash
ssh dyma@88.99.211.113 'cd /home/dyma/testnet.docs.dyma.io && ./deploy/deploy.sh'
```

Override per-run if needed, e.g. `DOCS_BASE_URL=/ DOCS_URL=https://testnet.docs.dyma.io ./deploy/deploy.sh`.

## Verify

```bash
ls build/index.html                        # build produced
curl -I https://testnet.docs.dyma.io       # 200
curl -s https://testnet.docs.dyma.io | grep -o '/assets/[^"]*' | head
# asset paths must be root-relative (/assets/...), NOT /dyma-docs/assets/...
```

Open the site and click around — if the page is blank / assets 404 under
`/dyma-docs/...`, the build used the wrong baseUrl → re-run deploy.sh (which sets
`DOCS_BASE_URL=/`).

## Gotchas

- **Static, no PM2** — nginx serves `build/` from disk; no process to reload.
- **Rebuild wipes `build/`** briefly during `docusaurus build` — acceptable for
  testnet; for zero-downtime, build to a temp dir and swap (not done here).
- **`onBrokenLinks: 'throw'`** — a broken internal link fails the build. Fix the
  link, not the deploy.
- **Keep devDependencies** — `npm ci` (not `--production`); Docusaurus builds with them.
