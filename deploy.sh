#!/usr/bin/env bash
# Publicação manual no Cloudflare Pages (normalmente não é necessário: cada push na main publica sozinho).
# Requer CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
: "${CLOUDFLARE_API_TOKEN:?defina CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?defina CLOUDFLARE_ACCOUNT_ID}"
npx -y wrangler@4 pages deploy public --project-name vortex-company --branch main
