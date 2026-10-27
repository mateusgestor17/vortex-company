#!/usr/bin/env bash
# Espera o build do Cloudflare Pages do último commit e mostra o resultado (lido pelos checks do GitHub).
# Uso: bash status_deploy.sh dono/repositorio [commit]
set -euo pipefail
REPO="$1"; C="${2:-$(git rev-parse --short HEAD)}"
until [ "$(gh api "repos/$REPO/commits/$C/check-runs" --jq '[.check_runs[]|select(.status=="completed")]|length')" -ge 1 ]; do sleep 5; done
gh api "repos/$REPO/commits/$C/check-runs" --jq '.check_runs[] | "\(.name): \(.conclusion)\n\(.output.summary)"' | grep -oE '^[A-Za-z ]+: [a-z_]+|Deploy [a-z!]+|Build failed|https://[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev'
