---
name: site-premium-empresas
description: Cria um site institucional premium (página única, animações 3D guiadas pelo scroll, serviços com visuais animados, vídeo em motion graphics, feedbacks em carrossel, horário ao vivo, WhatsApp) para qualquer empresa ou segmento, e publica no Cloudflare Pages com domínio próprio. Use quando o usuário pedir para criar, replicar ou adaptar um "site profissional", "site premium", "site igual ao da Vortex", "landing page com animações" ou "site para um cliente" (agência, vidraçaria, desentupidora, clínica, advocacia, estética, construtora, etc.), ou para colocar um site desses no ar num domínio do Cloudflare.
---

# Site premium para empresas

Esta skill replica o processo usado no site da Vortex Company (vortexcompanybr.com.br): um site estático (HTML, CSS e JS puros, sem build), com:

- **Hero** com uma cena 3D de partículas (Three.js) que se transforma conforme o scroll.
- **Método/jornada em etapas** com a seção pinada; as partículas mudam de forma a cada etapa.
- **Serviços**, cada um com um visual animado próprio: celular com anúncio, busca no Google, print de site no navegador, kanban de CRM, player com vídeo real e ranking no Google Maps.
- **Vídeo em motion graphics** de 10 s, gerado por script (MP4 + WebM).
- **Feedbacks** em carrossel, com visualizador ampliado.
- **Localização**: mapa, horário com aviso "Aberto agora" ou "Fechado" ao vivo, WhatsApp em vários pontos e CNPJ no rodapé.
- **Responsivo** e testado em celular (390px) e computador (1440px).

Tudo vem em `template/` (o site-modelo) e `scripts/` (ferramentas). Leia as referências quando chegar na etapa correspondente:

| Etapa | Referência |
|---|---|
| Coletar dados do cliente | `references/briefing.md` |
| Escrever e adaptar as seções ao segmento | `references/secoes.md` |
| Mexer na cena 3D e nos visuais dos serviços | `references/animacoes.md` |
| Publicar (GitHub + Cloudflare) e resolver problemas | `references/publicacao.md` |

## Regras que não mudam

1. **Nada inventado sobre a empresa.** Números ("+100 clientes"), notas do Google, depoimentos e resultados só entram se o cliente informou ou se estão nos prints que ele mandou. Se faltar, deixe de fora ou pergunte. Exemplos ilustrativos (como o ranking do Google Maps com empresa fictícia) levam a etiqueta visível "Exemplo".
2. **Texto em português do Brasil**, direto, focado no cliente final do segmento. Nada de "lorem ipsum".
3. **WhatsApp é a conversão principal.** Todo `data-wa` recebe o link `wa.me` montado em `assets/js/data.js`.
4. **Testar antes de publicar**: capturas no computador e no celular, mais o teste de rolagem com a roda do mouse (passo 8).
5. **A cada publicação, suba a versão `?v=` dos CSS/JS no `index.html`.** Sem isso, o navegador mistura a página nova com o código antigo e o site quebra ou trava.

## Fluxo de trabalho

### 1. Briefing
Siga `references/briefing.md`. O mínimo para começar:
- nome da empresa, segmento, cidade ou região, WhatsApp, horário, CNPJ e domínio;
- logo em imagem;
- lista de serviços e as etapas do método (ou "como funciona").

O resto pode chegar depois: link do Google Meu Negócio, prints de feedback, print de um site para a vitrine e números reais.

### 2. Criar o projeto
```bash
SKILL=<pasta desta skill>
mkdir -p NOVO_PROJETO && cp -r "$SKILL/template/site" NOVO_PROJETO/public && cp "$SKILL/template/wrangler.toml" NOVO_PROJETO/
cd NOVO_PROJETO && git init -b main
```
No `wrangler.toml`, troque `name` pelo nome do projeto no Cloudflare. Ele deve conter `pages_build_output_dir = "./public"`.

### 3. Marca
```bash
pip install potracer pillow numpy
python3 -I "$SKILL/scripts/vetorizar_logo.py" logo.png public/assets/logo-completo.svg
python3 -I "$SKILL/scripts/vetorizar_logo.py" logo.png public/assets/logo-icone.svg --crop x0,y0,x1,y1   # só o símbolo
python3 -I "$SKILL/scripts/vetorizar_logo.py" logo.png public/assets/logo-nome.svg  --crop x0,y0,x1,y1   # só o nome
node "$SKILL/scripts/gerar_icones.js" public/assets "Headline curta" "Segmento · cidade"
```
- Cada execução imprime um `aspect-ratio`. Cole-o em `.logo-mark`, `.logo-word` e `.footer__logo` no `style.css`.
- Os SVGs usam `currentColor`, então o logo herda a cor do texto.
- Se o cliente só tiver o logo combinado, recorte as partes com `--crop`. Confira o resultado numa captura.
- A paleta do modelo é preto e branco, com verde só no WhatsApp. Se a marca tiver uma cor forte, use-a como acento (destaques, `em`, gráficos), sem colorir tudo.

### 4. Conteúdo
Reescreva cada seção do `public/index.html` para o segmento, seguindo `references/secoes.md`. Preencha também:
- `public/assets/js/data.js`: WhatsApp, mensagem, `horario` (dias 0–6, abre/fecha), feedbacks;
- as linhas `.hours` com `data-dias`;
- `<title>`, meta description, Open Graph e JSON-LD (tipo de negócio do schema.org, telefone, `taxID`, horário, `hasMap`);
- `canonical`, `sitemap.xml` e `robots.txt` com o domínio novo;
- o mapa: o `src` do iframe é o link "Incorporar mapa" do Google Maps; o link "abrir no Maps" usa `https://maps.google.com/?cid=<CID>` (o CID é o segundo hexadecimal de `!1s0x...:0x...` no link de incorporação, convertido para decimal).

