import { NO_INDEX } from '@/core/lib/seo'
import { requireModule } from '@/core/lib/module-server'
import { canAccessOrder } from '@/core/lib/order-access'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
export default async function ProtectedOrder({ children, params }: { children: ReactNode; params: Promise<{ id?: string; orderId?: string }> }) {
  requireModule('store')
  const route = await params
  if (!await canAccessOrder(route.id || route.orderId || '')) redirect('/loja/meus-pedidos')
  return children
}

export const metadata = NO_INDEX
