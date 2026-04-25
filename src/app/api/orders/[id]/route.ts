import { NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'ID não enviado' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'ID não enviado' }, { status: 400 })
  }

  try {
    const body = await req.json()

    const order = await prisma.order.update({
      where: { id },
      data: body,
      include: { items: true },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}