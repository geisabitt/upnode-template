import { withModuleApi } from '@/core/lib/module-server'
import { prisma } from '@/core/lib/prisma'
import { canAccessOrder } from '@/core/lib/order-access'
import { privateJson } from '@/core/lib/request-security'

// Adapted from E&L. Customer/provider bindings are written by the server, never PATCH.
async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await canAccessOrder(id)) return privateJson({ error: 'Pedido não encontrado.' }, 404)
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  return order ? privateJson(order) : privateJson({ error: 'Pedido não encontrado.' }, 404)
}

// Financial fields are owned by verified providers. Customer bindings use create-customer.
async function PATCH() {
  return privateJson({ error: 'Alteração de pedido não permitida.' }, 403)
}

const moduleGET = withModuleApi('/api/orders/[id]', GET)
export { moduleGET as GET }

const modulePATCH = withModuleApi('/api/orders/[id]', PATCH)
export { modulePATCH as PATCH }
