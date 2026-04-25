/**
 * Asaas Webhook Handler
 * Recebe notificações de pagamento do Asaas
 * POST /api/asaas/webhook
 * 
 * Asaas envia eventos como:
 * - PAYMENT_CONFIRMED
 * - PAYMENT_PENDING
 * - PAYMENT_FAILED
 * - PAYMENT_OVERDUE
 * 
 * Com payload:
 * {
 *   event: string
 *   payment: {
 *     id: string
 *     value: number
 *     status: string
 *     billingType: string
 *     externalReference: string
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';

export const runtime = 'nodejs';

// Mapa de status Asaas para status do nosso sistema
const statusMap: Record<string, string> = {
  'PAYMENT_CONFIRMED': 'approved',
  'PAYMENT_PENDING': 'pending',
  'PAYMENT_FAILED': 'rejected',
  'PAYMENT_OVERDUE': 'overdue',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('[Asaas Webhook] Evento recebido:', body);

    const { event, payment } = body;

    // Validar evento
    if (!event || !statusMap[event]) {
      console.log('[Asaas Webhook] Evento ignorado:', event);
      return NextResponse.json({ status: 'ignored' });
    }

    // Validar dados do pagamento
    if (!payment || !payment.id || !payment.externalReference) {
      console.error('[Asaas Webhook] Dados de pagamento inválidos:', payment);
      return NextResponse.json(
        { error: 'invalid payment data' },
        { status: 400 }
      );
    }

    const orderId = payment.externalReference;
    const newStatus = statusMap[event];

    console.log(`[Asaas Webhook] Atualizando pedido ${orderId} → ${newStatus}`);

    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { statusPagamento: newStatus },
    });

    // Se pagamento foi aprovado, você pode enviar email, atualizar inventário, etc.
    if (event === 'PAYMENT_CONFIRMED') {
      console.log(`[Asaas Webhook] ✅ Pagamento confirmado para pedido ${orderId}`);
      // TODO: Enviar email de confirmação, gerar nota fiscal, etc.
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('[Asaas Webhook Error]:', error);
    return NextResponse.json(
      { error: 'internal error' },
      { status: 500 }
    );
  }
}
