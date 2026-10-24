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
    { src: "assets/feedbacks/feedback-02.webp", alt: "Painel de resultados de agosto da Esquadri Zen: R$ 12.193 faturados em 7 dias com R$ 412 investidos", destaque: "R$ 12,1 mil em 7 dias de campanha" },
    { src: "assets/feedbacks/feedback-03.webp", alt: "Conversa no WhatsApp com cliente listando as vendas fechadas em fevereiro", destaque: "Vendas fechadas e registradas pelo cliente" },
    { src: "assets/feedbacks/feedback-04.webp", alt: "Conversa no WhatsApp com cliente: mais de R$ 20 mil em vendas em 15 dias com R$ 480 investidos", destaque: "+R$ 20 mil em 15 dias com R$ 480" },
  ],
};
