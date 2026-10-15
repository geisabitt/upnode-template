import { withModuleApi } from '@/core/lib/module-server'
import { prisma } from '@/core/lib/prisma'
import { canAccessOrder } from '@/core/lib/order-access'
import { mutationGuard, privateJson } from '@/core/lib/request-security'
import { payableTotal } from '@/core/lib/commerce-security'
import { NextRequest, NextResponse } from 'next/server';
import { asaasFetch, AsaasPayment } from '@/core/lib/asaas';
import * as yup from 'yup';

export const runtime = 'nodejs';


const createPaymentSchema = yup.object({
  customerId: yup.string().optional(),
  orderId: yup.string().required(),
  total: yup.number().optional(),

  billingType: yup
    .string()
    .oneOf(['CREDIT_CARD', 'PIX'])
    .required(),

  creditCardData: yup
    .object({
      creditCardNumber: yup.string().matches(/^\d{16}$/),
      creditCardExpirationMonth: yup.string().matches(/^(0[1-9]|1[0-2])$/),
      creditCardExpirationYear: yup.string().matches(/^\d{4}$/),
      creditCardCvv: yup.string().matches(/^\d{3,4}$/),
      creditCardHolderName: yup.string(),
    })
    .nullable()
    .notRequired()
    .when('billingType', {
      is: 'CREDIT_CARD',
      then: (schema) =>
        schema.shape({
          creditCardNumber: yup.string().matches(/^\d{16}$/).required(),
          creditCardExpirationMonth: yup.string().matches(/^(0[1-9]|1[0-2])$/).required(),
          creditCardExpirationYear: yup.string().matches(/^\d{4}$/).required(),
          creditCardCvv: yup.string().matches(/^\d{3,4}$/).required(),
          creditCardHolderName: yup.string().required(),
        }),
    }),

  dueDate: yup.string().optional(),
});

type CreatePaymentRequest = yup.InferType<typeof createPaymentSchema>;

async function POST(req: NextRequest) {
  const guard = mutationGuard(req, 'asaas-payment')
  if (guard) return guard
  try {
    const body = await req.json();

    let validatedData: CreatePaymentRequest;
    try {
      validatedData = await createPaymentSchema.validate(body, {
        abortEarly: false,
      });
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Validação falhou', details: validationError instanceof yup.ValidationError ? validationError.errors : ['Dados inválidos.'] },
        { status: 400 }
      );
    }

    if (!await canAccessOrder(validatedData.orderId)) return privateJson({ error: 'Pedido não encontrado.' }, 404)
    const order = await prisma.order.findUnique({ where: { id: validatedData.orderId } })
    if (!order || !order.customerId) return privateJson({ error: 'Pagador não cadastrado.' }, 400)
    if (['approved', 'refunded', 'refund_pending', 'disputed'].includes(order.statusPagamento || '')) return privateJson({ error: 'Pedido já liquidado.' }, 409)
    const total = payableTotal(order)

    // 🔥 validação manual (mais confiável que when)
    if (validatedData.billingType === 'CREDIT_CARD') {
      if (!validatedData.creditCardData) {
        return NextResponse.json(
          { error: 'creditCardData é obrigatório para cartão' },
          { status: 400 }
        );
      }
    }

    const remoteIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const dueDate = ensureFutureDate(
      validatedData.dueDate || getDefaultDueDate(validatedData.billingType)
    );

    const payload: Record<string, unknown> = {
      customer: order.customerId,
      billingType: validatedData.billingType,
      value: total,
      dueDate,
      description: `Pedido #${validatedData.orderId}`,
      externalReference: validatedData.orderId,
      remoteIp,
    };

    // 💳 CARTÃO
    if (validatedData.billingType === 'CREDIT_CARD' && validatedData.creditCardData) {
      payload.creditCard = {
        holderName: validatedData.creditCardData.creditCardHolderName,
        number: validatedData.creditCardData.creditCardNumber,
        expiryMonth: validatedData.creditCardData.creditCardExpirationMonth,
        expiryYear: validatedData.creditCardData.creditCardExpirationYear,
        ccv: validatedData.creditCardData.creditCardCvv,
      };

      // Existing form collects no separate holder document/address. Do not invent it.
      const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR')
      if (normalizeName(validatedData.creditCardData.creditCardHolderName || '') !== normalizeName(order.fullName))
        return privateJson({ error: 'Cartão de outro titular exige dados adicionais ainda não disponíveis neste checkout.' }, 400)
      const address = order.address as Record<string, string>
      payload.creditCardHolderInfo = {
        name: order.fullName, email: order.email, cpfCnpj: order.cpf.replace(/\D/g, ''),
        postalCode: address.zipCode.replace(/\D/g, ''), addressNumber: address.number,
        phone: order.phone.replace(/\D/g, ''),
      };
    }



    const payment = await asaasFetch<AsaasPayment>(
      '/payments',
      'POST',
      payload
    );


    return privateJson({
      success: true,
      paymentId: payment.id,
      payment: { id: payment.id, status: payment.status },
    });
  } catch {

    return NextResponse.json(
      {
        error: 'Não foi possível criar a cobrança.',
      },
      { status: 400 }
    );
  }
}

/**
 * 📅 regras de data
 */
function getDefaultDueDate(billingType: string): string {
  const date = new Date();

  if (billingType === 'CREDIT_CARD') {
    date.setDate(date.getDate() + 1);
  } else {
    date.setDate(date.getDate() + 30);
  }

  return formatDate(date);
}

function ensureFutureDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const input = new Date(dateStr);
  input.setHours(0, 0, 0, 0);

  if (input <= today) {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return formatDate(tomorrow);
  }

  return dateStr;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
const modulePOST = withModuleApi('/api/asaas/create-payment', POST)
export { modulePOST as POST }
