// Grava motion.html quadro a quadro (determinístico) e salva PNGs.
// Uso: node gravar.js config.json PASTA_FONTES PASTA_QUADROS [fps=30] [duracao=10]
const fs = require("fs"), path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const [, , cfgPath, fontes, out, fps = 30, dur = 10] = process.argv;
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const base = path.dirname(path.resolve(cfgPath));
  const svg = (p) => fs.readFileSync(path.resolve(base, p), "utf8").replace(/currentColor/g, "#fff");
  cfg.svg_icone = svg(cfg.logo_icone); cfg.svg_nome = svg(cfg.logo_nome);
  const f = (n) => "file://" + path.resolve(fontes, n);
  const css = `@font-face{font-family:Display;src:url(${f("display-700.woff2")});font-weight:700}
@font-face{font-family:Display;src:url(${f("display-800.woff2")});font-weight:800}
@font-face{font-family:Display;src:url(${f("display-400.woff2")});font-weight:400}
@font-face{font-family:Serif;src:url(${f("serif-italic.woff2")});font-style:italic}`;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on("pageerror", (e) => console.log("ERRO NA PÁGINA:", e.message));
  await p.addInitScript((c) => { window.CONFIG = c; }, cfg);
  await p.goto("file://" + path.join(__dirname, "motion.html"));
  await p.addStyleTag({ content: css });
  await p.evaluate(() => document.fonts.ready);
  const n = Math.round(+fps * +dur);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => render(t), i / +fps);
    await p.screenshot({ path: `${out}/f${String(i).padStart(4, "0")}.png` });
  }
  await b.close();
  console.log(`${n} quadros em ${out}`);
})();
