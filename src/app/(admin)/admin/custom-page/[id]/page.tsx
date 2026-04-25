import { prisma } from "@/core/lib/prisma"
import { notFound } from "next/navigation"
import PageForm from "@/core/components/admin/PageForm"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const page = await prisma.customPage.findUnique({
    where: { id }
  })

  if (!page) return notFound()

  return (
    <div className="p-6">
      <PageForm page={page} />
    </div>
  )
}