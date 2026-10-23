/* =========================================================
   Vortex Company — cena 3D de partículas
   Um único sistema de partículas que se transforma (morph) entre
   formas conforme o scroll: vórtice (logo) → descoberta → atenção →
   consideração → vendas → apologia.
   O estado é controlado por main.js via window.__vortexState.
   ========================================================= */
import * as THREE from "three";

const canvas = document.getElementById("vortex-gl");
const state = (window.__vortexState ||= { morph: 0, x: 0, y: 0, scale: 1, opacity: 1, velocity: 0 });

const isMobile = matchMedia("(max-width: 760px)").matches;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COUNT = isMobile ? 9000 : 22000;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  canvas.remove();
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 6.2);

/* ---------- utilidades de amostragem ---------- */
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
function fill(fn) {
  const arr = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const p = fn(i);
    arr[i * 3] = p[0]; arr[i * 3 + 1] = p[1]; arr[i * 3 + 2] = p[2];
  }
  return arr;
}

/* 0 — Vórtice (inspirado no logo: funil + espiral + seta subindo) */
const kind = new Float32Array(COUNT); // 1 = seta (não gira com o redemoinho)
const shapeVortex = fill((i) => {
  const r = Math.random();
  if (r < 0.56) {
    // superfície do funil
    const t = Math.pow(Math.random(), 0.8);            // 0 topo → 1 ponta
    const y = 1.35 - t * 2.9;
    const rad = 1.15 * Math.pow(1 - t, 1.25) + 0.04;
    const a = Math.random() * Math.PI * 2;
    const j = gauss() * 0.03;
    return [Math.cos(a) * (rad + j), y + gauss() * 0.02, Math.sin(a) * (rad + j)];
  }
  if (r < 0.70) {
    // borda superior (aro)
    const a = Math.random() * Math.PI * 2;
    const j = gauss() * 0.025;
    return [Math.cos(a) * (1.2 + j), 1.36 + gauss() * 0.02, Math.sin(a) * (1.2 + j)];
  }
  if (r < 0.86) {
    // anéis espirais em volta da parte de baixo
    const t = Math.random();
    const a = t * Math.PI * 2 * 2.2;
    const y = -0.35 - t * 0.95;
    const rad = 0.95 - t * 0.45;
    return [Math.cos(a) * rad + gauss() * 0.03, y + gauss() * 0.03 + Math.sin(a) * 0.06, Math.sin(a) * rad + gauss() * 0.03];
  }
  // seta de crescimento subindo para a direita
  kind[i] = 1;
  const t = Math.random();
  if (t < 0.86) {
    const s = t / 0.86;
    const x = -0.2 + s * 1.75;
    const y = -0.55 + Math.pow(s, 1.6) * 2.25;
    return [x + gauss() * 0.025, y + gauss() * 0.025, 0.9 - s * 0.6 + gauss() * 0.02];
  }
  // ponta da seta
  const s = Math.random(), side = Math.random() < 0.5 ? -1 : 1;
  const tip = [1.55, 1.7];
  const dirA = side < 0 ? [-0.42, -0.08] : [-0.05, -0.42];
  return [tip[0] + dirA[0] * s + gauss() * 0.02, tip[1] + dirA[1] * s + gauss() * 0.02, 0.3];
});

/* 1 — Descoberta: nuvem de "públicos" (vários aglomerados) */
const clusters = Array.from({ length: 46 }, () => {
  const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, rr = rand(1.1, 2.4);
  const s = Math.sqrt(1 - u * u);
  return [Math.cos(a) * s * rr * 1.25, u * rr * 0.85, Math.sin(a) * s * rr];
});
const shapeDiscovery = fill(() => {
  if (Math.random() < 0.72) {
    const c = clusters[(Math.random() * clusters.length) | 0];
    return [c[0] + gauss() * 0.14, c[1] + gauss() * 0.14, c[2] + gauss() * 0.14];
  }
  const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, rr = 2.6 * Math.cbrt(Math.random());
  const s = Math.sqrt(1 - u * u);
  return [Math.cos(a) * s * rr * 1.3, u * rr * 0.9, Math.sin(a) * s * rr];
});

/* 2 — Atenção: um olho (pálpebras, íris e pupila) */
const shapeAttention = fill(() => {
  const r = Math.random();
  if (r < 0.36) {
    const x = rand(-1.7, 1.7);
    const h = 0.78 * (1 - (x * x) / (1.7 * 1.7));
    const side = Math.random() < 0.5 ? 1 : -1;
    return [x, side * h + gauss() * 0.025, gauss() * 0.04];
  }
  if (r < 0.78) {
    const a = Math.random() * Math.PI * 2;
    const rad = rand(0.26, 0.66);
    const streak = 0.5 + 0.5 * Math.sin(a * 28);
    return [Math.cos(a) * rad, Math.sin(a) * rad, 0.05 + streak * 0.04 + gauss() * 0.02];
  }
  if (r < 0.92) {
    const a = Math.random() * Math.PI * 2, rad = 0.24 * Math.sqrt(Math.random());
    return [Math.cos(a) * rad, Math.sin(a) * rad, 0.12];
  }
  // brilho e raios
  const a = Math.random() * Math.PI * 2, rad = rand(1.95, 2.3);
  return [Math.cos(a) * rad * 1.05, Math.sin(a) * rad * 0.62, gauss() * 0.1];
});

