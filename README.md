# Vortex Company — Site institucional

Site da **Vortex Company**, agência de marketing e vendas.
Estático (HTML, CSS e JavaScript puro), sem etapa de build — pronto para o Cloudflare Pages.

## Estrutura

```
index.html                 página única (todas as seções)
assets/css/style.css       estilos e animações em CSS
assets/js/main.js          scroll suave, animações, horário de atendimento
assets/js/vortex3d.js      cena 3D de partículas (vórtice que se transforma)
assets/js/data.js          ← CONTEÚDO EDITÁVEL: WhatsApp, depoimentos, feedbacks
assets/feedbacks/          ← coloque aqui os prints de feedback dos clientes
assets/vendor/             GSAP, ScrollTrigger, Lenis e Three.js (cópias locais)
assets/*.svg               logo vetorizado (ícone, nome e versão completa)
```

## Como editar

- **WhatsApp / mensagem padrão:** `assets/js/data.js` → `whatsapp` e `whatsappMessage`.
- **Depoimentos em texto:** `assets/js/data.js` → `depoimentos`. A seção só aparece com pelo menos um item.
- **Galeria de feedbacks:** envie as imagens para `assets/feedbacks/` e liste-as em `data.js` → `feedbacks`.
- **Horário:** texto em `index.html` (seção "Onde estamos" e rodapé); a lógica de "Aberto agora" está em `updateOpenStatus()` em `main.js`.

## Rodar localmente

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar no Cloudflare Pages (domínio vortexcompanybr.com.br)

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Escolha o repositório `vortex-company`.
3. Configuração de build: *Framework preset* **None**, *Build command* **vazio**, *Build output directory* **/**.
4. **Save and Deploy**.
5. No projeto, aba **Custom domains** → **Set up a custom domain** → `vortexcompanybr.com.br` (repita para `www.vortexcompanybr.com.br`).
   Como o domínio já está no Cloudflare, o DNS é configurado automaticamente.

A cada `git push` na branch `main`, o site é atualizado sozinho.
