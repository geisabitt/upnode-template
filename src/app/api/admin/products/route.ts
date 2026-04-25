import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/core/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '1')
  const perPage = Number(searchParams.get('perPage') || '10')

  const [total, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      include: { images: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ])

  return NextResponse.json({ total, page, perPage, products })
}

type AdminProductCreateRequest = {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  materials?: string
  handmade: boolean
  categories: string[]
  youtubeUrl?: string | null
  imageUrls: string[]
  colors?: { name: string; hex: string }[]
  sizes?: { name: string }[]
}

export async function POST(request: Request) {
  const body = (await request.json()) as AdminProductCreateRequest
  const { name, slug, description, price, stock, materials, handmade, categories, youtubeUrl, imageUrls, colors, sizes } = body

  if (!name || !slug || !description || typeof price !== 'number' || typeof stock !== 'number' || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return NextResponse.json({ message: 'Dados do produto incompletos.' }, { status: 400 })
  }

  try {
   const product = await prisma.product.create({
  data: {
    name,
    slug,
    description,
    price,
    stock,
    materials,
    handmade,
    youtubeUrl: youtubeUrl || null,

    categories:
      categories && categories.length > 0
        ? { connect: categories.map((categoryId) => ({ id: categoryId })) }
        : undefined,

    images: {
      createMany: {
        data: imageUrls.map((url) => ({ url })),
      },
    },

    colors: colors && colors.length > 0 ? {
      create: colors.map((color) => ({
        name: color.name,
        hex: color.hex,
      })),
    } : undefined,

    sizes: sizes && sizes.length > 0 ? {
      create: sizes.map((size) => ({
        name: size.name,
      })),
    } : undefined,
  },
  include: {
    categories: true,
    images: true,
    colors: true,
    sizes: true,
  },
})

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao criar produto:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Slug já existe. Use outro slug.' }, { status: 409 })
    }

    return NextResponse.json({ message: 'Erro interno ao criar produto.' }, { status: 500 })
  }
}

