// src/client/config/site.config.ts
// ⚠️ PREENCHA ESSES DADOS PARA CADA CLIENTE

export const siteConfig = {
  // Nome do negócio
  nome: "Nome do Negócio",

  // WhatsApp com DDI + DDD + número (só números)
  whatsapp: "5521999999999",

  // Mensagem padrão ao abrir o WhatsApp
  whatsappMensagem: "Olá! Vim pelo site e gostaria de mais informações.",

  // Redes sociais (deixe vazio "" se não tiver)
  instagram: "@instagram",
  facebook: "",
  tiktok: "",

  // Localização
  cidade: "Cidade, Estado",

  // SEO — aparece no Google
  seo: {
    titulo: "Nome do Negócio – Slogan curto",
    descricao: "Descrição do negócio para aparecer no Google. Máximo 160 caracteres.",
    url: "https://www.seudominio.com.br",
  },

  // Cor principal do tema (usada em botões, destaques)
  corPrimaria: "#000000",
}