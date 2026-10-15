import { withModuleApi } from '@/core/lib/module-server'
import { NextRequest } from 'next/server'
import { asaasFetch, type AsaasPayment } from '@/core/lib/asaas'
import { safeEqual, normalizedAsaasStatus } from '@/core/lib/commerce-security'
import { applyVerifiedPayment } from '@/core/lib/payment-security'
import { privateJson } from '@/core/lib/request-security'
export const runtime = 'nodejs'
async function POST(req: NextRequest) {
  const secret = process.env.ASAAS_WEBHOOK_TOKEN
  if (!secret) return privateJson({ error: 'Webhook não configurado.' }, 503)
  if (!safeEqual(req.headers.get('asaas-access-token') || '', secret)) return privateJson({ error: 'Notificação não autorizada.' }, 401)
  const body = await req.json().catch(() => null)
  if (typeof body?.event !== 'string' || !body.event.startsWith('PAYMENT_')) return privateJson({ status: 'ignored' })
  const id = body?.payment?.id
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return privateJson({ error: 'Notificação inválida.' }, 400)
  try {
    // Read current state from the configured account, not status/value in the notification.
    const payment = await asaasFetch<AsaasPayment>('/payments/' + encodeURIComponent(id))
    if (payment.id !== id || !payment.externalReference) return privateJson({ error: 'Pagamento inválido.' }, 400)
    const status = normalizedAsaasStatus(payment.status)
    if (!status) return privateJson({ status: 'ignored' })
    if (!await applyVerifiedPayment(payment.externalReference, payment.value, status, payment.customer)) return privateJson({ error: 'Pagamento incompatível com pedido.' }, 400)
    return privateJson({ success: true })
  } catch { return privateJson({ error: 'Não foi possível confirmar a notificação.' }, 503) }
}

const modulePOST = withModuleApi('/api/asaas/webhook', POST)
export { modulePOST as POST }
