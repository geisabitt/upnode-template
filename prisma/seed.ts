// prisma/seed.ts
import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧹 Limpando banco...')

  await prisma.postSEO.deleteMany()
  await prisma.post.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productColor.deleteMany()
  await prisma.size.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customPage.deleteMany()
  await prisma.adminUser.deleteMany()

  console.log('✅ Banco limpo!')

  // ─────────────────────────────────────────
  // 🔐 ADMIN
  // ─────────────────────────────────────────
  await prisma.adminUser.create({
    data: {
      email: 'admin@upnode.com.br',
      passwordHash: await bcrypt.hash('upnode123', 10),
      role: 'admin',
    },
  })
  console.log('✅ Admin criado: admin@upnode.com.br / upnode123')

  // ─────────────────────────────────────────
  // 🛍️ CATEGORIAS DE PRODUTO
  // ─────────────────────────────────────────
  const [catSites, catMarketing, catSuporte] = await Promise.all([
    prisma.category.create({ data: { name: 'Sites Profissionais', slug: 'sites-profissionais' } }),
    prisma.category.create({ data: { name: 'Marketing Digital', slug: 'marketing-digital' } }),
    prisma.category.create({ data: { name: 'Suporte & Manutenção', slug: 'suporte-manutencao' } }),
  ])

  // ─────────────────────────────────────────
  // 🛍️ PRODUTOS (6 genéricos Upnode)
  // ─────────────────────────────────────────
  const produtos = [
    {
      name: 'Site Institucional',
      slug: 'site-institucional',
      description: 'Site profissional completo para apresentar seu negócio ao mundo. Inclui home personalizada, página sobre, formulário de contato e integração com WhatsApp.',
      price: 1497.00,
      stock: 99,
      handmade: false,
      categories: [catSites.id],
      colors: [{ name: 'Personalizado', hex: '#6C63FF' }],
      sizes: ['Básico', 'Completo'],
    },
    {
      name: 'Site com Loja Virtual',
      slug: 'site-com-loja-virtual',
      description: 'Tudo do site institucional mais uma loja completa: catálogo de produtos, carrinho, checkout e gestão de pedidos pelo painel admin.',
      price: 2497.00,
      stock: 99,
      handmade: false,
      categories: [catSites.id],
      colors: [{ name: 'Personalizado', hex: '#6C63FF' }],
      sizes: ['Completo'],
    },
    {
      name: 'Site com Blog SEO',
      slug: 'site-com-blog-seo',
      description: 'Site profissional com blog integrado e otimizado para ranqueamento no Google. Ideal para atrair clientes organicamente através de conteúdo.',
      price: 1997.00,
      stock: 99,
      handmade: false,
      categories: [catSites.id],
      colors: [{ name: 'Personalizado', hex: '#6C63FF' }],
      sizes: ['Completo'],
    },
    {
      name: 'Pacote Presença Digital',
      slug: 'pacote-presenca-digital',
      description: 'Pacote completo: site + blog + loja + painel admin + configuração de domínio + Google Analytics. Tudo pronto para gerar clientes.',
      price: 3497.00,
      stock: 99,
      handmade: false,
      categories: [catSites.id, catMarketing.id],
      colors: [{ name: 'Personalizado', hex: '#6C63FF' }],
      sizes: ['Completo'],
    },
    {
      name: 'Manutenção Mensal',
      slug: 'manutencao-mensal',
      description: 'Plano mensal de suporte: atualizações de conteúdo, correções, novos produtos, novos posts no blog e monitoramento do site.',
      price: 297.00,
      stock: 99,
      handmade: false,
      categories: [catSuporte.id],
      colors: [{ name: 'Padrão', hex: '#6C63FF' }],
      sizes: ['Mensal'],
    },
    {
      name: 'Consultoria de Marketing Digital',
      slug: 'consultoria-marketing-digital',
      description: 'Sessão de consultoria para definir estratégia de conteúdo, SEO local e presença digital para pequenos negócios.',
      price: 497.00,
      stock: 99,
      handmade: false,
      categories: [catMarketing.id],
      colors: [{ name: 'Padrão', hex: '#6C63FF' }],
      sizes: ['1h', '2h'],
    },
  ]

  for (const p of produtos) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        handmade: p.handmade,
        categories: { connect: p.categories.map((id) => ({ id })) },
        colors: { create: p.colors },
        sizes: { create: p.sizes.map((name) => ({ name })) },
        images: {
          create: [{ url: '/upnode-placeholder.png' }],
        },
      },
    })
  }
  console.log('✅ 6 produtos criados!')

  // ─────────────────────────────────────────
  // 📝 BLOG — CATEGORIAS
  // ─────────────────────────────────────────
  const [blogSEO, blogVendas, blogPresenca] = await Promise.all([
    prisma.blogCategory.create({
      data: {
        name: 'SEO e Google',
        slug: 'seo-e-google',
        description: 'Como aparecer no Google e atrair clientes pelo seu site.',
        showOnHome: true,
        featured: true,
        order: 1,
      },
    }),
    prisma.blogCategory.create({
      data: {
        name: 'Vendas Online',
        slug: 'vendas-online',
        description: 'Estratégias para vender mais pelo seu site e loja virtual.',
        showOnHome: true,
        featured: false,
        order: 2,
      },
    }),
    prisma.blogCategory.create({
      data: {
        name: 'Presença Digital',
        slug: 'presenca-digital',
        description: 'Como construir uma presença online sólida para o seu negócio.',
        showOnHome: true,
        featured: false,
        order: 3,
      },
    }),
  ])

  // ─────────────────────────────────────────
  // 📝 BLOG — POSTS
  // ─────────────────────────────────────────
  const posts = [
    {
      title: 'Como aparecer no Google sem pagar por anúncios',
      slug: 'como-aparecer-no-google-sem-pagar-anuncios',
      excerpt: 'Descubra como o SEO pode colocar o seu negócio na primeira página do Google gratuitamente.',
      content: `## O que é SEO e por que importa para o seu negócio?

SEO (Search Engine Optimization) é o conjunto de técnicas que fazem o seu site aparecer nos primeiros resultados do Google quando alguém pesquisa pelo seu produto ou serviço.

## Por que isso é tão poderoso?

Quando alguém pesquisa "vidraçaria em [sua cidade]" ou "petshop perto de mim", o Google mostra os sites mais relevantes. Se o seu negócio aparecer ali, você recebe visitas gratuitas todos os dias — sem pagar por anúncios.

## Como o UpNode ajuda nisso?

Todos os sites criados pelo UpNode já vêm com:

- URLs amigáveis para o Google
- Metadados otimizados por página
- Blog integrado para publicação de conteúdo
- Schema.org para negócios locais
- Sitemap automático

## Dica prática

Escreva um artigo por semana respondendo perguntas que seus clientes fazem. Com o tempo, seu site começa a aparecer no Google para essas buscas.`,
      categoryId: blogSEO.id,
      published: true,
      seo: {
        metaTitle: 'Como aparecer no Google sem pagar anúncios | UpNode',
        metaDesc: 'Aprenda como o SEO pode colocar seu negócio na primeira página do Google de forma gratuita.',
        keywords: 'SEO, Google, pequenos negócios, aparecer no Google',
      },
    },
    {
      title: 'Loja virtual para pequenos negócios: vale a pena?',
      slug: 'loja-virtual-pequenos-negocios-vale-a-pena',
      excerpt: 'Entenda como uma loja virtual pode aumentar suas vendas mesmo que você já venda pelo WhatsApp ou Instagram.',
      content: `## Você já vende pelo WhatsApp. Por que ter uma loja virtual?

Vender pelo WhatsApp e Instagram funciona — mas tem limites. Sem uma loja virtual, você depende de estar sempre disponível para responder, não tem catálogo organizado e perde vendas enquanto dorme.

## O que uma loja virtual resolve?

- Catálogo sempre disponível, 24 horas por dia
- Cliente escolhe, adiciona ao carrinho e finaliza sozinho
- Você recebe o pedido organizado com nome, endereço e itens
- Histórico de pedidos para acompanhar

## Não precisa ser grande para valer a pena

Mesmo negócios pequenos se beneficiam. Uma artesã que vende 10 peças por mês pode passar para 30 com uma loja organizada e fácil de navegar.

## Como o UpNode entrega isso?

A loja UpNode vem com catálogo, carrinho, checkout, cálculo de frete e painel admin para gerenciar produtos e pedidos. Tudo pronto, sem precisar de conhecimento técnico.`,
      categoryId: blogVendas.id,
      published: true,
      seo: {
        metaTitle: 'Loja virtual para pequenos negócios: vale a pena? | UpNode',
        metaDesc: 'Descubra como uma loja virtual pode aumentar suas vendas mesmo sendo um negócio pequeno.',
        keywords: 'loja virtual, pequenos negócios, vender online, e-commerce',
      },
    },
    {
      title: 'Por que todo negócio local precisa de um site profissional',
      slug: 'por-que-todo-negocio-local-precisa-de-site-profissional',
      excerpt: 'Instagram e WhatsApp não substituem um site. Entenda por que ter presença digital própria faz diferença.',
      content: `## Só ter Instagram não é suficiente

Muitos pequenos negócios apostam tudo no Instagram — e funciona até certo ponto. Mas quando alguém pesquisa no Google, perfis de Instagram raramente aparecem nos primeiros resultados.

## O que um site faz que o Instagram não faz?

- Aparece no Google quando alguém pesquisa pelo seu serviço
- Transmite mais credibilidade e profissionalismo
- Você é dono do seu espaço — não depende do algoritmo
- Tem páginas dedicadas para cada serviço ou produto
- Recebe pedidos e contatos de forma organizada

## O cliente decide em segundos

Quando alguém cai no seu site, você tem poucos segundos para convencer que vale a pena entrar em contato. Um site bem feito, rápido e claro faz isso automaticamente.

## UpNode foi criado para isso

Cada site UpNode é desenvolvido especificamente para o negócio do cliente — com foco em conversão, velocidade e ranqueamento no Google. Não é um template genérico, é uma presença digital feita para gerar clientes.`,
      categoryId: blogPresenca.id,
      published: true,
      seo: {
        metaTitle: 'Por que todo negócio local precisa de site profissional | UpNode',
        metaDesc: 'Instagram e WhatsApp não substituem um site. Saiba por que presença digital própria faz diferença.',
        keywords: 'site profissional, negócio local, presença digital, site para empresa',
      },
    },
  ]

  for (const p of posts) {
    await prisma.post.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        categoryId: p.categoryId,
        published: p.published,
        seo: { create: p.seo },
      },
    })
  }
  console.log('✅ 3 posts criados!')

  // ─────────────────────────────────────────
  // 📄 PÁGINAS CUSTOMIZADAS
  // ─────────────────────────────────────────
  await prisma.customPage.createMany({
    data: [
      {
        slug: 'sobre',
        title: 'Sobre a UpNode',
        introText: 'UpNode by BittUp é uma plataforma de sites profissionais para pequenos negócios, com foco em geração de clientes através de SEO, loja virtual e presença digital.',
        section1Title: 'Por que a UpNode existe?',
        section1Text: 'Pequenos negócios merecem sites tão bons quanto os das grandes empresas. A UpNode nasceu para tornar isso possível — com sites rápidos, bonitos, otimizados para o Google e fáceis de gerenciar, tudo a um custo acessível para quem está construindo seu negócio.',
      },
      {
        slug: 'personalizado',
        title: 'Cada site é único',
        introText: 'Não existe um site UpNode igual ao outro. Cada projeto é desenvolvido de acordo com a identidade, o público e os objetivos do negócio do cliente.',
        section1Title: 'O que muda em cada site?',
        section1Text: 'Cores, tipografia, layout da home, conteúdo das páginas, categorias da loja e do blog — tudo é configurado para refletir a personalidade do negócio. O sistema é o mesmo, a experiência é única.',
        faq: [
          {
            pergunta: 'Posso escolher as cores do meu site?',
            resposta: 'Sim! Cada site tem sua própria identidade visual com cores, fontes e estilo definidos junto com o cliente.',
          },
          {
            pergunta: 'O conteúdo do site é meu?',
            resposta: 'Sim. Textos, imagens, produtos e posts do blog são totalmente seus e podem ser editados pelo painel admin.',
          },
          {
            pergunta: 'Posso adicionar produtos e posts sozinho?',
            resposta: 'Sim! O painel admin foi desenvolvido para ser simples. Você adiciona produtos, escreve posts e acompanha pedidos sem precisar de conhecimento técnico.',
          },
          {
            pergunta: 'Meu site vai aparecer no Google?',
            resposta: 'Todos os sites UpNode já vêm otimizados para SEO. Com publicação regular de conteúdo no blog, seu site ganha posições no Google ao longo do tempo.',
          },
        ],
      },
    ],
  })
  console.log('✅ Páginas sobre e personalizado criadas!')

  console.log('')
  console.log('🎉 Seed completo! UpNode by BittUp pronto.')
  console.log('   Admin: admin@upnode.com.br / upnode123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })