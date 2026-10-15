import { requireAdminPage } from '@/core/lib/admin-access'
import CategoryForm from '@/core/components/admin/CategoryForm'

export default async function NewCategoryPage() {
  await requireAdminPage()

  return <CategoryForm mode="create" />
}