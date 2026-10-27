#!/usr/bin/env bash
# Procura textos do site-modelo (Vortex Company) que esqueceram de ser trocados.
# Uso: bash verificar_restos.sh PASTA_DO_SITE
D="${1:-public}"
PADROES='Vortex|VORTEX|99162|5547991625752|68\.063\.725|4198462059883251963|0x3a43eeffc24bc8fb|Esquadri|vortexcompanybr|Mais de 100|\+100|DDNUMERO'
if grep -rniE "$PADROES" "$D" --include=*.html --include=*.js --include=*.css --include=*.xml --include=*.txt --include=_headers | grep -v '/vendor/'; then
  echo; echo "ATENÇÃO: troque os itens acima pelos dados da nova empresa."; exit 1
else
  echo "OK: nenhum resto do modelo encontrado."
fi
