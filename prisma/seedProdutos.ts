// prisma/seedProdutosArtesanato.ts

import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧹 Resetando produtos...')

  await prisma.productImage.deleteMany()
  await prisma.productColor.deleteMany()
  await prisma.size.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  console.log('✅ Produtos limpos!')

  const [pulseiras, colares, chaveiros, cordinhas, toalhas, kits] =
    await Promise.all([
      prisma.category.create({ data: { name: 'Pulseiras', slug: 'pulseiras' } }),
      prisma.category.create({ data: { name: 'Colares', slug: 'colares' } }),
      prisma.category.create({ data: { name: 'Chaveiros', slug: 'chaveiros' } }),
      prisma.category.create({ data: { name: 'Cordinhas para Celular', slug: 'cordinhas-celular' } }),
      prisma.category.create({ data: { name: 'Toalhas Bordadas', slug: 'toalhas-bordadas' } }),
      prisma.category.create({ data: { name: 'Kits Personalizados', slug: 'kits-personalizados' } }),
    ])

  const produtos = [
    // Pulseiras
    {
      name: 'Pulseira de Borboleta em Miçanga Colorida',
      slug: 'pulseira-borboleta-micanga-colorida',
      image: '/produtos/pulseira-borboleta-micanga-colorida.jpg',
      categoryId: pulseiras.id,
    },
    {
      name: 'Pulseira de Borboleta em Miçanga Variadas',
      slug: 'pulseira-borboleta-micanga-variadas',
      image: '/produtos/Pulseira-de-borboleta-micanga-varias-cores.jpg',
      categoryId: pulseiras.id,
    },
    {
      name: 'Pulseira de Estrela em Miçanga Colorida',
      slug: 'pulseira-estrela-micanga-colorida',
      image: '/produtos/pulseira-estrela-micanga-colorida.jpg',
      categoryId: pulseiras.id,
    },
    {
      name: 'Pulseira de Flor em Miçanga Colorida',
      slug: 'pulseira-flor-micanga-colorida',
      image: '/produtos/pulseira-flor-micanga-colorida.jpg',
      categoryId: pulseiras.id,
    },

    // Colar
    {
      name: 'Colar Ajustável de Madeira com Miçanga',
      slug: 'colar-ajustavel-madeira-micanga',
      image: '/produtos/colar-ajustavel-madeira-micanga.jpg',
      categoryId: colares.id,
    },

    // Chaveiro
    {
      name: 'Chaveiro Bordado em Ponto Cruz',
      slug: 'chaveiro-ponto-cruz-bordado',
      image: '/produtos/chaveiro-ponto-cruz-bordado.jpg',
      categoryId: chaveiros.id,
    },

    // Cordinhas
    {
      name: 'Cordinha para Celular em Miçanga',
      slug: 'cordinha-celular-micanga',
      image: '/produtos/cordinha-celular-micanga-simples.jpg',
      categoryId: cordinhas.id,
    },
    {
      name: 'Cordinha para Celular Simples',
      slug: 'cordinha-celular-simples',
      image: '/produtos/Cordinha-de-celular-phone-strap-guarda-celular-salva-celular-pulseira-de-celular-de-micanga.jpg',
      categoryId: cordinhas.id,
    },

    // Toalha
    {
      name: 'Toalha Bordada Personalizada com Nome',
      slug: 'toalha-bordada-nome-personalizado',
      image: '/produtos/toalha-bordada-nome-personalizado.jpg',
      categoryId: toalhas.id,
    },

    // Kit
    {
      name: 'Kit de Pulseiras com Letras Personalizadas',
      slug: 'kit-pulseira-letra-preto-branco',
      image: '/produtos/Kit-pulseira-letra-inicial-do-nome-preto-e-branco-simples-unissex-ajustavel-regulavel-1.jpg',
      categoryId: kits.id,
    },
  ]

  for (const p of produtos) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: `${p.name} feita à mão com materiais de qualidade. Produto artesanal exclusivo, ideal para presente.`,
        price: 25.00,
        stock: 50,
        handmade: true,
        categories: { connect: [{ id: p.categoryId }] },
        colors: { create: [{ name: 'Colorido', hex: '#FFFFFF' }] },
        sizes: { create: [{ name: 'Único' }] },
        images: { create: [{ url: p.image }] },
      },
    })
  }

  console.log('🎉 Seed final pronta!')
}

main().finally(() => prisma.$disconnect())