import { withModuleApi } from '@/core/lib/module-server'
import { withAdmin } from '@/core/lib/admin-access'
// src/app/api/products/route.ts
import { prisma } from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

type ColorInput = {
  name: string
  hex: string
}

type SizeInput = {
  name: string
}

type CreateProductRequest = {
  name: string
  slug: string
  price: number
  imageUrl: string[]
  description: string
  colors?: ColorInput[]
  sizes?: SizeInput[]
}

const POST = withAdmin(async function POST(req: Request) {
  const body = (await req.json()) as CreateProductRequest
  const { name, slug, price, imageUrl, description, colors, sizes } = body

  if (!name || !slug || typeof price !== 'number' || !Number.isFinite(price) || price <= 0 || !imageUrl?.length || !description) {
    return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 })
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price,
        images: {
            createMany: {
              data: imageUrl.map((url) => ({ url })),
            },
          },
        description,
        colors: {
          create: colors?.map((color) => ({
            name: color.name,
            hex: color.hex,
          })),
        },
        sizes: {
          create: sizes?.map((size) => ({
            name: size.name,
          })),
        },
      },
      include: {
        colors: true,
        sizes: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
})

async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        colors: true,
        sizes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

const modulePOST = withModuleApi('/api/products', POST)
export { modulePOST as POST }

const moduleGET = withModuleApi('/api/products', GET)
export { moduleGET as GET }