/* 3 — Consideração: funil em estágios (anéis empilhados) */
const shapeConsider = fill(() => {
  const r = Math.random();
  if (r < 0.8) {
    const k = (Math.random() * 6) | 0;
    const y = 1.3 - k * 0.52;
    const rad = 1.55 - k * 0.24;
    const a = Math.random() * Math.PI * 2;
    return [Math.cos(a) * (rad + gauss() * 0.03), y + gauss() * 0.025, Math.sin(a) * (rad + gauss() * 0.03)];
  }
  // fluxo descendo pelo centro
  const t = Math.random();
  const a = Math.random() * Math.PI * 2, rad = (1 - t) * 0.9 * Math.sqrt(Math.random());
  return [Math.cos(a) * rad, 1.5 - t * 3.3, Math.sin(a) * rad];
});

/* 4 — Vendas: gráfico de barras crescendo + seta */
const shapeSales = fill(() => {
  const r = Math.random();
  if (r < 0.8) {
    const b = (Math.random() * 5) | 0;
    const cx = -1.3 + b * 0.62, base = -1.35, h = 0.55 + b * 0.5, w = 0.2;
    const face = Math.random();
    let x, y, z;
    if (face < 0.7) { // laterais
      const side = (Math.random() * 4) | 0;
      y = base + Math.random() * h;
      const u = rand(-w, w);
      [x, z] = side === 0 ? [cx - w, u] : side === 1 ? [cx + w, u] : side === 2 ? [cx + u, -w] : [cx + u, w];
    } else { // topo
      x = cx + rand(-w, w); z = rand(-w, w); y = base + h;
    }
    return [x, y, z];
  }
  const t = Math.random();
  if (t < 0.85) {
    const s = t / 0.85;
    return [-1.6 + s * 3.1 + gauss() * 0.02, -0.45 + s * 2.25 + gauss() * 0.02, 0.45];
  }
  const s = Math.random(), side = Math.random() < 0.5;
  return [1.55 + (side ? -0.4 : 0.02) * s, 1.85 + (side ? 0.0 : -0.4) * s, 0.45];
});

/* 5 — Apologia: coração (clientes que amam e indicam) */
const shapeAdvocacy = (() => {
  const arr = new Float32Array(COUNT * 3);
  let n = 0;
  const f = (x, y, z) => { const a = x * x + 2.25 * y * y + z * z - 1; return a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z; };
  while (n < COUNT) {
    const x = rand(-1.3, 1.3), y = rand(-0.8, 0.8), z = rand(-1.2, 1.4);
    const v = f(x, y, z);
    if (v <= 0 && v > -0.035) {
      arr[n * 3] = x * 1.45; arr[n * 3 + 1] = z * 1.45 + 0.15; arr[n * 3 + 2] = y * 1.45;
      n++;
    }
  }
  return arr;
})();

/* ---------- geometria ---------- */
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(shapeVortex, 3));
geo.setAttribute("p1", new THREE.BufferAttribute(shapeDiscovery, 3));
geo.setAttribute("p2", new THREE.BufferAttribute(shapeAttention, 3));
geo.setAttribute("p3", new THREE.BufferAttribute(shapeConsider, 3));
geo.setAttribute("p4", new THREE.BufferAttribute(shapeSales, 3));
geo.setAttribute("p5", new THREE.BufferAttribute(shapeAdvocacy, 3));
geo.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));
const rnd = new Float32Array(COUNT * 4);
for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random();
geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 4));

