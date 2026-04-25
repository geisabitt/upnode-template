import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ message: 'orderId é obrigatório' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar pedido', error }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { email, cpf } = await req.json()

  if (!email || !cpf) {
    return NextResponse.json({ message: 'Email e CPF são obrigatórios' }, { status: 400 })
  }

  try {
    const pedidos = await prisma.order.findMany({
      where: {
        email,
        cpf,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        statusPagamento: true,
        total: true,
        createdAt: true,
      },
    })

    return NextResponse.json(pedidos)
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar pedidos', error }, { status: 500 })
  }
}
