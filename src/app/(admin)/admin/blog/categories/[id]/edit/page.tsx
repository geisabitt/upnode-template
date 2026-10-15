import { requireAdminPage } from '@/core/lib/admin-access'
import { prisma } from '@/core/lib/prisma'
import CategoryForm from '@/core/components/admin/CategoryForm'

export default async function EditCategoryPage(
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdminPage()

  const { id } = await params

  const category = await prisma.blogCategory.findUnique({
    where: { id },
  })

  if (!category) {
    return <div>Categoria não encontrada</div>
  }

  return <CategoryForm mode="edit" category={category} />
}