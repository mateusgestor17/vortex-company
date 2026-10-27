// Gera favicon.svg, apple-touch-icon.png (180px) e og-image.png (1200x630) a partir do logo vetorizado.
// Uso: node gerar_icones.js PASTA_ASSETS "Título da imagem de compartilhamento" "Subtítulo"
// Espera em PASTA_ASSETS: logo-icone.svg e logo-nome.svg (fill="currentColor").
const fs = require("fs"), path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const [, , dir, titulo = "", sub = ""] = process.argv;
  const icone = fs.readFileSync(path.join(dir, "logo-icone.svg"), "utf8");
  const nome = fs.readFileSync(path.join(dir, "logo-nome.svg"), "utf8");
  const vb = icone.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const [w, h] = [+vb[1], +vb[2]], m = Math.max(w, h) * 0.3, side = Math.max(w, h) + 2 * m;
  const fav = icone.replace(/viewBox="[^"]+"/, `viewBox="${-(side - w) / 2} ${-(side - h) / 2} ${side} ${side}"`)
    .replace("<path", `<rect x="${-(side - w) / 2}" y="${-(side - h) / 2}" width="${side}" height="${side}" rx="${side * 0.21}" fill="#050505"/><path`)
    .replace('fill="currentColor"', 'fill="#fff"');
  fs.writeFileSync(path.join(dir, "favicon.svg"), fav);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 180, height: 180 });
  await p.setContent(`<body style="margin:0;width:180px;height:180px;background:#050505;display:grid;place-items:center;color:#fff"><div style="width:110px">${icone}</div></body>`);
  await p.screenshot({ path: path.join(dir, "apple-touch-icon.png") });
  await p.setViewportSize({ width: 1200, height: 630 });
  await p.setContent(`<body style="margin:0;width:1200px;height:630px;background:radial-gradient(70% 90% at 75% 50%,#1a1a1e,#050505 70%);color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:space-between;padding:0 90px;box-sizing:border-box">
    <div style="max-width:700px"><div style="width:300px">${nome}</div><h1 style="font-size:70px;line-height:.98;letter-spacing:-3px;margin:28px 0 0">${titulo}</h1><p style="color:#aaa;font-size:26px;margin-top:22px">${sub}</p></div>
    <div style="width:280px">${icone}</div></body>`);
  await p.screenshot({ path: path.join(dir, "og-image.png") });
  await b.close();
  console.log("OK: favicon.svg, apple-touch-icon.png, og-image.png");
})();
