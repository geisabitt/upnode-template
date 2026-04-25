import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { createAsaasAccount } from '@/core/lib/asaas'

type CreateClientBody = {
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateClientBody
    const name = body.name?.trim()
    const email = body.email?.trim()
    const cpfCnpj = body.cpfCnpj?.trim() || undefined
    const phone = body.phone?.trim() || undefined

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios.' }, { status: 400 })
    }

    const asaasAccount = await createAsaasAccount({
      name,
      email,
      cpfCnpj,
      phone,
    })

    const client = await prisma.client.create({
      data: {
        name,
        email,
        cpfCnpj,
        phone,
        asaasAccountId: asaasAccount.id,
        asaasWalletId: asaasAccount.walletId,
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro interno ao criar cliente.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