const uniforms = {
  uTime: { value: 0 },
  uMorph: { value: 0 },
  uSize: { value: (isMobile ? 26 : 30) * renderer.getPixelRatio() },
  uOpacity: { value: 1 },
  uVel: { value: 0 },
  uMouse: { value: new THREE.Vector2() },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: /* glsl */ `
    attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4; attribute vec3 p5;
    attribute float aKind; attribute vec4 aRand;
    uniform float uTime, uMorph, uSize, uVel;
    uniform vec2 uMouse;
    varying float vAlpha; varying float vTint;

    float w(float i, float m) { float d = clamp(1.0 - abs(m - i), 0.0, 1.0); return d * d * (3.0 - 2.0 * d); }

    void main() {
      // escalonamento por partícula: cada uma muda de forma num tempo levemente diferente
      float m = clamp(uMorph + (aRand.x - 0.5) * 0.35 * (1.0 - step(4.99, uMorph)), 0.0, 5.0);
      float w0 = w(0.0, m), w1 = w(1.0, m), w2 = w(2.0, m), w3 = w(3.0, m), w4 = w(4.0, m), w5 = w(5.0, m);
      float ws = w0 + w1 + w2 + w3 + w4 + w5;
      vec3 pos = (position * w0 + p1 * w1 + p2 * w2 + p3 * w3 + p4 * w4 + p5 * w5) / ws;

      // redemoinho (mais rápido perto da ponta do funil)
      float swirl = w0 * (1.0 - aKind) + w3 * 0.35 + w1 * 0.12;
      float speed = 0.35 + 1.4 * clamp(1.0 - (pos.y + 1.6) / 3.2, 0.0, 1.0) + uVel * 2.0;
      float ang = uTime * speed * swirl;
      float c = cos(ang), s = sin(ang);
      pos.xz = mat2(c, -s, s, c) * pos.xz;

      // explosão suave durante a transição entre formas
      float tr = 1.0 - abs(fract(m) - 0.5) * 2.0;
      tr = (m > 0.001 && m < 4.999) ? tr : 0.0;
      vec3 dir = normalize(vec3(aRand.x - 0.5, aRand.y - 0.5, aRand.z - 0.5) + 0.0001);
      pos += dir * tr * tr * (0.35 + aRand.w * 0.9);

      // respiração / ruído vivo
      pos += 0.025 * vec3(sin(uTime * 1.3 + aRand.x * 40.0), cos(uTime * 1.1 + aRand.y * 40.0), sin(uTime * 0.9 + aRand.z * 40.0));

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;
      float size = uSize * (0.25 + pow(aRand.z, 3.0) * 1.1);
      gl_PointSize = size / -mv.z;
      vAlpha = (0.35 + 0.65 * aRand.w) * smoothstep(12.0, 3.0, -mv.z);
      vTint = aRand.y;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uOpacity;
    varying float vAlpha; varying float vTint;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float core = smoothstep(0.5, 0.0, d);
      core = pow(core, 1.8);
      vec3 col = mix(vec3(1.0), vec3(0.78, 0.84, 1.0), step(0.86, vTint));
      col = mix(col, vec3(1.0, 0.93, 0.85), step(0.96, vTint));
      gl_FragColor = vec4(col, core * vAlpha * uOpacity * 0.9);
    }
  `,
});

const points = new THREE.Points(geo, material);
const group = new THREE.Group();
group.add(points);
scene.add(group);

/* poeira de fundo */
const dustCount = isMobile ? 500 : 1400;
const dustGeo = new THREE.BufferGeometry();
const dpos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dpos[i * 3] = rand(-9, 9); dpos[i * 3 + 1] = rand(-6, 6); dpos[i * 3 + 2] = rand(-8, 2);
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.018, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);

/* ---------- interação ---------- */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});

/* ---------- loop ---------- */
const clock = new THREE.Clock();
const cur = { morph: 0, x: state.x, y: state.y, scale: state.scale, opacity: 0, vel: 0 };
let visible = true;
document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

function tick() {
  requestAnimationFrame(tick);
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const k = 1 - Math.pow(0.0015, dt); // suavização independente de FPS

  cur.morph += (state.morph - cur.morph) * k;
  cur.x += (state.x - cur.x) * k;
  cur.y += (state.y - cur.y) * k;
  cur.scale += (state.scale - cur.scale) * k;
  cur.opacity += (state.opacity - cur.opacity) * k;
  cur.vel += (Math.min(Math.abs(state.velocity), 3) - cur.vel) * k * 0.5;
  mouse.x += (mouse.tx - mouse.x) * k * 0.6;
  mouse.y += (mouse.ty - mouse.y) * k * 0.6;

  uniforms.uTime.value = reduced ? 0 : t;
  uniforms.uMorph.value = cur.morph;
  uniforms.uOpacity.value = cur.opacity;
  uniforms.uVel.value = cur.vel * 0.15;

  group.position.set(cur.x, cur.y, 0);
  group.scale.setScalar(cur.scale);
  group.rotation.y = Math.sin(t * 0.22) * 0.32 + mouse.x * 0.35;
  group.rotation.x = 0.08 + mouse.y * 0.18;
  dust.rotation.y = t * 0.01;
  dust.position.y = -window.scrollY * 0.0008;

  canvas.style.visibility = cur.opacity < 0.01 ? "hidden" : "visible";
  if (cur.opacity >= 0.01) renderer.render(scene, camera);
}
tick();
window.dispatchEvent(new Event("vortex:ready"));
