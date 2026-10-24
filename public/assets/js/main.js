/* =========================================================
   Vortex Company — interações e animações
   ========================================================= */
(() => {
  const DATA = window.VORTEX || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const mm = (q) => matchMedia(q).matches;
  const reduced = mm("(prefers-reduced-motion: reduce)");
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- Dados básicos ---------- */
  const waUrl = `https://wa.me/${DATA.whatsapp || "5547991625752"}?text=${encodeURIComponent(DATA.whatsappMessage || "Olá! Vim pelo site da Vortex Company.")}`;
  $$("[data-wa]").forEach((a) => (a.href = waUrl));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Depoimentos e feedbacks ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  if (Array.isArray(DATA.depoimentos) && DATA.depoimentos.length) {
    const box = $("#reviews");
    box.innerHTML = DATA.depoimentos.map((d) => `
      <article class="review reveal-up">
        <div class="review__stars">${"★".repeat(Math.max(1, Math.min(5, d.estrelas || 5)))}</div>
        <p class="review__text">“${esc(d.texto)}”</p>
        <div class="review__who"><i>${d.foto ? `<img src="${esc(d.foto)}" alt="" loading="lazy">` : esc((d.nome || "?").charAt(0))}</i>
          <div><b>${esc(d.nome)}</b><small>${esc(d.empresa)}</small></div></div>
      </article>`).join("");
    box.hidden = false;
  }
  if (Array.isArray(DATA.feedbacks) && DATA.feedbacks.length) {
    $("#feedbacksGrid").innerHTML = DATA.feedbacks.map((f) => `<figure class="reveal-up"><img src="${esc(f.src)}" alt="${esc(f.alt || "Feedback de cliente")}" loading="lazy"></figure>`).join("");
    $("#feedbacks").hidden = false;
  }

  /* ---------- Horário de atendimento (fuso de Brasília) ---------- */
  function updateOpenStatus() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const mins = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
    const weekday = day >= 1 && day <= 5;
    const open = weekday && mins >= 540 && mins < 1080;
    const el = $("#openStatus");
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    let msg;
    if (open) msg = "Aberto agora · fecha às 18h";
    else if (weekday && mins < 540) msg = "Fechado · abre hoje às 9h";
    else if (day >= 1 && day <= 4) msg = "Fechado · abre amanhã às 9h";
    else msg = "Fechado · abre segunda às 9h";
    $(".status__text", el).textContent = msg;
    const rows = $$(".hours div");
    rows.forEach((r) => r.classList.remove("is-today"));
    rows[weekday ? 0 : day === 6 ? 1 : 2].classList.add("is-today");
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);

  /* ---------- Menu mobile ---------- */
  const burger = $(".nav__burger"), menu = $(".mobile-menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Sem GSAP ou movimento reduzido: conteúdo estático ---------- */
  let lenis = null;
  const loader = $(".loader");
  if (!hasGsap || reduced) {
    document.documentElement.classList.add("reduced");
    loader.remove();
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
    $$(".tick").forEach((el) => (el.textContent = el.dataset.to));
    $$(".svc").forEach((s) => s.classList.add("is-in"));
    $(".wa-float").classList.add("is-visible");
    // jornada sem pin: mostra todas as etapas em sequência
    $$(".jstep").forEach((s) => { s.style.position = "relative"; s.classList.add("is-active"); s.style.marginBottom = "60px"; });
    $(".journey__pin").style.height = "auto";
    $(".journey__steps").style.height = "auto";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const vstate = (window.__vortexState ||= { morph: 0, x: 0, y: 0, scale: 1, opacity: 1, velocity: 0 });

  /* ---------- Scroll suave ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", (e) => { ScrollTrigger.update(); vstate.velocity = e.velocity * 0.02; });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: id === "#inicio" ? 0 : -20, duration: 1.6 }) : target.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- Loader + entrada do hero ---------- */
  document.body.classList.add("is-loading");
  const num = $("#loaderNum");
  const counter = { v: 0 };
  const intro = gsap.timeline({ paused: true });
  intro
    .to(".loader", { yPercent: -100, duration: 1.1, ease: "expo.inOut" })
    .from(".hero__title .line > span", { yPercent: 110, rotate: 4, duration: 1.3, stagger: 0.09, ease: "expo.out" }, "-=.45")
    .to(".hero .reveal-up", { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out" }, "-=1")
    .from(".nav", { yPercent: -100, opacity: 0, duration: 1, ease: "expo.out" }, "-=1")
    .add(() => {
      document.body.classList.remove("is-loading");
      loader.remove();
      lenis && lenis.start();
      $$(".hero [data-count]").forEach(countUp);
    }, "-=.6");

  vstate.opacity = 0;
  gsap.to(counter, {
    v: 100, duration: 1.8, ease: "power2.inOut",
    onUpdate: () => {
      num.textContent = Math.round(counter.v);
      $(".loader__bar span").style.width = counter.v + "%";
    },
    onComplete: () => { intro.play(); vstate.opacity = 1; },
  });

  /* ---------- Contadores ---------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const o = { v: 0 }, to = +el.dataset.count || +el.dataset.to;
    gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
  }
  $$("[data-count]").forEach((el) => {
    if (el.closest(".hero")) return;
    ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => countUp(el) });
  });

  /* ---------- Reveals ---------- */
  ScrollTrigger.batch(".reveal-up:not(.hero .reveal-up)", {
    start: "top 88%",
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", overwrite: true }),
  });
  gsap.utils.toArray(".section-title, .cta__title").forEach((el) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* ---------- Navegação ---------- */
  const nav = $(".nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > 400 && y > lastY && !menu.classList.contains("is-open"));
      lastY = y;
      $(".wa-float").classList.toggle("is-visible", y > innerHeight * 0.6);
    },
  });

  /* ---------- Hero: parallax ao rolar ---------- */
  gsap.to(".hero__inner", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- Sobre: palavras acendendo ---------- */
  const aboutText = $(".about__text");
  (function splitWords(node) {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        n.classList.add("w");
      }
    });
  })(aboutText);
  gsap.to($$(".w", aboutText), { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: aboutText, start: "top 80%", end: "bottom 45%", scrub: true } });

  // brilho que segue o mouse nos cards
  $$(".about__card").forEach((c) => c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  /* ---------- Jornada: pin + transformação do vórtice ---------- */
  const steps = $$(".jstep");
  const dots = $$(".journey__progress li");
  let activeStep = 0;
  function showStep(i) {
    if (i === activeStep) return;
    const prev = steps[activeStep], next = steps[i];
    const dir = i > activeStep ? 1 : -1;
    activeStep = i;
    gsap.killTweensOf([prev, next, $$("*", prev), $$("*", next)]);
    gsap.to(prev, { autoAlpha: 0, y: -40 * dir, duration: 0.5, ease: "power3.in", onComplete: () => prev.classList.remove("is-active") });
    next.classList.add("is-active");
    gsap.fromTo(next, { autoAlpha: 0, y: 60 * dir }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.25, ease: "expo.out" });
    gsap.fromTo($$(".jstep__kicker, h3, p, .tags li", next), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, delay: 0.3, ease: "expo.out" });
    gsap.fromTo($(".jstep__num", next), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, delay: 0.2, ease: "expo.out" });
    dots.forEach((d, k) => { d.classList.toggle("is-active", k === i); d.classList.toggle("is-done", k < i); });
  }

  const pinST = ScrollTrigger.create({
    trigger: ".journey__pin",
    start: "top top",
    end: () => "+=" + innerHeight * 4.2,
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => showStep(Math.min(4, Math.round(self.progress * 4))),
  });
  const aboutST = ScrollTrigger.create({ trigger: ".about", start: "top bottom", end: "top top" });
  const headST = ScrollTrigger.create({ trigger: ".journey", start: "top 70%", end: () => pinST.start });
  const servicesST = ScrollTrigger.create({ trigger: ".services", start: "top bottom", end: "top 35%" });

  function layout() {
    const mobile = mm("(max-width: 760px)");
    const tablet = mm("(max-width: 1080px)");
    return {
      hero: mobile ? { x: 0, y: 0.35, scale: 0.78, opacity: 0.55 } : tablet ? { x: 1.2, y: 0, scale: 0.9, opacity: 0.85 } : { x: 1.85, y: 0, scale: 1, opacity: 1 },
      about: { x: 0, y: 0, scale: 1.35, opacity: 0.16 },
      journey: mobile ? { x: 0, y: 0.85, scale: 0.55, opacity: 1 } : tablet ? { x: 1.3, y: 0, scale: 0.78, opacity: 1 } : { x: 1.75, y: 0, scale: 0.92, opacity: 1 },
    };
  }
  let L = layout();
  ScrollTrigger.addEventListener("refreshInit", () => (L = layout()));

  function updateVortex() {
    const a = ease(clamp01(aboutST.progress));
    const h = ease(clamp01(headST.progress));
    const p = clamp01(pinST.progress);
    const s = clamp01(servicesST.progress);
    const mix = (k) => lerp(lerp(L.hero[k], L.about[k], a), L.journey[k], h);
    vstate.x = mix("x");
    vstate.y = mix("y");
    vstate.scale = mix("scale");
    const op = mix("opacity") * (1 - s);
    if (document.body.classList.contains("is-loading")) return;
    vstate.opacity = op;
    vstate.morph = h + p * 4;
  }
  gsap.ticker.add(updateVortex);

  /* ---------- Serviços ---------- */
  $$(".svc").forEach((svc) => {
    const vis = $(".svc__visual", svc);
    gsap.to(vis, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: svc, start: "top 95%", end: "top 35%", scrub: true } });
    gsap.from($(".vis", svc), { scale: 1.18, ease: "none", scrollTrigger: { trigger: svc, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from($$(".svc__body > *", svc), { y: 50, opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: svc, start: "top 70%" } });
    ScrollTrigger.create({
      trigger: svc, start: "top 65%", end: "bottom top",
      onEnter: () => { svc.classList.add("is-in"); $$(".tick", svc).forEach(countUp); start(svc.dataset.svc); },
      onEnterBack: () => start(svc.dataset.svc),
      onLeave: () => stop(svc.dataset.svc),
      onLeaveBack: () => stop(svc.dataset.svc),
    });
    // inclinação 3D sutil acompanhando o mouse
    if (!mm("(pointer: coarse)")) {
      const inner = $(".vis", svc);
      vis.addEventListener("pointermove", (e) => {
        const r = vis.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        gsap.to($$(".float-card, .gmb-card, .code", inner), { x: dx * 26, y: dy * 26, duration: 0.8, ease: "power3.out" });
      });
      vis.addEventListener("pointerleave", () => gsap.to($$(".float-card, .gmb-card, .code", inner), { x: 0, y: 0, duration: 1, ease: "expo.out" }));
    }
  });

  const loops = {};
  function start(name) { if (loops[name] || !LOOPS[name]) return; loops[name] = LOOPS[name](); }
  function stop(name) { if (loops[name]) { loops[name](); loops[name] = null; } }

  const LOOPS = {
    meta() {
      const box = $(".vis--meta .hearts");
      const live = $(".vis--meta .tick-live");
      let n = 27;
      const iv = setInterval(() => {
        const h = document.createElement("i");
        h.textContent = "♥";
        h.style.left = 55 + Math.random() * 35 + "%";
        h.style.setProperty("--dx", (Math.random() * 60 - 30) + "px");
        h.style.fontSize = 10 + Math.random() * 12 + "px";
        box.appendChild(h);
        setTimeout(() => h.remove(), 2700);
      }, 380);
      const iv2 = setInterval(() => { n += 1; live.textContent = n; gsap.fromTo(live, { scale: 1.25 }, { scale: 1, duration: 0.5 }); }, 2200);
      return () => { clearInterval(iv); clearInterval(iv2); };
    },
    google() {
      const el = $(".vis--google .typed");
      const ad = $(".vis--google .gresult--ad");
      const txt = el.dataset.text;
      let alive = true, t;
      const run = (i = 0) => {
        if (!alive) return;
        if (i === 0) { el.textContent = ""; gsap.set(ad, { opacity: 0, x: -20 }); }
        if (i <= txt.length) { el.textContent = txt.slice(0, i); t = setTimeout(() => run(i + 1), 45 + Math.random() * 60); }
        else {
          gsap.to(ad, { opacity: 1, x: 0, duration: 0.8, ease: "expo.out" });
          t = setTimeout(() => run(0), 4200);
        }
      };
      run();
      return () => { alive = false; clearTimeout(t); gsap.set(ad, { opacity: 1, x: 0 }); };
    },
    crm() {
      const card = $(".vis--crm .kcard--moving");
      const cols = $$(".vis--crm .kcol");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      const pos = (i) => () => cols[i].offsetLeft + (cols[i].offsetWidth - card.offsetWidth) / 2;
      gsap.set(card, { left: 0, x: pos(0)(), opacity: 0, y: 8 });
      tl.to(card, { opacity: 1, y: 0, duration: 0.5 })
        .to(card, { x: pos(1), duration: 0.9, ease: "power3.inOut", delay: 0.6 })
        .to(card, { x: pos(2), duration: 0.9, ease: "power3.inOut", delay: 0.6 })
        .to(card, { x: pos(3), duration: 0.9, ease: "power3.inOut", delay: 0.6 })
        .to(card, { background: "#3ddc84", duration: 0.3 })
        .fromTo(".float-card--crm", { scale: 0.9, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.5 }, "<")
        .to(card, { opacity: 0, y: -10, duration: 0.5, delay: 1 })
        .set(card, { x: pos(0), background: "#fff" });
      tl.invalidate();
      return () => tl.kill();
    },
    gmb() {
      const r = $(".vis--gmb .rank");
      const o = { v: 9 };
      const tw = gsap.to(o, { v: 1, duration: 2.4, ease: "power2.inOut", delay: 0.4, onUpdate: () => (r.textContent = Math.round(o.v)) });
      return () => tw.kill();
    },
  };

  /* ---------- Processo ---------- */
  gsap.to(".process__line span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".process__grid", start: "top 85%", end: "bottom 60%", scrub: true } });

  /* ---------- CTA ---------- */
  gsap.from(".cta__title .line > span", { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".cta", start: "top 70%" } });

  /* ---------- Footer gigante ---------- */
  gsap.from(".footer__giant", { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });

  /* ---------- Cursor e botões magnéticos ---------- */
  if (!mm("(pointer: coarse)")) {
    const dot = $(".cursor__dot"), ring = $(".cursor__ring"), cur = $(".cursor");
    const xd = gsap.quickTo(dot, "x", { duration: 0.1 }), yd = gsap.quickTo(dot, "y", { duration: 0.1 });
    const xr = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" }), yr = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    addEventListener("pointermove", (e) => { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); });
    document.addEventListener("pointerover", (e) => cur.classList.toggle("is-hover", !!e.target.closest("a, button")));

    $$(".magnetic").forEach((b) => {
      const xt = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const yt = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        xt((e.clientX - r.left - r.width / 2) * 0.3);
        yt((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener("pointerleave", () => { xt(0); yt(0); });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
