/* =========================================================
   Conteúdo editável — Vortex Company
   ---------------------------------------------------------
   Edite este arquivo para atualizar contatos, depoimentos e
   a galeria de feedbacks sem mexer no restante do site.
   ========================================================= */
window.VORTEX = {
  whatsapp: "5547991625752",
  whatsappMessage: "Olá! Vim pelo site da Vortex Company e quero saber como vender mais.",

  /* Depoimentos em texto (ex.: copiados das avaliações do Google).
     A seção só aparece quando houver pelo menos um item.
     Exemplo:
     { nome: "Nome do cliente", empresa: "Empresa / segmento", texto: "Depoimento...", estrelas: 5, foto: "assets/feedbacks/foto.jpg" }
  */
  depoimentos: [],

  /* Galeria de feedbacks (prints de conversas, avaliações etc.).
     Coloque as imagens na pasta assets/feedbacks/ e liste aqui.
     A galeria só aparece quando houver pelo menos um item.
     Exemplo:
     { src: "assets/feedbacks/cliente-01.jpg", alt: "Feedback do cliente X" }
  */
  feedbacks: [
    { src: "assets/feedbacks/feedback-01.webp", alt: "Painel de resultados de agosto: R$ 52.000 faturados com R$ 810,24 investidos, 178 leads e 200% da meta batida", destaque: "R$ 52 mil faturados com R$ 810 investidos" },
    { src: "assets/feedbacks/feedback-09.webp", alt: "Painel de anúncios: R$ 18.410 de faturamento em 30 dias com R$ 2.117,19 investidos, 46 vendas e ROAS de 8,7x", destaque: "+R$ 18 mil em 30 dias · ROAS 8,7x" },
    { src: "assets/feedbacks/feedback-04.webp", alt: "Conversa no WhatsApp com cliente: mais de R$ 20 mil em vendas em 15 dias com R$ 480 investidos", destaque: "+R$ 20 mil em 15 dias com R$ 480" },
    { src: "assets/feedbacks/feedback-06.webp", alt: "Conversa no WhatsApp com cliente listando vendas entre 24 e 26 de novembro que somam R$ 36.378", destaque: "R$ 36 mil em vendas em 3 dias" },
    { src: "assets/feedbacks/feedback-05.webp", alt: "Mensagem da cliente Thais, da Desentupidora DBM: 5 leads em um dia e 4 fechamentos após ajuste na campanha", destaque: "5 leads e 4 fechamentos em um dia" },
    { src: "assets/feedbacks/feedback-02.webp", alt: "Painel de resultados de agosto da Esquadri Zen: R$ 12.193 faturados em 7 dias com R$ 412 investidos", destaque: "R$ 12,1 mil em 7 dias de campanha" },
    { src: "assets/feedbacks/feedback-08.webp", alt: "Conversa no WhatsApp com a cliente Elisabeth: muitos chamados e uma venda de R$ 8.800", destaque: "Venda de R$ 8.800 em um dia" },
    { src: "assets/feedbacks/feedback-07.webp", alt: "Conversa com cliente da Online Desentupidora: três serviços fechados em um dia, somando R$ 1.860", destaque: "3 serviços fechados em um só dia" },
    { src: "assets/feedbacks/feedback-03.webp", alt: "Conversa no WhatsApp com cliente listando as vendas fechadas em fevereiro", destaque: "Vendas fechadas e registradas pelo cliente" },
  ],
};
