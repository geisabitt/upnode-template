import { withModuleApi } from '@/core/lib/module-server'
import { NextRequest } from 'next/server'
import { asaasFetch, type AsaasCustomer } from '@/core/lib/asaas'
import { prisma } from '@/core/lib/prisma'
import { canAccessOrder } from '@/core/lib/order-access'
import { mutationGuard, privateJson } from '@/core/lib/request-security'

export const runtime = 'nodejs'
async function POST(req: NextRequest) {
  const guard = mutationGuard(req, 'asaas-customer')
  if (guard) return guard
  const body = await req.json().catch(() => null)
  if (typeof body?.orderId !== 'string' || !await canAccessOrder(body.orderId)) return privateJson({ error: 'Pedido não encontrado.' }, 404)
  try {
    const customerId = await prisma.$transaction(async tx => {
      // Serialize concurrent customer creation for the same order, across instances.
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${body.orderId} FOR UPDATE`
      const order = await tx.order.findUnique({ where: { id: body.orderId } })
      if (!order) throw new Error('Missing order')
      if (order.customerId) return order.customerId
      const address = order.address as Record<string, string>
      const customer = await asaasFetch<AsaasCustomer>('/customers', 'POST', {
        name: order.fullName, email: order.email, cpfCnpj: order.cpf.replace(/\D/g, ''),
        mobilePhone: order.phone.replace(/\D/g, ''), address: address.street,
        addressNumber: address.number, province: address.neighborhood,
        postalCode: address.zipCode.replace(/\D/g, ''), externalReference: order.id,
      })
      if (!customer?.id) throw new Error('Invalid provider response')
      await tx.order.update({ where: { id: order.id }, data: { customerId: customer.id } })
      return customer.id
    }, { timeout: 90_000 })
    return privateJson({ success: true, customerId })
  } catch { return privateJson({ error: 'Não foi possível cadastrar o pagador.' }, 502) }
}

const modulePOST = withModuleApi('/api/asaas/create-customer', POST)
export { modulePOST as POST }
