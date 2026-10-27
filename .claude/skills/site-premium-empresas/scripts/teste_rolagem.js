// Rola o site com a roda do mouse do topo ao rodapé e acusa travamentos ou erros de JS.
// Uso: node teste_rolagem.js URL [LARGURA=1440] [ALTURA=900]
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const [, , url, w = 1440, h = 900] = process.argv;
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  let erros = 0;
  p.on("pageerror", (e) => { erros++; console.log("ERRO NA PÁGINA:", e.message); });
  await p.goto(url); await p.waitForTimeout(4000);
  await p.mouse.move(+w / 2, +h / 2);
  let last = -1, parado = 0;
  for (let i = 0; i < 600; i++) {
    await p.mouse.wheel(0, 250); await p.waitForTimeout(60);
    const y = await p.evaluate(() => scrollY);
    parado = Math.abs(y - last) < 1 ? parado + 1 : 0; last = y;
    const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    if (y >= max - 2) { console.log(`OK: chegou ao rodapé (y=${Math.round(y)}) · erros de JS: ${erros}`); break; }
    if (parado > 25) { console.log(`TRAVOU em y=${Math.round(y)} — veja qual seção está nessa altura · erros de JS: ${erros}`); process.exitCode = 1; break; }
  }
  await b.close();
})();
