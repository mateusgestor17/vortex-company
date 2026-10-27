# Publicação: GitHub + Cloudflare Pages + domínio

## Estrutura esperada do repositório

```
public/            ← tudo que vai para o ar (index.html, assets/, _headers, robots.txt, sitemap.xml)
wrangler.toml      ← name = "<projeto>", pages_build_output_dir = "./public"
README.md
```

## Passo a passo

1. **Repositório no GitHub.** Em sessões remotas do Claude Code, criar repositório costuma ser bloqueado. Peça ao usuário para criar um **vazio** em github.com/new, anexe com a ferramenta de adicionar repositório e faça `git remote add origin … && git push -u origin main`.
2. **Projeto no Cloudflare (o usuário faz, ou você via API se houver token):**
   - **Workers & Pages → Create → aba Pages** (se só aparecer Workers, use o link "Looking to deploy Pages? Get started") → **Connect to Git** → escolher o repositório.
   - Framework preset **None**, Build command **vazio**, Build output directory **`public`** (o `wrangler.toml` também define isso).
   - **Save and Deploy.**
3. **Domínio:** no projeto, **Custom domains → Set up a custom domain** → `dominio.com.br`, e repita com `www.dominio.com.br`. Se o domínio já está na mesma conta do Cloudflare, o DNS é criado sozinho. Subdomínios de outros projetos (crm., sistema. etc.) não são afetados.
4. **Acompanhar o build:** `bash scripts/status_deploy.sh dono/repositorio`. Ele lê os checks que o Cloudflare publica no GitHub e mostra "Deploy successful!" ou "Build failed", com a URL de prévia `*.pages.dev`.

## Publicar atualizações

1. Suba a versão nos links do `index.html`: `style.css?v=…`, `data.js?v=…`, `cena3d.js?v=…`, `main.js?v=…` (ex.: `20261027a`).
2. Rode os testes (capturas, `teste_rolagem.js`, `verificar_restos.sh`).
3. `git commit` e `git push`. O Cloudflare publica sozinho em cerca de 1 minuto.
4. Peça ao usuário para recarregar com **Ctrl + F5** na primeira visita.

## Com token de API (automação total)

Se o ambiente tiver `CLOUDFLARE_API_TOKEN` (permissões: Account → Cloudflare Pages → Edit; Zone → DNS → Edit) e `CLOUDFLARE_ACCOUNT_ID`, e a rede liberar `api.cloudflare.com`:
```bash
npx -y wrangler@4 pages project create <projeto> --production-branch main
npx -y wrangler@4 pages deploy public --project-name <projeto> --branch main
curl -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/<projeto>/domains" -d '{"name":"dominio.com.br"}'
```
Nunca peça para o usuário colar o token no chat. Ele deve ser configurado como variável de ambiente.

## Problemas comuns

| Problema | O que fazer |
|---|---|
| Log com `npx wrangler deploy` e "Missing entry-point to Worker script" | Foi criado um **Worker**. Crie o projeto como **Pages** e exclua o Worker. |
| Build "success", mas o domínio dá 404 | O output directory não é `public`. Confira o `wrangler.toml` ou as configurações de build. |
| Site novo com estilos ou código velhos, imagens gigantes, travamento | Cache. Suba `?v=` e confira `_headers` (`/assets/*` com `max-age=3600, must-revalidate`). |
| Domínio "pendente" por muito tempo | O DNS do domínio não está no Cloudflare, ou já existe um registro A/CNAME conflitante. Peça um print da aba DNS. |
| Cadeado (SSL) não aparece | Espere alguns minutos depois de ativar o domínio. |
