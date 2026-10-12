#!/usr/bin/env bash
#
# Release-based deploy for dyma-docs (static Docusaurus site served by nginx).
#
#   $APP_ROOT/                       e.g. /home/dyma/testnet.docs.dyma.io
#   ├─ repo/                         git clone: fetched, never built, never served
#   ├─ releases/<id>/app/            one build per deploy (<id> = UTC time + commit)
#   ├─ current  -> releases/<id>/app nginx serves $APP_ROOT/current/build
#   └─ previous -> releases/<id>/app the release before it (rollback target)
#
# Pipeline: fetch → export the commit into releases/<id>/app → npm ci →
# docusaurus build (DOCS_URL / DOCS_BASE_URL) → check build/index.html → switch
# `current` → optional HEALTH_URL check → on failure: switch back.
# No PM2, no dyma-shared, no runtime: nginx reads files from `current`.
#
# The committed config targets GitHub Pages (baseUrl /dyma-docs/); a subdomain
# root needs DOCS_BASE_URL=/ (the default here) and DOCS_URL.
#
# Usage:
#   deploy/deploy.sh                 deploy origin/$DEPLOY_BRANCH
#   deploy/deploy.sh --ref <ref>     deploy a branch, tag or commit
#   deploy/deploy.sh --rollback      switch back to `previous`
#   deploy/deploy.sh --status        show the current, previous and kept releases
#
set -euo pipefail

# ── config (override any of these from the environment) ─────────────────────
SCRIPT_PATH="${BASH_SOURCE[0]}"
DEFAULT_REPO_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
REPO_DIR="${REPO_DIR:-$DEFAULT_REPO_DIR}"                 # the git clone (APP_ROOT/repo)
APP_ROOT="${APP_ROOT:-$(dirname "$REPO_DIR")}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_REF="${DEPLOY_REF:-}"
DOCS_URL="${DOCS_URL:-https://testnet.docs.dyma.io}"
DOCS_BASE_URL="${DOCS_BASE_URL:-/}"
HEALTH_URL="${HEALTH_URL:-}"                              # e.g. https://testnet.docs.dyma.io/docs/intro
KEEP_RELEASES="${KEEP_RELEASES:-4}"
NODE_MAX_OLD_SPACE="${NODE_MAX_OLD_SPACE:-1536}"

RELEASES_DIR="$APP_ROOT/releases"
LOCK_DIR="$APP_ROOT/.deploy.lock"
DEPLOY_LOG="$APP_ROOT/deploy.log"

log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" >> "$DEPLOY_LOG" 2>/dev/null || true; }
warn() { printf '\033[1;33m⚠ %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; printf '%s FAILED: %s\n' "$(date -u +%FT%TZ)" "$*" >> "$DEPLOY_LOG" 2>/dev/null || true; exit 1; }
usage() { sed -n '/^# Usage:/,/^#$/p' "$SCRIPT_PATH" | sed 's/^# \{0,1\}//'; }

MODE=deploy
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) [ $# -ge 2 ] || die "--ref needs a value"; DEPLOY_REF="$2"; shift 2 ;;
    --rollback) MODE=rollback; shift ;;
    --status) MODE=status; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "unknown argument: $1 (see --help)" ;;
  esac
done

need() { command -v "$1" >/dev/null 2>&1 || die "$1 not found in PATH"; }
link_target() { readlink "$1" 2>/dev/null || true; }
switch_link() { # <target (relative to APP_ROOT)> <link path>
  local tmp
  tmp="$(dirname "$2")/.$(basename "$2").$$"
  ln -sfn "$1" "$tmp"
  if mv --version >/dev/null 2>&1; then mv -Tf "$tmp" "$2"; else mv -fh "$tmp" "$2"; fi
}
site_ok() { # the public URL answers 200 (skipped when HEALTH_URL is empty)
  [ -z "$HEALTH_URL" ] && return 0
  [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" || true)" = "200" ]
}

mkdir -p "$RELEASES_DIR"

if [ "$MODE" = status ]; then
  echo "current  : $(link_target "$APP_ROOT/current")"
  echo "previous : $(link_target "$APP_ROOT/previous")"
  find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort | while read -r dir; do
    printf '  %s %s\n' "$(basename "$dir")" "$(tr '\n' ' ' < "$dir/DEPLOY_INFO" 2>/dev/null || true)"
  done
  exit 0
fi

need git; need npm; need node; need curl
mkdir "$LOCK_DIR" 2>/dev/null || die "another deploy holds $LOCK_DIR (remove it if no deploy is running)"
cleanup() {
  rm -rf "$LOCK_DIR"
  if [ -n "${DYMA_DEPLOY_REEXEC:-}" ]; then rm -f "$SCRIPT_PATH"; fi
}
trap cleanup EXIT

if [ "$MODE" = rollback ]; then
  prev="$(link_target "$APP_ROOT/previous")"
  cur="$(link_target "$APP_ROOT/current")"
  [ -n "$prev" ] && [ -d "$APP_ROOT/$prev" ] || die "no previous release to roll back to"
  log "Rolling back dyma-docs: $cur → $prev"
  switch_link "$prev" "$APP_ROOT/current"
  [ -n "$cur" ] && switch_link "$cur" "$APP_ROOT/previous"
  site_ok || warn "$HEALTH_URL does not answer 200 after the rollback"
  log "Rollback complete"
  exit 0