### 5. Animações
Adapte a cena 3D (`public/assets/js/cena3d.js`) e os visuais dos serviços ao segmento, seguindo `references/animacoes.md`. Mantenha as 5 etapas da jornada: o shader foi feito para 6 formas (hero + 5 etapas).

### 6. Vídeo em motion graphics
Copie `scripts/video-motion/config.exemplo.json`, troque frases, resultado (só um resultado real), CTA e telefone, e rode:
```bash
bash "$SKILL/scripts/video-motion/gerar_video.sh" config.json public/assets/video
```
O script gera `video-motion.mp4`, `video-motion.webm` e a capa `video-motion-poster.jpg`. Precisa de node, ffmpeg e Playwright com Chromium. Se o cliente não tiver um resultado numérico, troque o cartão por um benefício e tire o `selo`.

### 7. Feedbacks e vitrine
- **Prints de feedback**: salve em 9:16 (`.webp`, cerca de 941×1672) em `public/assets/feedbacks/` e liste em `data.js`. O `destaque` é uma frase curta com o resultado tirado do próprio print; some os valores quando ele lista várias vendas. Coloque os mais fortes primeiro.
- **Print de site para a seção "Criação de Sites"**: redimensione para 1400px de largura (`.webp`) e salve como `public/assets/sites/site-exemplo.webp`.
- Sem feedbacks, a seção se esconde sozinha. Não deixe espaços vazios.

### 8. Testar
```bash
(cd public && python3 -m http.server 8081 &)
node "$SKILL/scripts/capturas.js" http://localhost:8081/ 1440 900 /tmp/pc  y@0 .about@0 pin@0 pin@2.1 pin@4.2 .services@0 .fb@-200 .location@0
node "$SKILL/scripts/capturas.js" http://localhost:8081/ 390 844 /tmp/cel y@0 pin@1.05 '.svc[data-svc=site]@-60' '.svc[data-svc=gmb]@-60' .fb@-150 .footer@0
node "$SKILL/scripts/teste_rolagem.js" http://localhost:8081/ 1440 900
bash "$SKILL/scripts/verificar_restos.sh" public
```
Veja **todas** as capturas. No celular, confira:
- botões com a mesma largura;
- cartões flutuantes sem sobreposição;
- nada cortado na borda;
- o botão do WhatsApp não cobre o texto.

`teste_rolagem.js` deve terminar com "OK: chegou ao rodapé" e 0 erros. `verificar_restos.sh` deve dizer "OK".

Se `capturas.js` ou `teste_rolagem.js` não encontrarem o Playwright, aponte `PLAYWRIGHT_MODULE` para a pasta dele. No ambiente remoto do Claude Code, é `/opt/node-tools/node_modules/playwright`.

### 9. Publicar
Siga `references/publicacao.md`. Em resumo:
1. Repositório no GitHub. Se você não conseguir criar, peça ao usuário um repositório vazio.
2. `git push`.
3. No Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**. É **Pages**, não Worker. Build command vazio.
4. Em **Custom domains**, adicione o domínio e o `www`.
5. Acompanhe o build com `scripts/status_deploy.sh dono/repo`.

### 10. Entregar
Diga ao usuário o que foi feito, o que é exemplo ilustrativo e o que falta dele (prints, números, avaliação do Google). Lembre de recarregar com Ctrl+F5 na primeira visita após cada atualização.

## Armadilhas já encontradas (e como evitar)

| Sintoma | Causa | Solução |
|---|---|---|
| Imagens gigantes, seções "sem nada", rolagem travando depois de uma atualização | O navegador usou CSS/JS antigos do cache | Suba `?v=AAAAMMDDx` nos links de CSS/JS a cada publicação; `_headers` com `max-age=3600` em `/assets/*` (nunca 7 dias) |
| Rolagem trava numa seção | Erro de JS dentro de um `onUpdate` do GSAP (elemento removido) para o ticker e o Lenis | Os loops dos serviços ficam dentro de `try/catch` (`start()` em `main.js`); ao remover um elemento, remova também o código que o usa |
| Erro 404 no domínio, mas o build "deu certo" | Projeto Pages publicando a raiz em vez de `public/` | `pages_build_output_dir = "./public"` no `wrangler.toml` (ou "Build output directory" = `public`) |
| Build falha com "Missing entry-point to Worker script" | O projeto foi criado como **Worker** | Crie como **Pages** (link "Looking to deploy Pages?" na tela de criação) e exclua o Worker |
| Cartões presos alguns pixels abaixo do lugar | `transition: transform` em CSS brigando com `gsap.from({y})` no mesmo elemento | Anime `y` no contêiner e só `opacity` nos itens que têm transição de transform |
| Vídeo não toca no Chromium/Firefox | Só MP4 (H.264) | Use `<source>` MP4 + WebM; atributos `autoplay muted loop playsinline` |
| Mapa do Google não aparece em prévias (artefatos do claude.ai) | Iframes externos bloqueados ali | No site real funciona; em prévias, troque por um cartão com link para o Maps |
| Logo vetorizado "invertido" (fundo preenchido) | Polaridade errada no potrace | `vetorizar_logo.py` já detecta o fundo pelos cantos; se falhar, recorte com `--crop` para os cantos ficarem só com fundo |
