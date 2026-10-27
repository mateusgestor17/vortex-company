# Briefing do cliente

Peça tudo de uma vez, numa lista curta. Comece com o que está disponível e marque o que falta. Nunca preencha lacunas com dados inventados.

## Obrigatório para começar

| Item | Exemplo | Onde entra |
|---|---|---|
| Nome da empresa | Vortex Company | título, logo, rodapé, JSON-LD |
| Segmento e especialidade | Agência de marketing; foco em prestadores de serviço | hero, sobre, textos dos serviços |
| Cidade / região de atendimento | Joinville e região | hero, localização, SEO |
| WhatsApp (com DDD) | (47) 99162-5752 → `5547991625752` | `data.js`, rodapé, CTA |
| Horário | Seg a sáb, 9h às 18h; domingo fechado | `data.js` (`horario`), `.hours`, rodapé, JSON-LD |
| CNPJ | 68.063.725/0001-62 | rodapé, JSON-LD (`taxID`) |
| Domínio | vortexcompanybr.com.br | canonical, sitemap, Open Graph, Cloudflare |
| Logo (PNG/JPG, de preferência fundo liso) | 2–5 variações | `scripts/vetorizar_logo.py` |
| Serviços (3 a 6) | Meta Ads, Google Ads, Sites, CRM, Vídeos, Google Meu Negócio | seção Serviços |
| Método / como funciona (5 etapas) | Descoberta, Atenção, Consideração, Vendas, Apologia | seção Jornada (pinada, com a cena 3D) |

## Desejável (pode chegar depois)

- **Link de incorporação do Google Meu Negócio.** No Google Maps: Compartilhar → Incorporar um mapa → copiar o `src`. Serve para o mapa e o CID.
- **Números reais:** tempo de mercado, clientes atendidos, obras feitas, nota no Google. Só use o que o cliente confirmar.
- **Prints de feedback** (WhatsApp, painéis de resultado). Formato 9:16 é o ideal.
- **Fotos reais** de trabalhos, equipe ou fachada, e um print de site, se o cliente vende sites.
- **Cores da marca**, se forem diferentes do logo.
- **Instagram e outras redes.**
- **Diferenciais:** garantia, atendimento 24h, orçamento no mesmo dia, área atendida.

## Perguntas rápidas para o cliente (copiar e colar)

```
Para montar o site preciso de:
1. Nome da empresa e o que vocês fazem (em 1 frase)
2. Cidade/região que atendem
3. WhatsApp e horário de atendimento (dias e horas)
4. CNPJ
5. Domínio (ex.: suaempresa.com.br) — está no Cloudflare?
6. Logo em boa qualidade
7. Lista de serviços (3 a 6) e, se tiver, o passo a passo de como vocês trabalham
8. Números reais que podemos mostrar (anos de mercado, clientes, nota no Google)
9. Prints de feedbacks/resultados de clientes
10. Link do Google Meu Negócio
```

## Mapeamento rápido para `data.js`

```js
window.SITE = {
  whatsapp: "5547991625752",
  whatsappMessage: "Olá! Vim pelo site e quero um orçamento.",
  horario: { dias: [1, 2, 3, 4, 5, 6], abre: "09:00", fecha: "18:00" }, // 0 = domingo
  fuso: "America/Sao_Paulo",
  depoimentos: [],
  feedbacks: [ { src: "assets/feedbacks/feedback-01.webp", alt: "...", destaque: "..." } ],
};
```
Atendimento 24h: `horario: { dias: [0,1,2,3,4,5,6], abre: "00:00", fecha: "24:00" }`.
