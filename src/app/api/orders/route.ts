// src/app/api/orders/route.ts
import { checkoutSchema } from '@/core/lib/validators/checkoutSchema'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { ValidationError } from 'yup'

// ✅ GET - Listar pedidos
export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao listar pedidos.' }, { status: 500 })
  }
}

// ✅ POST - Criar pedido
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, ...customerData } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 })
    }

    interface Item {
      productId: string
      name: string
      quantity: number
      price: number
      size: { name: string }
      color: { name: string }
    }

    // ✅ valida dados do cliente
    let validatedData: typeof checkoutSchema.__outputType
    try {
      validatedData = await checkoutSchema.validate(customerData, { abortEarly: false })
    } catch (validationError) {
      if (validationError instanceof ValidationError) {
        return NextResponse.json({ error: validationError.errors }, { status: 400 })
      }
      return NextResponse.json({ error: 'Erro de validação desconhecido.' }, { status: 400 })
    }

    let total = 0

    const validatedItems = await Promise.all(
      items.map(async (item: Item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new Error('Produto inválido.')
        }

        // ✅ valida estoque
        if (item.quantity > (product.stock ?? 0)) {
          throw new Error(`Estoque insuficiente para o produto ${product.name}`)
        }

        // ✅ CORREÇÃO AQUI
        total += Number(product.price) * item.quantity

        return {
          productId: item.productId,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          size: item.size.name,
          color: item.color.name,
        }
      })
    )

    // ✅ valida frete
    const frete =
      typeof body.frete === 'number' && body.frete >= 0 && body.frete < 500
        ? body.frete
        : 0

    // ✅ TRANSAÇÃO (evita bugs de estoque)
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          ...validatedData,
          total,
          frete,
          statusPagamento: 'pending', // Inicia como pendente até webhook confirmar
          address: validatedData.address,
          items: {
            create: validatedItems,
          },
        },
      })

      // baixa estoque dentro da transação
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      return createdOrder
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error: any) {
    console.error(error)

    if (error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 })
  }
}