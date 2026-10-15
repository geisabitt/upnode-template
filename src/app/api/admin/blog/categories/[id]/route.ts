import { withModuleApi } from '@/core/lib/module-server'
import { withAdmin } from '@/core/lib/admin-access'
import { NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

type Params = {
  params: Promise<{ id: string }>
}

/* UPDATE */
const PATCH = withAdmin(async function PATCH(req: Request, context: Params) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        showOnHome: body.showOnHome,
        featured: body.featured,
        order: body.order,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
})

/* DELETE */
const DELETE = withAdmin(async function DELETE(req: Request, context: Params) {
  try {
    const { id } = await context.params

    await prisma.blogCategory.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 })
  }
})
const modulePATCH = withModuleApi('/api/admin/blog/categories/[id]', PATCH)
export { modulePATCH as PATCH }

const moduleDELETE = withModuleApi('/api/admin/blog/categories/[id]', DELETE)
export { moduleDELETE as DELETE }
