# Animações: cena 3D e visuais dos serviços

Bibliotecas locais em `assets/vendor/`: GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13 e Three.js 0.160.0. Não dependem de CDN.

## Cena 3D (`assets/js/cena3d.js`)

Um único `THREE.Points` com `COUNT` partículas (22 mil no computador, 9 mil no celular). Cada partícula tem 6 posições-alvo, uma por forma, e o shader mistura essas posições conforme `uMorph`, que vai de 0 a 5:

| `uMorph` | Variável | Forma no modelo (agência) | Quando aparece |
|---|---|---|---|
| 0 | `shapeHero` (atributo `position`) | Funil/vórtice do logo, com seta subindo | Hero |
| 1 | `shapeDiscovery` (`p1`) | Nuvem de aglomerados ("públicos") | Etapa 1 |
| 2 | `shapeAttention` (`p2`) | Olho | Etapa 2 |
| 3 | `shapeConsider` (`p3`) | Funil em anéis empilhados | Etapa 3 |
| 4 | `shapeSales` (`p4`) | Gráfico de barras com seta | Etapa 4 |
| 5 | `shapeAdvocacy` (`p5`) | Coração | Etapa 5 |

`main.js` controla tudo pelo objeto `window.__cena3d` (`morph`, `x`, `y`, `scale`, `opacity`, `velocity`):
- `layout()` define posição, escala e opacidade no hero, no "sobre" e na jornada, separando computador, tablet e celular;
- `updateVortex()` calcula o `morph` pelo scroll: `morph = h + p * 4`, em que `h` é a entrada na jornada e `p` o progresso da seção pinada.

### Como trocar uma forma

Cada forma é `fill((i) => [x, y, z])`, chamada uma vez por partícula. Mantenha as coordenadas em torno de **−1,7 a +1,9** (a câmera está em z = 6,2, campo de visão de 40°). Utilitários:
- `rand(a, b)`: número aleatório entre a e b;
- `gauss()`: ruído suave, use × 0,02–0,05 para dar espessura às linhas;
- `kind[i] = 1`: a partícula não gira com o redemoinho do hero (usado na seta).

Receitas úteis:
```js
// Superfície de um retângulo (porta/janela) com moldura e vidros
const shapeJanela = fill(() => {
  const r = Math.random();
  if (r < 0.35) { // moldura
    const t = Math.random() * 4, s = t % 1;
    const p = t < 1 ? [-1.2 + 2.4 * s, 1.4] : t < 2 ? [1.2, 1.4 - 2.8 * s] : t < 3 ? [1.2 - 2.4 * s, -1.4] : [-1.2, -1.4 + 2.8 * s];
    return [p[0] + gauss() * 0.03, p[1] + gauss() * 0.03, gauss() * 0.03];
  }
  if (r < 0.45) return [gauss() * 0.02, rand(-1.4, 1.4), 0];              // travessa vertical
  return [rand(-1.2, 1.2), rand(-1.4, 1.4), gauss() * 0.01];               // vidro (plano)
});

// Gota d'água (desentupidora, limpeza)
const shapeGota = fill(() => {
  const t = Math.random() * Math.PI * 2, u = Math.random() * Math.PI;
  const rr = Math.sin(u) * (1 - Math.cos(u)) * 0.75;
  return [rr * Math.cos(t), 1.4 - (1 - Math.cos(u)) * 1.4, rr * Math.sin(t)];
});

// Texto/ícone qualquer: desenhe num <canvas> 2D, amostre pixels acesos e use como (x, y)
```
Ideias por segmento:
- **Vidraçaria:** janela, box de banheiro, prédio espelhado, ondas de reflexo.
- **Desentupidora:** gota, cano em espiral, escudo de garantia, relógio 24h.
- **Clínica:** dente, coração, escudo, estrela.
- **Advocacia:** balança, martelo, documento, escudo.
- **Construtora:** casa, planta baixa em grade, prédio, chave.

O coração e o gráfico de barras servem para quase todo segmento (satisfação e crescimento).

Depois de trocar formas, olhe as capturas `pin@0`, `pin@1.05`, `pin@2.1`, `pin@3.15` e `pin@4.2`, nos dois tamanhos de tela. A forma não pode ficar cortada pelo nav nem cobrir o texto.

## Visuais dos serviços

Cada `.svc` tem `.svc__visual > .vis.vis--NOME`. Ao entrar na tela, recebe a classe `.is-in`, que dispara as animações CSS, e chama `LOOPS[NOME]()` em `main.js` para as animações em JS. Cada loop devolve uma função de parada, executada quando a seção sai da tela. `start()` e `stop()` ficam dentro de `try/catch`: um erro ali **nunca** pode travar a página.

| Visual | Peças editáveis | Loop JS |
|---|---|---|
| `vis--meta` | Texto do anúncio (`.post__big`, `.post__small`), cartões "Alcance" e "Leads hoje" | `meta()`: corações subindo e contador |
| `vis--google` | Texto digitado (`.typed[data-text]`), anúncio (`.gresult--ad`), concorrentes | `google()`: digitação e anúncio aparecendo |
| `vis--site` | Imagem em `.site-shot img` (1400px de largura, `.webp`), texto da barra do navegador | só CSS (zoom lento e reflexo) |
| `vis--crm` | Nomes das colunas (`h5`), cartão `.kcard--moving` | `crm()`: cartão atravessa as colunas |
| `vis--video` | `<video>` com `<source>` MP4 + WebM e capa | `video()`: play/pause e linha do tempo sincronizada |
| `vis--gmb` | Busca (`.gchip`), lista `.lp` (1º perfil otimizado + 2 concorrentes), etiqueta "Exemplo" | `gmb()`: perfil sobe de 3º para 1º em loop |

Os cartões flutuantes (`.float-card`) mostram métricas ilustrativas. Use números plausíveis e genéricos, ou números reais do cliente. Nunca atribua métricas inventadas à empresa como se fossem dela.

### Criar um visual novo

1. Em `index.html`, crie `<div class="vis vis--novo">…</div>` dentro de `.svc__visual` e dê `data-svc="novo"` ao `.svc`.
2. No CSS, use `--u` com `container-type: inline-size` (veja `.vis--gmb`) para que tudo escale junto no celular.
3. Se precisar de JS, adicione `novo() { …; return () => { /* parar */ }; }` em `LOOPS`.
4. Animações CSS que dependem de estar visível usam `.svc.is-in .vis--novo …`.

## Regras de movimento

- O GSAP anima `transform` só em elementos sem `transition: transform` no CSS. Quando houver as duas coisas, anime o contêiner com o GSAP e deixe o hover no item.
- Respeite `prefers-reduced-motion`: `main.js` já desliga Lenis, pin e animações, e mostra tudo estático.
- No celular, a cena 3D usa menos partículas e opacidade menor no hero. Não aumente.
