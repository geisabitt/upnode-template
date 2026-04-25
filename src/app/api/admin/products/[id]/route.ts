import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/core/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true, images: { orderBy: { createdAt: 'desc' } }, colors: true, sizes: true },
  })

  if (!product) {
    return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 })
  }

  return NextResponse.json(product)
}

type AdminProductUpdateRequest = {
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
  removeImageIds?: string[]
  colors?: { name: string; hex: string }[]
  sizes?: { name: string }[]
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await request.json()) as AdminProductUpdateRequest

  const {
    name,
    slug,
    description,
    price,
    stock,
    materials,
    handmade,
    categories,
    youtubeUrl,
    imageUrls,
    removeImageIds,
    colors,
    sizes,
  } = body

  if (!name || !slug || !description || typeof price !== 'number' || typeof stock !== 'number' || !Array.isArray(imageUrls)) {
    return NextResponse.json({ message: 'Dados do produto incompletos.' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  })

  if (!product) {
    return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 })
  }

  const remainingImageUrls = product.images
    .filter((image) => !removeImageIds?.includes(image.id))
    .map((image) => image.url)

  const finalImageUrls = [...remainingImageUrls, ...imageUrls]

  if (finalImageUrls.length === 0) {
    return NextResponse.json({ message: 'É necessário ao menos uma imagem.' }, { status: 400 })
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        stock,
        materials: materials || null,
        handmade,
        youtubeUrl: youtubeUrl || null,

        // ❌ REMOVIDO imageUrl

        categories: {
          set: categories.map((categoryId) => ({ id: categoryId })),
        },

        images: {
          ...(removeImageIds && removeImageIds.length > 0
            ? { deleteMany: { id: { in: removeImageIds } } }
            : {}),

          ...(imageUrls.length > 0
            ? {
                createMany: {
                  data: imageUrls.map((url) => ({ url })),
                },
              }
            : {}),
        },

        colors: colors ? {
          deleteMany: {},
          create: colors.map((color) => ({
            name: color.name,
            hex: color.hex,
          })),
        } : undefined,

        sizes: sizes ? {
          deleteMany: {},
          create: sizes.map((size) => ({
            name: size.name,
          })),
        } : undefined,
      },
      include: {
        categories: true,
        images: { orderBy: { createdAt: 'desc' } },
        colors: true,
        sizes: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'Slug já existe. Use outro slug.' }, { status: 409 })
    }

    return NextResponse.json({ message: 'Erro interno ao atualizar produto.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Produto excluído com sucesso.' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json({ message: 'Erro interno ao excluir produto.' }, { status: 500 })
  }
}