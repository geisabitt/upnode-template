import { requireModule } from '@/core/lib/module-server'
import { requireAdminPage } from '@/core/lib/admin-access'
import CategoryForm from '@/core/components/admin/CategoryForm'

export default async function NewCategoryPage() {
  requireModule('blog')
  await requireAdminPage()

  return <CategoryForm mode="create" />
}