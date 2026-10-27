# Seções do site e como adaptá-las ao segmento

O `template/site/index.html` vem com o conteúdo da Vortex Company (agência de marketing) como exemplo completo. Reescreva **todo** o texto. Depois, `scripts/verificar_restos.sh` acusa o que ficou para trás.

## Ordem das seções

1. **Loader:** logo girando e contador de 0 a 100%. Não precisa mexer.
2. **Nav:** logo (ícone + nome), links e botão "Fale com a gente" (WhatsApp).
3. **Hero (`#inicio`):** eyebrow, título em 3 linhas (uma palavra em `<em>`, que vira serifa itálica), subtítulo, 2 botões e 3 números.
4. **Marquee:** faixa com os nomes dos serviços passando.
5. **Sobre (`#sobre`):** frase grande que acende palavra por palavra, 3 cartões (missão, especialidade, diferencial) e 3 números grandes.
6. **Jornada (`#jornada`):** título e 5 etapas pinadas; a cena 3D muda de forma a cada etapa.
7. **Serviços (`#servicos`):** 6 blocos `.svc`, cada um com visual animado, título, texto e 3 itens.
8. **Como trabalhamos:** 4 passos com linha do tempo.
9. **Feedbacks (`#depoimentos`):** carrossel de prints (some sozinho se a lista estiver vazia).
10. **CTA:** frase grande e botão grande de WhatsApp.
11. **Localização (`#contato`):** status aberto/fechado, tabela de horário, contatos e mapa.
12. **Rodapé:** logo, colunas de navegação, serviços e contato, "VORTEX" gigante vazado (troque pelo nome), copyright e CNPJ.

## Fórmulas de texto

- **Título do hero:** um verbo e o resultado que o cliente final quer, com a palavra-chave em `<em>`.
  - Agência: "Transformamos *atenção* em vendas."
  - Vidraçaria: "Vidro sob medida, *sem dor de cabeça*."
  - Desentupidora: "Desentupimos *hoje*, sem quebra-quebra."
  - Clínica odontológica: "Seu sorriso *sem medo* de dentista."
  - Advocacia: "Seus direitos, *explicados* e defendidos."
- **Subtítulo:** como você entrega, em uma frase, mais a região.
- **Números do hero:** só números reais. Se não houver, use fatos verificáveis ("24h", "Garantia", "Orçamento grátis"), mudando o formato `<strong>` + `<small>`.
- **Sobre:** a frase grande diz quem são, há quanto tempo e para quem, terminando com uma convicção. Os cartões trazem missão, especialidade e como trabalham.
- **CTA final:** uma pergunta ou convite ligado ao segmento ("Vamos fazer sua empresa girar?", "Pronto para o box novo?").

## Jornada: 5 etapas por segmento

A seção é o "método" da empresa. Mantenha **5 etapas**, porque a cena 3D tem 5 formas de etapa. Exemplos:

| Segmento | Etapas |
|---|---|
| Agência de marketing | Descoberta · Atenção · Consideração · Vendas · Apologia |
| Vidraçaria / esquadrias | Contato · Medição · Projeto · Fabricação · Instalação |
| Desentupidora | Chamado · Diagnóstico · Orçamento · Serviço · Garantia |
| Clínica odontológica / estética | Agendamento · Avaliação · Plano · Tratamento · Acompanhamento |
| Advocacia | Consulta · Análise · Estratégia · Ação · Resultado |
| Construtora / reformas | Visita · Projeto · Orçamento · Obra · Entrega |
| Restaurante / delivery | Cardápio · Pedido · Preparo · Entrega · Avaliação |

Cada `.jstep` tem: número grande, kicker ("Etapa 01 · Nome"), título com `<em>`, parágrafo e 3 tags. Os nomes curtos também aparecem em `.journey__progress`.

## Serviços: visuais disponíveis

São 6 blocos `.svc[data-svc=...]`, e cada `data-svc` tem um visual pronto (detalhes em `animacoes.md`):

| `data-svc` | Visual | Serve para |
|---|---|---|
| `meta` | Celular com anúncio patrocinado e corações subindo | redes sociais, Instagram, promoções |
| `google` | Busca sendo digitada e anúncio no topo, com gráfico | Google Ads, ser encontrado |
| `site` | Navegador com print real de site (Ken Burns e reflexo) | sites, portfólio, catálogo, fotos de obras |
| `crm` | Kanban com cartão passando de "Novo lead" até "Fechado" | processos, atendimento, agendamento, etapas |
| `video` | Player com o vídeo em motion graphics e linha do tempo | vídeos, institucional, apresentação |
| `gmb` | Busca no Google Maps com perfil subindo de 3º para 1º | presença local, "perto de mim" |

Para outros segmentos, **reaproveite os visuais trocando o conteúdo**:
- **Vidraçaria:** `site` com foto de obra no lugar do print; `crm` com colunas "Orçamento → Medição → Produção → Instalado".
- **Desentupidora:** `gmb` com "desentupidora perto de mim"; `crm` com "Chamado → A caminho → Em serviço → Resolvido"; `meta` com "Atendimento 24h".
- **Clínica:** `crm` com "Agendado → Avaliação → Tratamento → Retorno"; `site` com foto do consultório; `gmb` com "dentista perto de mim".

Menos de 6 serviços: remova o bloco `.svc` inteiro. Os índices (`svc__idx`) devem ficar em sequência.

## Como trabalhamos

São 4 passos curtos (título e 1 frase). Não repita a jornada: aqui é o relacionamento (diagnóstico, proposta, execução, acompanhamento).

## Localização

- `#openStatus` é atualizado pelo `data.js` (`horario`).
- Cada linha de `.hours` precisa de `data-dias` com os dias que cobre, para marcar "hoje". Exemplo: `<div data-dias="1,2,3,4,5,6"><dt>Segunda a sábado</dt><dd>09h às 18h</dd></div>`.
- Os links do Maps usam o CID. Sem Google Meu Negócio, troque o iframe pelo mapa da cidade, ou remova a coluna do mapa e centralize as informações.

## SEO mínimo

- `<title>`: "Empresa — o que faz em Cidade".
- `meta description`: até cerca de 155 caracteres, com cidade e serviço principal.
- JSON-LD: escolha o `@type` do schema.org mais específico (`MarketingAgency`, `Plumber`, `Dentist`, `LegalService`, `HomeAndConstructionBusiness`, `GeneralContractor` etc.). Inclua `telephone`, `taxID`, `openingHoursSpecification`, `hasMap`, `areaServed` e `url`.
- `og:image`: gerada por `scripts/gerar_icones.js`.
