import { prisma } from "@/core/lib/prisma"

export async function PATCH(
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
}