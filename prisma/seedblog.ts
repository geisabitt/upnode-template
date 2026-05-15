// prisma/seedBlogArtesanato.ts

import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧹 Resetando blog...')

  await prisma.postSEO.deleteMany()
  await prisma.post.deleteMany()
  await prisma.blogCategory.deleteMany()

  console.log('✅ Blog limpo!')

  // ─────────────────────────────────────────
  // 📂 CATEGORIAS COM IMAGEM (HOME)
  // ─────────────────────────────────────────
  const [presentes, acessorios, estilo] = await Promise.all([
    prisma.blogCategory.create({
      data: {
        name: 'Presentes Artesanais',
        slug: 'presentes-artesanais',
        description: 'Ideias de presentes artesanais personalizados e feitos à mão.',
        image: '/produtos/toalha-bordada-nome-personalizado.jpg',
        showOnHome: true,
        featured: true,
        order: 1,
      },
    }),

    prisma.blogCategory.create({
      data: {
        name: 'Acessórios Artesanais',
        slug: 'acessorios-artesanais',
        description: 'Colares, pulseiras e acessórios artesanais exclusivos.',
        image: '/produtos/colar-ajustavel-madeira-micanga.jpg',
        showOnHome: true,
        featured: false,
        order: 2,
      },
    }),

    prisma.blogCategory.create({
      data: {
        name: 'Estilo e Segurança',
        slug: 'estilo-e-seguranca',
        description: 'Acessórios que unem estilo e segurança no dia a dia.',
        image: '/produtos/Cordinha-de-celular-phone-strap-guarda-celular-salva-celular-pulseira-de-celular-de-miçanga.jpg',
        showOnHome: true,
        featured: false,
        order: 3,
      },
    }),
  ])

  // ─────────────────────────────────────────
  // 📝 POSTS (SEO FORTE)
  // ─────────────────────────────────────────
  const posts = [
    {
      title: 'Presentes artesanais personalizados: ideias únicas para surpreender',
      slug: 'presentes-artesanais-personalizados',
      excerpt: 'Descubra ideias de presentes artesanais personalizados feitos à mão.',
      content: `
## Presentes artesanais personalizados: por que escolher?

Os presentes artesanais têm um valor único. Cada peça é feita à mão, carregando significado, exclusividade e cuidado em cada detalhe.

## Ideias de presentes artesanais

- Toalhas bordadas com nome
- Kits personalizados
- Pulseiras com letras

## Vantagens

- Produto único
- Feito à mão
- Valor emocional alto

## Onde comprar?

Prefira lojas especializadas em artesanato, com produção própria e personalizada.
      `,
      categoryId: presentes.id,
      seo: {
        metaTitle: 'Presentes artesanais personalizados: ideias únicas',
        metaDesc: 'Veja ideias de presentes artesanais personalizados feitos à mão.',
        keywords: 'presentes artesanais, presente personalizado, feito à mão',
      },
    },

    {
      title: 'Acessórios artesanais: estilo único com peças feitas à mão',
      slug: 'acessorios-artesanais-estilo',
      excerpt: 'Conheça acessórios artesanais que combinam estilo e exclusividade.',
      content: `
## Acessórios artesanais: tendência que cresce

Os acessórios artesanais estão cada vez mais populares por sua autenticidade.

## Tipos mais buscados

- Colares de miçanga
- Pulseiras artesanais
- Peças ajustáveis

## Por que escolher?

- Exclusividade
- Estilo único
- Produção sustentável

## Conclusão

Quem usa artesanal se destaca com autenticidade.
      `,
      categoryId: acessorios.id,
      seo: {
        metaTitle: 'Acessórios artesanais: estilo único',
        metaDesc: 'Descubra acessórios artesanais feitos à mão com design exclusivo.',
        keywords: 'acessórios artesanais, colares, pulseiras feitas à mão',
      },
    },

    {
      title: 'Cordinha de celular: mais segurança e estilo no dia a dia',
      slug: 'cordinha-de-celular-seguranca',
      excerpt: 'Entenda como a cordinha de celular pode proteger seu aparelho.',
      content: `
## O que é cordinha de celular?

A cordinha de celular é um acessório que evita quedas e facilita o uso.

## Benefícios

- Evita quedas
- Mais segurança
- Estilo moderno

## Vale a pena?

Sim, é um acessório funcional e estiloso que vem crescendo muito.

## Conclusão

Ideal para quem quer praticidade com estilo.
      `,
      categoryId: estilo.id,
      seo: {
        metaTitle: 'Cordinha de celular: segurança e estilo',
        metaDesc: 'Descubra como a cordinha de celular protege e traz estilo.',
        keywords: 'cordinha de celular, phone strap, segurança celular',
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
        published: true,
        seo: {
          create: p.seo,
        },
      },
    })
  }

  console.log('🎉 Blog com imagens e SEO pronto!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })