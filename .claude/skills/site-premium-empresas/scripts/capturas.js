// Tira capturas de tela de seções do site (computador ou celular).
// Uso: node capturas.js URL LARGURA ALTURA PREFIXO_SAIDA seletor[@deslocamento] ...
//   Seletores especiais: y@1200 (posição absoluta), pin@2.1 (etapa da jornada pinada, em telas)
// Ex.: node capturas.js http://localhost:8081/ 390 844 /tmp/cel y@0 .about@0 pin@0 '.svc[data-svc=crm]@-60'
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const [, , url, w, h, out, ...stops] = process.argv;
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on("pageerror", (e) => console.log("ERRO NA PÁGINA:", e.message));
  p.on("console", (m) => m.type() === "error" && console.log("CONSOLE:", m.text().slice(0, 200)));
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(4200); // loader + entrada do hero
  for (const [i, s] of stops.entries()) {
    const [sel, off] = s.split("@");
    await p.evaluate(([sel, off]) => {
      let y;
      if (sel === "y") y = +off;
      else if (sel === "pin") { const st = ScrollTrigger.getAll().find((t) => t.pin); y = st.start + (+off) * innerHeight; }
      else { const el = document.querySelector(sel); y = el.getBoundingClientRect().top + scrollY + (+off || 0); }
      window.scrollTo(0, y);
    }, [sel, off]);
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}-${i}.png` });
  }
  await b.close();
})();
