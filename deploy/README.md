# Deploy — dyma-docs

Static Docusaurus site. `deploy/deploy.sh` builds each commit in its own release
directory and switches a `current` symlink that nginx serves; no PM2, no runtime, no
dyma-shared. GitHub Pages (`.github/workflows/deploy.yml`) is the other target.

| | Testnet | Production |
|---|---|---|
| `APP_ROOT` | `/home/dyma/testnet.docs.dyma.io` | e.g. `/home/dyma/docs.dyma.io` |
| `DOCS_URL` / `DOCS_BASE_URL` | `https://testnet.docs.dyma.io` / `/` | `https://docs.dyma.io` / `/` |
| nginx root | `$APP_ROOT/current/build` | same |

```
/home/dyma/testnet.docs.dyma.io/     APP_ROOT
├─ repo/                             dyma-docs clone: fetched, never built
├─ releases/<UTC time>-<sha7>/app/   exported commit + node_modules + build/
├─ current  -> releases/<id>/app     nginx serves current/build
├─ previous -> releases/<id>/app     rollback target
└─ deploy.log
```

## What `deploy/deploy.sh` does

1. Fetches the repo, resolves `origin/$DEPLOY_BRANCH` (or `--ref`), re-runs itself from
   that commit when the script changed.
2. Exports the commit into `releases/<id>/app`, runs `npm ci` and `docusaurus build`
   with `DOCS_URL` / `DOCS_BASE_URL` (broken links fail the build: `onBrokenLinks: 'throw'`).
3. Refuses a build without `build/index.html`, or one that still points at the GitHub
   Pages base (`/dyma-docs/assets/`) when `DOCS_BASE_URL=/`.
4. Switches `current` atomically; with `HEALTH_URL` set, checks the public URL and
   switches back on failure.
5. Keeps the newest `KEEP_RELEASES` (4) releases.

```bash
deploy/deploy.sh                                   # origin/main
deploy/deploy.sh --ref <branch|tag|sha>
deploy/deploy.sh --rollback                        # back to `previous`
deploy/deploy.sh --status
HEALTH_URL=https://testnet.docs.dyma.io/docs/intro deploy/deploy.sh
```

## One-time setup

```bash
# as user dyma
mkdir -p /home/dyma/testnet.docs.dyma.io
git clone git@github.com:Dyma-IO/dyma-docs.git /home/dyma/testnet.docs.dyma.io/repo
/home/dyma/testnet.docs.dyma.io/repo/deploy/deploy.sh

sudo cp /home/dyma/testnet.docs.dyma.io/repo/deploy/nginx/docs.conf /etc/nginx/sites-available/testnet.docs.dyma.io
sudo ln -s /etc/nginx/sites-available/testnet.docs.dyma.io /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d testnet.docs.dyma.io
```

Moving from the old layout (the checkout itself was served from `build/`): move the
old directory aside, clone into `APP_ROOT/repo`, deploy once, then point the nginx
`root` at `$APP_ROOT/current/build` ([`nginx/docs.conf`](nginx/docs.conf)).

## Editions

The repository builds two sites. `DOCS_EDITION` picks one: unset (or `cosmos`) builds Dyma's docs
from `docs/`; `utxo` builds Dyma UTXO's from `docs-utxo/`. Dyma UTXO's site reads its links and its
contact address from `DOCS_URL`, so the script refuses `DOCS_EDITION=utxo` without an explicit
`DOCS_URL` (`DOCS_SITE_DOMAIN` overrides the domain read from it).

`deploy.sh` passes `DOCS_EDITION` to `npm run build` explicitly (and to the copy of itself it
re-runs), records it in `DEPLOY_INFO` (`edition=`), and refuses a build whose `build/index.html` is
not titled after the edition ("Dyma Docs" or "Dyma UTXO Docs"), so an edition that did not reach the
build never goes live.

```bash
DOCS_EDITION=utxo DOCS_URL=https://docs.<domain> DOCS_BASE_URL=/ deploy/deploy.sh
```

## baseUrl

The committed config targets GitHub Pages (`url=https://dyma-io.github.io`,
`baseUrl=/dyma-docs/`) and reads `DOCS_URL` / `DOCS_BASE_URL` from the environment.
A subdomain root needs `DOCS_BASE_URL=/`, which is this script's default.

## Verify

```bash
deploy/deploy.sh --status
curl -sI https://testnet.docs.dyma.io/docs/intro      # 200
curl -s https://testnet.docs.dyma.io | grep -o '/assets/[^"]*' | head -3   # root-relative assets
```