fi

[ -d "$REPO_DIR/.git" ] || die "no git clone at $REPO_DIR"
log "Fetching dyma-docs"
git -C "$REPO_DIR" fetch --prune --tags origin
TARGET="${DEPLOY_REF:-origin/$DEPLOY_BRANCH}"
SHA="$(git -C "$REPO_DIR" rev-parse --verify "$TARGET^{commit}" 2>/dev/null)" \
  || SHA="$(git -C "$REPO_DIR" rev-parse --verify "origin/$TARGET^{commit}" 2>/dev/null)" \
  || die "cannot resolve $TARGET in $REPO_DIR"

# Always run the deploy script of the commit being deployed (it may have changed).
if [ -z "${DYMA_DEPLOY_REEXEC:-}" ]; then
  NEW_SCRIPT="$(mktemp "${TMPDIR:-/tmp}/dyma-deploy.XXXXXX")"
  if git -C "$REPO_DIR" show "$SHA:deploy/deploy.sh" > "$NEW_SCRIPT" 2>/dev/null && ! cmp -s "$NEW_SCRIPT" "$SCRIPT_PATH"; then
    log "Running the deploy script of ${SHA:0:12}"
    rm -rf "$LOCK_DIR"; trap - EXIT
    export DYMA_DEPLOY_REEXEC=1 REPO_DIR APP_ROOT DEPLOY_REF="$SHA"
    exec bash "$NEW_SCRIPT"
  fi
  rm -f "$NEW_SCRIPT"
fi

RELEASE_ID="$(date -u +%Y%m%d%H%M%S)-${SHA:0:7}"
REL="$RELEASES_DIR/$RELEASE_ID"
[ ! -e "$REL" ] || die "$REL already exists (two deploys in the same second?); run it again"
log "Release $RELEASE_ID (dyma-docs ${SHA:0:12}) — url=$DOCS_URL baseUrl=$DOCS_BASE_URL"

mkdir -p "$REL/app"
git -C "$REPO_DIR" archive --format=tar "$SHA" | tar -x -C "$REL/app"
printf 'commit=%s\nref=%s\ndocs_url=%s\nbase_url=%s\nbuilt_at=%s\n' \
  "$SHA" "$TARGET" "$DOCS_URL" "$DOCS_BASE_URL" "$(date -u +%FT%TZ)" > "$REL/DEPLOY_INFO"

log "Installing dependencies (npm ci)"
( cd "$REL/app" && npm ci --no-audit --no-fund ) || { rm -rf "$REL"; die "npm ci failed"; }
log "Building (docusaurus build; broken links fail the build)"
( cd "$REL/app" && DOCS_URL="$DOCS_URL" DOCS_BASE_URL="$DOCS_BASE_URL" \
    NODE_OPTIONS="--max-old-space-size=$NODE_MAX_OLD_SPACE" npm run build ) \
  || { rm -rf "$REL"; die "docusaurus build failed; the live site was not touched"; }
[ -s "$REL/app/build/index.html" ] || { rm -rf "$REL"; die "build produced no build/index.html"; }
# Assets must be served from the configured base, never from the GitHub Pages one.
if [ "$DOCS_BASE_URL" = "/" ] && grep -q '/dyma-docs/assets/' "$REL/app/build/index.html"; then
  rm -rf "$REL"; die "the build still references /dyma-docs/ assets (DOCS_BASE_URL not applied)"
fi

PREV_TARGET="$(link_target "$APP_ROOT/current")"
log "Switching current → releases/$RELEASE_ID/app (nginx root: $APP_ROOT/current/build)"
switch_link "releases/$RELEASE_ID/app" "$APP_ROOT/current"
if ! site_ok; then
  touch "$REL/.failed"
  if [ -n "$PREV_TARGET" ] && [ -d "$APP_ROOT/$PREV_TARGET" ]; then
    switch_link "$PREV_TARGET" "$APP_ROOT/current"
    die "$HEALTH_URL does not answer 200 with the new build; $PREV_TARGET is served again"
  fi
  die "$HEALTH_URL does not answer 200 and there is no previous release"
fi

[ -n "$PREV_TARGET" ] && switch_link "$PREV_TARGET" "$APP_ROOT/previous"
touch "$REL/.deployed"
keep_current="$(basename "$(dirname "$(link_target "$APP_ROOT/current")")")"
keep_previous="$(basename "$(dirname "$(link_target "$APP_ROOT/previous")")")"
count=0
for dir in $(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort -r); do
  count=$((count + 1))
  case "$(basename "$dir")" in "$keep_current"|"$keep_previous") continue ;; esac
  [ "$count" -le "$KEEP_RELEASES" ] && continue
  rm -rf "$dir"
done
log "Deploy complete — $APP_ROOT/current/build serves dyma-docs ${SHA:0:12}"
