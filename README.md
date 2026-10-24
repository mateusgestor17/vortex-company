# Vortex Company — Site institucional

Site da **Vortex Company**, agência de marketing e vendas.
Estático (HTML, CSS e JavaScript puro), sem etapa de build — pronto para o Cloudflare Pages.

## Estrutura

```
public/index.html                 página única (todas as seções)
public/assets/css/style.css       estilos e animações em CSS
public/assets/js/main.js          scroll suave, animações, horário de atendimento
public/assets/js/vortex3d.js      cena 3D de partículas (vórtice que se transforma)
public/assets/js/data.js          ← CONTEÚDO EDITÁVEL: WhatsApp, depoimentos, feedbacks
public/assets/feedbacks/          ← coloque aqui os prints de feedback dos clientes
public/assets/vendor/             GSAP, ScrollTrigger, Lenis e Three.js (cópias locais)
public/assets/*.svg               logo vetorizado (ícone, nome e versão completa)
```

## Como editar

- **WhatsApp / mensagem padrão:** `public/assets/js/data.js` → `whatsapp` e `whatsappMessage`.
- **Depoimentos em texto:** `public/assets/js/data.js` → `depoimentos`. A seção só aparece com pelo menos um item.
- **Galeria de feedbacks:** envie as imagens para `public/assets/feedbacks/` e liste-as em `data.js` → `feedbacks`.
- **Horário:** texto em `index.html` (seção "Onde estamos" e rodapé); a lógica de "Aberto agora" está em `updateOpenStatus()` em `main.js`.

## Rodar localmente

```bash
python3 -m http.server 8080 -d public
# abra http://localhost:8080
```

## Publicação (Cloudflare Workers)

O repositório está conectado a um Worker chamado `vortex-company` no Cloudflare.
A cada `git push` na branch `main`, o Cloudflare roda `npx wrangler deploy` e o site é atualizado.
A configuração está em `wrangler.toml`; arquivos que não devem ir para o ar ficam em `.assetsignore`.

Domínio: no Worker, **Settings → Domains & Routes → Add → Custom domain** → `vortexcompanybr.com.br`.
