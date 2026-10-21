import { withModuleApi } from '@/core/lib/module-server'
import { prisma } from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

async function GET() {
  const categorias = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return NextResponse.json(categorias)
}

const moduleGET = withModuleApi('/api/categorias', GET)
export { moduleGET as GET }
