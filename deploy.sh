#!/usr/bin/env bash
# Publica o site no Cloudflare Pages e liga o domínio vortexcompanybr.com.br.
# Requer as variáveis CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
PROJECT="vortex-company"
DOMAINS=("vortexcompanybr.com.br" "www.vortexcompanybr.com.br")
API="https://api.cloudflare.com/client/v4"
: "${CLOUDFLARE_API_TOKEN:?defina CLOUDFLARE_API_TOKEN}"
: "${CLOUDFLARE_ACCOUNT_ID:?defina CLOUDFLARE_ACCOUNT_ID}"
AUTH=(-H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json")

# 1. Cria o projeto (ignora se já existir)
npx -y wrangler@4 pages project create "$PROJECT" --production-branch main 2>/dev/null || true

# 2. Envia os arquivos do site
OUT=$(mktemp -d)
rsync -a --exclude .git --exclude README.md --exclude deploy.sh --exclude wrangler.toml --exclude .gitignore ./ "$OUT/"
npx -y wrangler@4 pages deploy "$OUT" --project-name "$PROJECT" --branch main --commit-dirty=true

# 3. Liga os domínios ao projeto
for d in "${DOMAINS[@]}"; do
  curl -sS -X POST "${AUTH[@]}" "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/domains" -d "{\"name\":\"$d\"}" | head -c 300; echo
done

# 4. Garante os registros DNS (CNAME para o Pages, com proxy)
ZONE_ID=$(curl -sS "${AUTH[@]}" "$API/zones?name=vortexcompanybr.com.br" | python3 -c 'import sys,json; print(json.load(sys.stdin)["result"][0]["id"])')
for d in "${DOMAINS[@]}"; do
  EXISTING=$(curl -sS "${AUTH[@]}" "$API/zones/$ZONE_ID/dns_records?name=$d" | python3 -c 'import sys,json; r=json.load(sys.stdin)["result"]; print(r[0]["id"] if r else "")')
  BODY="{\"type\":\"CNAME\",\"name\":\"$d\",\"content\":\"$PROJECT.pages.dev\",\"proxied\":true}"
  if [ -n "$EXISTING" ]; then
    echo "DNS de $d já existe (id $EXISTING) — mantido. Ajuste manualmente se apontar para outro lugar."
  else
    curl -sS -X POST "${AUTH[@]}" "$API/zones/$ZONE_ID/dns_records" -d "$BODY" | head -c 300; echo
  fi
done
echo "Pronto: https://vortexcompanybr.com.br (o SSL pode levar alguns minutos)."
