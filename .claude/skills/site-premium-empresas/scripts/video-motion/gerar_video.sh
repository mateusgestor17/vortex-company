#!/usr/bin/env bash
# Gera o vídeo em motion graphics do site (MP4 + WebM + capa) a partir de um config.json.
# Uso: bash gerar_video.sh config.json PASTA_SAIDA_DO_SITE/assets/video [PASTA_TEMP]
# Requer: node, ffmpeg, playwright (com Chromium), npm (para baixar as fontes).
set -euo pipefail
CFG="$1"; OUT="$2"; TMP="${3:-$(mktemp -d)}"
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT" "$TMP/fontes" "$TMP/quadros" "$TMP/npm"
# Fontes (Inter Tight + Instrument Serif) via npm — troque aqui se a marca usar outras
( cd "$TMP/npm" && npm pack @fontsource/inter-tight@5.1.0 @fontsource/instrument-serif@5.1.0 --silent >/dev/null \
  && for f in *.tgz; do tar xzf "$f" --one-top-level="${f%.tgz}"; done )
IT="$TMP/npm/fontsource-inter-tight-5.1.0/package/files"; IS="$TMP/npm/fontsource-instrument-serif-5.1.0/package/files"
cp "$IT/inter-tight-latin-400-normal.woff2" "$TMP/fontes/display-400.woff2"
cp "$IT/inter-tight-latin-700-normal.woff2" "$TMP/fontes/display-700.woff2"
cp "$IT/inter-tight-latin-800-normal.woff2" "$TMP/fontes/display-800.woff2"
cp "$IS/instrument-serif-latin-400-italic.woff2" "$TMP/fontes/serif-italic.woff2"
# Playwright: usa o instalado globalmente se existir
if [ -z "${PLAYWRIGHT_MODULE:-}" ]; then
  for c in /opt/node-tools/node_modules/playwright "$(npm root -g)/playwright"; do [ -d "$c" ] && export PLAYWRIGHT_MODULE="$c" && break; done
fi
node "$DIR/gravar.js" "$CFG" "$TMP/fontes" "$TMP/quadros" 30 10
ffmpeg -y -v error -framerate 30 -i "$TMP/quadros/f%04d.png" -vf "scale=960:540:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 24 -movflags +faststart -an "$OUT/video-motion.mp4"
ffmpeg -y -v error -framerate 30 -i "$TMP/quadros/f%04d.png" -vf "scale=960:540:flags=lanczos,format=yuv420p" \
  -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -an "$OUT/video-motion.webm"
# capa = cena do resultado (t = 6,3 s)
ffmpeg -y -v error -i "$TMP/quadros/f0190.png" -vf scale=960:540 -q:v 3 "$OUT/video-motion-poster.jpg"
ls -la "$OUT"
