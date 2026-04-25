// src/client/config/site.config.ts
// ⚠️ PREENCHA ESSES DADOS PARA CADA CLIENTE

export const siteConfig = {
  nome: "Nome do Negócio",

  // Logo
  logoHorizontal: "/logo-horizontal.png",
  logoVertical: "/logo-vertical.png",
  logoAlt: "Logo do negócio",

  // WhatsApp
  whatsapp: "5521999999999",
  whatsappDisplay: "(21) 99999-9999",
  whatsappMensagem: "Olá! Vim pelo site e gostaria de mais informações.",

  // Header
  headerCta: "Fale conosco",

  // Redes sociais
  instagram: "@instagram",
  facebook: "",
  tiktok: "",

  cidade: "Cidade, Estado",

  // Navegação desktop
  navLinks: [
    { label: "Início",   href: "/" },
    { label: "Sobre",    href: "/sobre" },
    { label: "Loja",     href: "/loja" },
  ],

  // Navegação mobile
  mobileNavLinks: [
    { label: "Início",   href: "/" },
    { label: "Sobre",    href: "/sobre" },
    { label: "Loja",     href: "/loja" },
    { label: "Carrinho", href: "/loja/carrinho" },
    { label: "Contato",  href: "/contato" },
  ],

  // Footer — benefícios
  benefits: [
    { title: "Benefício 1", description: "Descrição do benefício" },
    { title: "Benefício 2", description: "Descrição do benefício" },
    { title: "Benefício 3", description: "Descrição do benefício" },
  ],

  // Footer — links
  footerNavLinks: [
    { label: "Início",  href: "/" },
    { label: "Sobre",   href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ],

  footerDescription: "Descrição do seu negócio aqui.",
  copyrightTagline: "",

    seo: {
    titulo: "Nome do Negócio – Slogan curto",
    descricao: "Descrição do negócio...",
    url: "https://www.seudominio.com.br",
    ogImage: "/og-image.png",        // ← adicionar
    keywords: [                       // ← adicionar
        "palavra-chave 1",
        "palavra-chave 2",
    ],
    },

  // ─── TEMA VISUAL ────────────────────────────────────────
  theme: {
    bgPrimary:       "#000000",
    bgSecondary:     "#0B0B0B",
    bgTertiary:      "#111111",
    bgCard:          "#1a1a1a",
    bgHover:         "#222222",
    overlay:         "#0A0A0F",   // hero overlay

    textPrimary:     "#EADCC6",
    textSecondary:   "#D6C7A8",
    textTertiary:    "#B8A98A",
    textMuted:       "#9ca3af",   // gray-400
    textLight:       "#ffffff",
    textHeroMuted:   "#d1d5db",   // gray-300

    accent:          "#6C63FF",
    accentHover:     "#5A52E0",
    accentLight:     "#A78BFA",   // texto hover, destaques

    error:           "#dc2626",
    success:         "#16a34a",
    info:            "#6C63FF",

    border:          "#333333",
    borderLight:     "#444444",

    adminBg:         "#1a1a1a",
    adminText:       "#EADCC6",
    adminBorder:     "#333333",
  },

}