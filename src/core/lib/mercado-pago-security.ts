import { createHmac } from 'crypto'

export function validateMercadoPagoSignature(
  body: string,
  signature: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret) {
    console.warn('[MP-SECURITY] MERCADO_PAGO_WEBHOOK_SECRET não configurado. Aceitando webhook (dev mode)')
    return true
  }

  if (!signature) {
    console.warn('[MP-SECURITY] Header x-signature ausente. Rejeitando webhook.')
    return false
  }

  try {
    const hash = createHmac('sha256', secret).update(body).digest('hex')
    const isValid = hash === signature

    if (!isValid) {
      console.error('[MP-SECURITY] Assinatura inválida!', {
        expected: hash,
        received: signature,
      })
    }

    return isValid
  } catch (error) {
    console.error('[MP-SECURITY] Erro ao validar assinatura:', error)
    return false
  }
}

export async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken: string | undefined
) {
  if (!accessToken) {
    console.error('[MP-API] MERCADO_PAGO_ACCESS_TOKEN não configurado')
    return null
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error(
        `[MP-API] Erro ao buscar pagamento: ${response.status} ${response.statusText}`
      )
      return null
    }

    const payment = await response.json()
    return payment
  } catch (error) {
    console.error('[MP-API] Erro ao buscar pagamento:', error)
    return null
  }
}

export type MercadoPagoPaymentStatus =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'disputed'

export interface MercadoPagoPayment {
  id: number
  status: MercadoPagoPaymentStatus
  external_reference: string
  transaction_amount: number
  currency_id: string
  payer: {
    email: string
    identification: {
      type: string
      number: string
    }
  }
  description: string
  created_at: string
}