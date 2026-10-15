import { withAdmin } from '@/core/lib/admin-access'
// src/app/api/admin/blog-categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export const GET = withAdmin(async function GET() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: [
  { order: 'asc' },
  { createdAt: 'desc' },
]
  })

  return NextResponse.json(categories)
})

export const POST = withAdmin(async function POST(req: Request) {
  const body = await req.json()

  const {
    name,
    slug,
    description,
    image,
    featured,
    showOnHome,
    order,
  } = body

  if (!name || !slug) {
    return NextResponse.json({ message: 'Nome e slug obrigatórios' }, { status: 400 })
  }

  const category = await prisma.blogCategory.create({
    data: {
      name,
      slug,
      description,
      image,
      featured: featured ?? false,
      showOnHome: showOnHome ?? false,
      order: order ?? 0,
    },
  })

  return NextResponse.json(category)
})