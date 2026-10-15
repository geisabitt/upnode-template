import { withModuleApi } from '@/core/lib/module-server'
import { NextRequest } from 'next/server'
import { asaasFetch, type AsaasPayment, type AsaasPixQrCode } from '@/core/lib/asaas'
import { canAccessOrder, hasOrderAccess } from '@/core/lib/order-access'
import { prisma } from '@/core/lib/prisma'
import { payableTotal, cents } from '@/core/lib/commerce-security'
import { mutationGuard, privateJson } from '@/core/lib/request-security'
export const runtime = 'nodejs'
async function GET(req: NextRequest) {
  const guard = mutationGuard(req, 'pix-query')
  if (guard) return guard
  const paymentId = req.nextUrl.searchParams.get('paymentId')
  if (!paymentId || !/^[a-zA-Z0-9_-]{1,128}$/.test(paymentId)) return privateJson({ error: 'Pagamento não encontrado.' }, 404)
  // Do not disclose provider data unless this browser has an order grant.
  if (!await hasOrderAccess()) return privateJson({ error: 'Pagamento não encontrado.' }, 404)
  try {
    const payment = await asaasFetch<AsaasPayment>('/payments/' + encodeURIComponent(paymentId))
    if (!payment.externalReference || !await canAccessOrder(payment.externalReference)) return privateJson({ error: 'Pagamento não encontrado.' }, 404)
    const order = await prisma.order.findUnique({ where: { id: payment.externalReference } })
    if (!order || payment.customer !== order.customerId || payment.billingType !== 'PIX' || cents(payment.value) !== cents(payableTotal(order))) return privateJson({ error: 'Pagamento não encontrado.' }, 404)
    const qrCode = await asaasFetch<AsaasPixQrCode>('/payments/' + encodeURIComponent(paymentId) + '/pixQrCode')
    return privateJson({ success: true, ...qrCode })
  } catch { return privateJson({ error: 'Não foi possível consultar o PIX.' }, 502) }
}

const moduleGET = withModuleApi('/api/asaas/pix-qrcode', GET)
export { moduleGET as GET }
