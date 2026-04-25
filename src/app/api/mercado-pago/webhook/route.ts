// src/app/api/mercado-pago/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { fetchMercadoPagoPayment } from '@/core/lib/mercado-pago-security'

const TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log("🔥 WEBHOOK RECEBIDO:", body)

    const paymentId = body?.data?.id
    const topic = body?.type || body?.topic

    if (topic !== 'payment' || !paymentId) {
      console.log("⚠️ Evento ignorado")
      return NextResponse.json({ status: 'ignored' })
    }

    const payment = await fetchMercadoPagoPayment(paymentId, TOKEN)

    if (!payment) {
      console.error("❌ Erro ao buscar pagamento no MP")
      return NextResponse.json({ error: 'mp fetch failed' }, { status: 500 })
    }

    const orderId = payment.external_reference
    const status = payment.status

    if (!orderId || !status) {
      console.error("❌ Dados inválidos do pagamento")
      return NextResponse.json({ error: 'invalid payment' }, { status: 400 })
    }

    console.log(`📦 Atualizando pedido ${orderId} → ${status}`)

    await prisma.order.update({
      where: { id: orderId },
      data: { statusPagamento: status },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("💥 ERRO NO WEBHOOK:", error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}