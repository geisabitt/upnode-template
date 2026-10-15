import { requireAdminPage } from '@/core/lib/admin-access'
import type { ReactNode } from 'react'
export default async function ProtectedPage({ children }: { children: ReactNode }) {
  await requireAdminPage()
  return children
}
