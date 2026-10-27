#!/usr/bin/env python3
"""Vetoriza um logo em PNG/JPG/WEBP para SVG de uma cor (fill="currentColor").

Uso:
  python3 -I vetorizar_logo.py ENTRADA SAIDA.svg [--crop x0,y0,x1,y1] [--escala 8]

- Detecta sozinho a cor de fundo (pelos cantos) e traça tudo que difere dela.
- Recorta automaticamente as margens vazias (ou use --crop para pegar só o
  ícone ou só o nome de um logo combinado).
- Imprime a linha de CSS com o aspect-ratio certo para colar em style.css.

Dependências: pip install potracer pillow numpy
Funciona melhor com imagens de logo chapado (uma cor sobre fundo liso).
"""
import argparse
import sys

import numpy as np
from PIL import Image, ImageFilter

try:
    import potrace  # pacote "potracer" (Python puro)
except ImportError:
    sys.exit("Instale antes: pip install potracer pillow numpy")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("saida")
    ap.add_argument("--crop", help="x0,y0,x1,y1 em pixels da imagem original")
    ap.add_argument("--escala", type=int, default=8, help="ampliação antes de traçar (padrão 8)")
    ap.add_argument("--limiar", type=int, default=70, help="diferença mínima do fundo (0-255)")
    a = ap.parse_args()

    im = Image.open(a.entrada).convert("RGBA")
    # transparência vira fundo branco
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    im = Image.alpha_composite(bg, im).convert("L")
    if a.crop:
        im = im.crop(tuple(int(v) for v in a.crop.split(",")))

    arr = np.array(im).astype(int)
    cantos = np.array([arr[0, 0], arr[0, -1], arr[-1, 0], arr[-1, -1]])
    fundo = int(np.median(cantos))
    frente = np.abs(arr - fundo) > a.limiar
    ys, xs = np.where(frente)
    if not len(xs):
        sys.exit("Nada encontrado: o logo tem contraste com o fundo?")
    pad = 2
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, arr.shape[1])
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, arr.shape[0])
    im = im.crop((x0, y0, x1, y1))
    w, h = im.size

    s = a.escala
    big = im.resize((w * s, h * s), Image.LANCZOS).filter(ImageFilter.GaussianBlur(s * 0.375))
    big_arr = np.array(big).astype(int)
    fg = np.abs(big_arr - fundo) > a.limiar
    # o potracer traça as regiões False como forma; por isso passamos o fundo
    bm = potrace.Bitmap(~fg)
    paths = bm.trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=0.2)

    d = []
    for c in paths:
        st = c.start_point
        d.append(f"M{st.x / s:.2f},{st.y / s:.2f}")
        for seg in c.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x / s:.2f},{seg.c.y / s:.2f}L{seg.end_point.x / s:.2f},{seg.end_point.y / s:.2f}")
            else:
                d.append(f"C{seg.c1.x / s:.2f},{seg.c1.y / s:.2f} {seg.c2.x / s:.2f},{seg.c2.y / s:.2f} {seg.end_point.x / s:.2f},{seg.end_point.y / s:.2f}")
        d.append("Z")
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><path fill="currentColor" fill-rule="evenodd" d="{"".join(d)}"/></svg>'
    with open(a.saida, "w") as f:
        f.write(svg)
    print(f"OK: {a.saida} ({len(paths)} contornos, viewBox {w}x{h})")
    print(f"CSS: aspect-ratio: {w} / {h};")


if __name__ == "__main__":
    main()
