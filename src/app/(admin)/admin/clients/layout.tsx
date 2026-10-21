import { requireModule } from '@/core/lib/module-server'
import { requireAdminPage } from '@/core/lib/admin-access'
import type { ReactNode } from 'react'
export default async function ProtectedPage({ children }: { children: ReactNode }) {
  requireModule('checkout')
  await requireAdminPage()
  return children
}
