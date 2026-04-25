import { NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const body = await req.json()

  const {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    published,
    categoryId,
  } = body

  if (!body.coverImage) {
  return NextResponse.json(
    { message: 'Imagem obrigatória' },
    { status: 400 }
  )
}

  if (!title || !slug || !content) {
    return NextResponse.json({ message: 'Dados obrigatórios faltando' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      published: published ?? false,
      categoryId: categoryId || null,
    },
  })

  return NextResponse.json(post)
}