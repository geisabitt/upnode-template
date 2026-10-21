import { withModuleApi } from '@/core/lib/module-server'
import { withAdmin } from '@/core/lib/admin-access'
import { prisma } from "@/core/lib/prisma"

const PATCH = withAdmin(async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const page = await prisma.customPage.update({
    where: {
      id
    },
    data: {
      title: body.title,
      introText: body.introText,
      coverImage: body.coverImage,
      faq: body.faq
    }
  })

  return Response.json(page)
})
const modulePATCH = withModuleApi('/api/admin/pages/[id]', PATCH)
export { modulePATCH as PATCH }
