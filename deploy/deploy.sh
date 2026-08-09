#!/usr/bin/env bash
#
# Ploi-style deploy for dyma-docs (Docusaurus, testnet, self-managed VPS).
# Run from the service checkout:  cd /home/dyma/testnet.docs.dyma.io && ./deploy/deploy.sh
#
# Docs is a STATIC site: no PM2, no dyma-shared, no runtime. This builds to ./build
# and nginx serves it directly (vhost root → /home/dyma/testnet.docs.dyma.io/build).
# Idempotent — safe to re-run.
#
# The committed config targets GitHub Pages (baseUrl /dyma-docs/). For a subdomain
# root we override DOCS_BASE_URL=/ (and DOCS_URL) at build time — the config reads
# them via `process.env.DOCS_* ?? <gh-pages default>`.
#
set -euo pipefail

# ── config ────────────────────────────────────────────────────────────────
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DOCS_URL="${DOCS_URL:-https://testnet.docs.dyma.io}"
DOCS_BASE_URL="${DOCS_BASE_URL:-/}"
NODE_MAX_OLD_SPACE="${NODE_MAX_OLD_SPACE:-1024}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }

# ── 1. source ────────────────────────────────────────────────────────────────
log "Updating dyma-docs ($DEPLOY_BRANCH)"
cd "$APP_DIR"
git fetch --prune origin
git reset --hard "origin/$DEPLOY_BRANCH"
npm ci

# ── 2. build static site to ./build (served by nginx) ───────────────────────
log "Building (docusaurus build) — url=$DOCS_URL baseUrl=$DOCS_BASE_URL"
DOCS_URL="$DOCS_URL" DOCS_BASE_URL="$DOCS_BASE_URL" \
  NODE_OPTIONS="--max-old-space-size=$NODE_MAX_OLD_SPACE" npm run build

log "Deploy complete — static site in $APP_DIR/build (served by nginx)"
