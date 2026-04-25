import { prisma } from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const categorias = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return NextResponse.json(categorias)
}
