/* =========================================================
   Conteúdo editável do site
   Preencha com os dados da empresa. Ver references/briefing.md da skill.
   ========================================================= */
window.SITE = {
  // WhatsApp com DDI + DDD, só números. Ex.: "5547991625752"
  whatsapp: "55DDNUMERO",
  whatsappMessage: "Olá! Vim pelo site e quero um orçamento.",

  // Dias de atendimento: 0 = domingo ... 6 = sábado
  horario: { dias: [1, 2, 3, 4, 5], abre: "09:00", fecha: "18:00" },
  fuso: "America/Sao_Paulo",

  /* Depoimentos em texto (só use texto real enviado pelo cliente).
     { nome: "Nome", empresa: "Empresa / segmento", texto: "...", estrelas: 5, foto: "assets/feedbacks/foto.jpg" } */
  depoimentos: [],

  /* Prints de feedback em assets/feedbacks/ (formato 9:16, ex.: 941x1672 .webp).
     destaque = frase curta tirada do PRÓPRIO print (números somados do print, nada inventado).
     { src: "assets/feedbacks/feedback-01.webp", alt: "Descrição do print", destaque: "R$ 52 mil com R$ 810 investidos" } */
  feedbacks: [],
};
