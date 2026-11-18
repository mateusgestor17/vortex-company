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
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const WA = DATA.whatsapp || "5547991625752";

  $("#year").textContent = new Date().getFullYear();
  $$("[data-wa]").forEach((a) => (a.href = `https://wa.me/${WA}`)); // sem JS, o link vai direto ao WhatsApp

  /* ---------- Feedbacks: carrossel + visualizador ---------- */
  const FB = Array.isArray(DATA.feedbacks) ? DATA.feedbacks : [];
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb);
  let lbCur = 0, lbFocus = null;
  const lbShow = (i) => {
    lbCur = (i + FB.length) % FB.length;
    lbImg.src = FB[lbCur].src; lbImg.alt = FB[lbCur].alt || "Feedback de cliente";
    lbCap.textContent = [FB[lbCur].destaque, `${lbCur + 1} de ${FB.length}`].filter(Boolean).join("  ·  ");
  };
  const lbOpen = (i) => { if (!FB.length) return; lbFocus = document.activeElement; lbShow(i); lb.hidden = false; window.__lenis?.stop(); $(".lightbox__close", lb).focus(); };
  const lbClose = () => { lb.hidden = true; window.__lenis?.start(); lbFocus?.focus?.(); };
  $(".lightbox__close", lb).addEventListener("click", lbClose);
  $(".lightbox__nav--prev", lb).addEventListener("click", () => lbShow(lbCur - 1));
  $(".lightbox__nav--next", lb).addEventListener("click", () => lbShow(lbCur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lbClose(); });
  let sx = 0;
  lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lbShow(lbCur + (dx < 0 ? 1 : -1)); });
  $$("[data-fb]").forEach((b) => b.addEventListener("click", () => lbOpen(+b.dataset.fb)));

  if (FB.length) {
    const track = $("#feedbacksGrid");
    track.innerHTML = FB.map((f, i) => `
      <figure class="fb__card" data-i="${i}" tabindex="0" role="button" aria-label="Ampliar feedback ${i + 1}">
        <img src="${esc(f.src)}" alt="${esc(f.alt || "Feedback de cliente")}" loading="lazy" width="941" height="1672">
        ${f.destaque ? `<figcaption>${esc(f.destaque)}</figcaption>` : ""}
      </figure>`).join("");
    $("#fbDots").innerHTML = FB.map((_, i) => `<i class="${i ? "" : "is-active"}"></i>`).join("");
    $("#feedbacks").hidden = false;
    track.addEventListener("click", (e) => { const c = e.target.closest(".fb__card"); if (c) lbOpen(+c.dataset.i); });
    track.addEventListener("keydown", (e) => { const c = e.target.closest(".fb__card"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); lbOpen(+c.dataset.i); } });

    const cards = $$(".fb__card", track), dots = $$("#fbDots i");
    const prev = $(".fb__arrow--prev"), next = $(".fb__arrow--next");
    const step = () => cards[0].offsetWidth + 18;
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const syncNav = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, dist = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - track.offsetLeft + c.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = i; } });
      if (atEnd()) best = cards.length - 1;
      if (track.scrollLeft < 4) best = 0;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === best));
      prev.disabled = track.scrollLeft < 4;
      next.disabled = atEnd();
      $("#fbDots").style.visibility = track.scrollWidth > track.clientWidth + 4 ? "visible" : "hidden";
    };
    track.addEventListener("scroll", syncNav, { passive: true });
    addEventListener("resize", syncNav);
    syncNav();
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    let paused = false;
    ["pointerenter", "focusin", "touchstart"].forEach((ev) => track.addEventListener(ev, () => (paused = true), { passive: true }));
    ["pointerleave", "focusout"].forEach((ev) => track.addEventListener(ev, () => (paused = false)));
    if (!reduced) setInterval(() => {
      if (paused || !lb.hidden || track.scrollWidth <= track.clientWidth + 4) return;
      const r = track.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      atEnd() ? track.scrollTo({ left: 0, behavior: "smooth" }) : track.scrollBy({ left: step(), behavior: "smooth" });
    }, 3500);
  }

  /* ---------- Horário de atendimento (fuso de Brasília) ---------- */
  function updateOpenStatus() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const mins = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
    const workday = day >= 1 && day <= 6; // segunda a sábado
    const open = workday && mins >= 540 && mins < 1080;
    const el = $("#openStatus");
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    let msg;
    if (open) msg = "Aberto agora · fecha às 18h";
    else if (workday && mins < 540) msg = "Fechado · abre hoje às 9h";
    else if (day >= 1 && day <= 5) msg = "Fechado · abre amanhã às 9h";
    else msg = "Fechado · abre segunda às 9h";
    $(".status__text", el).textContent = msg;
    $$(".hours div").forEach((r) => r.classList.toggle("is-today", (r.dataset.dias || "").split(",").map(Number).includes(day)));
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);

  /* ---------- Formulário de qualificação ---------- */
  const tpl = $("#leadTemplate");
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("vortexLead2") || "{}"); } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem("vortexLead2", JSON.stringify(v)); } catch (e) {} },
  };
  const maskPhone = (v) => {
    let d = v.replace(/\D/g, "");
    if (d.startsWith("55") && d.length > 11) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  let origem = "Site";

  function setupForm(slot) {
    slot.appendChild(tpl.content.cloneNode(true));
    const form = $("form", slot), err = $(".lead-form__error", form);
    const saved = store.get();
    ["nome", "empresa", "email", "whatsapp"].forEach((k) => { if (saved[k]) form[k].value = saved[k]; });
    ["faturamento", "socio"].forEach((k) => { const r = saved[k] && form.querySelector(`input[name="${k}"][value="${saved[k]}"]`); if (r) r.checked = true; });
    form.whatsapp.addEventListener("input", () => (form.whatsapp.value = maskPhone(form.whatsapp.value)));
    $$("input", form).forEach((el) => ["input", "change"].forEach((ev) => el.addEventListener(ev, () => {
      el.classList.remove("is-invalid");
      if (el.type === "radio") el.closest(".chips").classList.remove("is-invalid");
      err.hidden = true;
    })));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = {
        nome: form.nome.value.trim().replace(/\s+/g, " "),
        empresa: form.empresa.value.trim(),
        email: form.email.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        faturamento: form.querySelector('input[name="faturamento"]:checked')?.value || "",
        socio: form.querySelector('input[name="socio"]:checked')?.value || "",
      };
      const faltando = [];
      const bad = (name, label) => { faltando.push(label); form[name].classList?.add("is-invalid"); };
      if (v.nome.split(" ").length < 2) bad("nome", "nome completo");
      if (v.empresa.length < 2) bad("empresa", "nome da empresa");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) bad("email", "e-mail válido");
      if (v.whatsapp.replace(/\D/g, "").length < 10) bad("whatsapp", "WhatsApp com DDD");
      if (!v.faturamento) { faltando.push("faturamento mensal"); form.querySelector('input[name="faturamento"]').closest(".chips").classList.add("is-invalid"); }
      if (!v.socio) { faltando.push("se possui sócio"); form.querySelector('input[name="socio"]').closest(".chips").classList.add("is-invalid"); }
      if (faltando.length) { err.textContent = "Falta preencher: " + faltando.join(", ") + "."; err.hidden = false; return; }
      store.set(v);
      const msg = [
        "Olá! Vim pelo site da Vortex e quero o diagnóstico gratuito.",
        "",
        "*Nome:* " + v.nome,
        "*Empresa:* " + v.empresa,
        "*E-mail:* " + v.email,
        "*WhatsApp:* " + v.whatsapp,
        "*Faturamento mensal:* " + v.faturamento,
        "*Possui sócio:* " + v.socio,
        "*Origem:* " + (slot.dataset.formSlot === "inline" ? "Formulário do site" : origem),
      ].join("\n");
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
      // (com "noopener" o window.open sempre devolve null; por isso o opener é zerado à mão)
      const w = window.open(url, "_blank");
      if (w) w.opener = null;
      else location.href = url;
      if (slot.dataset.formSlot === "modal") closeLead();
    });
    return form;
  }
  const inlineForm = setupForm($('[data-form-slot="inline"]'));
  const modalForm = setupForm($('[data-form-slot="modal"]'));

  const lead = $("#leadModal");
  let leadFocus = null;
  function openLead(btn) {
    origem = btn?.dataset.origem || (btn?.hasAttribute("data-wa") ? "Botão de WhatsApp" : "Site");
    // copia o que já foi digitado no formulário da página
    ["nome", "empresa", "email", "whatsapp"].forEach((k) => { if (inlineForm[k].value && !modalForm[k].value) modalForm[k].value = inlineForm[k].value; });
    $(".lead-form__error", modalForm).hidden = true;
    leadFocus = document.activeElement;
    lead.hidden = false;
    document.documentElement.style.overflow = "hidden";
    window.__lenis?.stop();
    setTimeout(() => (modalForm.nome.value ? modalForm.querySelector("button[type=submit]") : modalForm.nome).focus(), 60);
  }
  function closeLead() {
    lead.hidden = true;
    document.documentElement.style.overflow = "";
    window.__lenis?.start();
    leadFocus?.focus?.();
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lead], [data-wa]");
    if (!btn) return;
    e.preventDefault();
    openLead(btn);
  });
  $$("[data-close]", lead).forEach((el) => el.addEventListener("click", closeLead));
  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowLeft") lbShow(lbCur - 1);
      if (e.key === "ArrowRight") lbShow(lbCur + 1);
      return;
    }
    if (lead.hidden) return;
    if (e.key === "Escape") closeLead();
    if (e.key === "Tab") { // mantém o foco dentro do formulário
      const f = $$("button, input", lead).filter((el) => !el.disabled && el.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Menu mobile ---------- */
  const burger = $(".nav__burger"), menu = $(".mobile-menu");
  let lenis = null;
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Contadores ---------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const to = +el.dataset.count, dec = el.dataset.decimals;
    const fmt = (v) => Math.round(v).toLocaleString("pt-BR");
    if (!hasGsap || reduced) { el.textContent = fmt(to) + (dec ? "," + dec : ""); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = fmt(o.v)), onComplete: () => (el.textContent = fmt(to) + (dec ? "," + dec : "")) });
  }

  /* ---------- Sem GSAP ou com movimento reduzido: página estática ---------- */
  const loader = $(".loader");
  if (!hasGsap || reduced) {
    document.documentElement.classList.add("reduced");
    loader.remove();
    $$("[data-count]").forEach(countUp);
    $$(".pillar").forEach((s) => s.classList.add("is-in"));
    $(".wa-float").classList.add("is-visible");
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
    window.__lenis = lenis;
  }
  $$('a[href^="#"]:not([data-lead])').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: id === "#inicio" ? 0 : -20, duration: 1.6 }) : target.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- Loader + entrada ---------- */
  document.body.classList.add("is-loading");
  const num = $("#loaderNum"), counter = { v: 0 };
  const intro = gsap.timeline({ paused: true });
  intro
    .to(".loader", { yPercent: -100, duration: 1.1, ease: "expo.inOut" })
    .from(".hero__title .line > span", { yPercent: 110, duration: 1.3, stagger: 0.08, ease: "expo.out" }, "-=.45")
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
    v: 100, duration: 1.6, ease: "power2.inOut",
    onUpdate: () => { num.textContent = Math.round(counter.v); $(".loader__bar span").style.width = counter.v + "%"; },
    onComplete: () => { intro.play(); vstate.opacity = 1; },
  });

  $$("[data-count]").forEach((el) => {
    if (el.closest(".hero")) return;
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp(el) });
  });

  /* ---------- Reveals ---------- */
  ScrollTrigger.batch(".reveal-up:not(.hero .reveal-up)", {
    start: "top 88%",
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", overwrite: true }),
  });
  gsap.utils.toArray(".section-title, .case__title, .footer__cta h2").forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
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
  gsap.to(".hero__inner", { yPercent: -14, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- Jornada Vortex: pin + transformação do 3D ---------- */
  const steps = $$(".jstep"), dots = $$(".journey__progress li");
  let activeStep = 0;
  function showStep(i) {
    if (i === activeStep) return;
    const prev = steps[activeStep], next = steps[i], dir = i > activeStep ? 1 : -1;
    activeStep = i;
    gsap.killTweensOf([prev, next, $$("*", prev), $$("*", next)]);
    gsap.to(prev, { autoAlpha: 0, y: -40 * dir, duration: 0.5, ease: "power3.in", onComplete: () => prev.classList.remove("is-active") });
    next.classList.add("is-active");
    gsap.fromTo(next, { autoAlpha: 0, y: 60 * dir }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.25, ease: "expo.out" });
    gsap.fromTo($$(".jstep__kicker, h3, p, .tags li", next), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, delay: 0.3, ease: "expo.out" });
    gsap.fromTo($(".jstep__num", next), { scale: 0.75, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, delay: 0.2, ease: "expo.out" });
    dots.forEach((d, k) => { d.classList.toggle("is-active", k === i); d.classList.toggle("is-done", k < i); });
  }
  const pinST = ScrollTrigger.create({
    trigger: ".journey__pin", start: "top top", end: () => "+=" + innerHeight * 4.2, pin: true, anticipatePin: 1,
    onUpdate: (self) => showStep(Math.min(4, Math.round(self.progress * 4))),
  });
  const heroST = ScrollTrigger.create({ trigger: ".pains", start: "top bottom", end: "top top" });
  const headST = ScrollTrigger.create({ trigger: ".journey", start: "top 70%", end: () => pinST.start });
  const outST = ScrollTrigger.create({ trigger: ".pillars", start: "top bottom", end: "top 35%" });

  function layout() {
    const mobile = mm("(max-width: 760px)"), tablet = mm("(max-width: 1080px)");
    return {
      hero: mobile ? { x: 0, y: 0.35, scale: 0.78, opacity: 0.5 } : tablet ? { x: 1.2, y: 0, scale: 0.9, opacity: 0.85 } : { x: 1.85, y: 0, scale: 1, opacity: 1 },
      journey: mobile ? { x: 0, y: 0.85, scale: 0.55, opacity: 1 } : tablet ? { x: 1.3, y: 0, scale: 0.78, opacity: 1 } : { x: 1.75, y: 0, scale: 0.92, opacity: 1 },
    };
  }
  let L = layout();
  ScrollTrigger.addEventListener("refreshInit", () => (L = layout()));
  gsap.ticker.add(() => {
    const a = ease(clamp01(heroST.progress)), h = ease(clamp01(headST.progress)), p = clamp01(pinST.progress), s = clamp01(outST.progress);
    const mix = (k) => lerp(L.hero[k], L.journey[k], h);
    vstate.x = mix("x"); vstate.y = mix("y"); vstate.scale = mix("scale");
    if (document.body.classList.contains("is-loading")) return;
    // some atrás da seção clara de dores, volta na jornada e some de novo nos pilares
    vstate.opacity = mix("opacity") * Math.max(1 - a, h) * (1 - s);
    vstate.morph = h + p * 4;
  });

  /* ---------- Pilares (o que muda) ---------- */
  const loops = {};
  const LOOPS = {
    crm() {
      const card = $(".vis--crm .kcard--moving"), cols = $$(".vis--crm .kcol");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      const pos = (i) => () => cols[i].offsetLeft + (cols[i].offsetWidth - card.offsetWidth) / 2;
      gsap.set(card, { left: 0, x: pos(0)(), opacity: 0, y: 8 });
      tl.to(card, { opacity: 1, y: 0, duration: 0.5 })
        .to(card, { x: pos(1), duration: 0.9, ease: "power3.inOut", delay: 0.6 })
        .to(card, { x: pos(2), duration: 0.9, ease: "power3.inOut", delay: 0.6 })
        .to(card, { x: pos(3), duration: 0.9, ease: "power3.inOut", delay: 0.6 })
        .to(card, { background: "#0066FF", color: "#fff", duration: 0.3 })
        .fromTo(".float-card--crm", { scale: 0.9, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.5 }, "<")
        .to(card, { opacity: 0, y: -10, duration: 0.5, delay: 1 })
        .set(card, { x: pos(0), background: "#fff", color: "#080F20" });
      return () => tl.kill();
    },
    leads() {
      const stack = $(".vis--leads .notif-stack"), items = $$(".notif", stack), count = $(".vis--leads .leads-count");
      const gap = 12, h = () => items[0].offsetHeight + gap;
      let order = items.slice(), n = 0;
      const place = (animate) => order.forEach((el, i) => gsap.to(el, { y: i * h(), opacity: i < 4 ? 1 : 0, duration: animate ? 0.7 : 0, ease: "expo.out" }));
      place(false);
      const tick = () => {
        const last = order.pop(); order.unshift(last);
        gsap.set(last, { y: -h(), opacity: 0 });
        place(true);
        n += 1; count.textContent = n;
        gsap.fromTo(count, { scale: 1.3 }, { scale: 1, duration: 0.5 });
      };
      tick();
      const iv = setInterval(tick, 1700);
      return () => clearInterval(iv);
    },
    cash() {
      const el = $(".vis--cash .cash-value"), o = { v: 0 };
      const tw = gsap.to(o, { v: 48720, duration: 2.6, ease: "power2.out", delay: 0.3, onUpdate: () => (el.textContent = "R$ " + Math.round(o.v).toLocaleString("pt-BR")) });
      return () => tw.kill();
    },
  };
  function start(name) { if (loops[name] || !LOOPS[name]) return; try { loops[name] = LOOPS[name](); } catch (e) { console.warn("animação:", name, e); } }
  function stop(name) { if (loops[name]) { try { loops[name](); } catch (e) {} loops[name] = null; } }
  $$(".pillar").forEach((pl) => {
    const vis = $(".pillar__visual", pl), name = pl.dataset.vis;
    gsap.to(vis, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: pl, start: "top 95%", end: "top 35%", scrub: true } });
    gsap.from($(".vis", pl), { scale: 1.15, ease: "none", scrollTrigger: { trigger: pl, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from($$(".pillar__body > *", pl), { y: 50, opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: pl, start: "top 70%" } });
    ScrollTrigger.create({
      trigger: pl, start: "top 65%", end: "bottom top",
      onEnter: () => { pl.classList.add("is-in"); start(name); },
      onEnterBack: () => start(name),
      onLeave: () => stop(name),
      onLeaveBack: () => stop(name),
    });
  });

  /* ---------- Case ---------- */
  gsap.from(".case__visual .browser", { y: 80, rotate: -2, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".case", start: "top 70%" } });
  gsap.from(".case__print", { y: 120, rotate: 12, opacity: 0, duration: 1.4, delay: 0.2, ease: "expo.out", scrollTrigger: { trigger: ".case", start: "top 70%" } });
  gsap.to(".arc", { rotate: 8, transformOrigin: "50% 50%", ease: "none", scrollTrigger: { trigger: ".case", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- Feedbacks: entrada ---------- */
  if ($$(".fb__card").length) {
    // deslocamento no contêiner; nos cartões só opacidade (o transform deles é do hover)
    gsap.from(".fb", { y: 60, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".fb", start: "top 85%" } });
    gsap.from(".fb__card", { opacity: 0, stagger: 0.1, duration: 1, ease: "power2.out", scrollTrigger: { trigger: ".fb", start: "top 85%" } });
  }

  /* ---------- Fundador ---------- */
  gsap.from(".founder__photo img", { yPercent: 12, scale: 1.04, ease: "none", scrollTrigger: { trigger: ".founder", start: "top bottom", end: "bottom bottom", scrub: true } });

  /* ---------- Cursor e botões magnéticos ---------- */
  if (!mm("(pointer: coarse)")) {
    const dot = $(".cursor__dot"), ring = $(".cursor__ring"), cur = $(".cursor");
    const xd = gsap.quickTo(dot, "x", { duration: 0.1 }), yd = gsap.quickTo(dot, "y", { duration: 0.1 });
    const xr = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" }), yr = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    addEventListener("pointermove", (e) => { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); });
    document.addEventListener("pointerover", (e) => cur.classList.toggle("is-hover", !!e.target.closest("a, button, summary, .chips label")));
    $$(".magnetic").forEach((b) => {
      const xt = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const yt = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * 0.25); yt((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener("pointerleave", () => { xt(0); yt(0); });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
