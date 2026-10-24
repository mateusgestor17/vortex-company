#!/usr/bin/env bash
# Publica o site no Cloudflare Workers (mesma coisa que o Cloudflare faz a cada push).
# Requer CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
: "${CLOUDFLARE_API_TOKEN:?defina CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?defina CLOUDFLARE_ACCOUNT_ID}"
npx -y wrangler@4 deploy
