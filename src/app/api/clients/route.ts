import { withModuleApi } from '@/core/lib/module-server'
import { withAdmin } from '@/core/lib/admin-access'
// src/app/api/clients/route.ts
// Cria o DONO DA LOJA como subconta no Asaas e salva no banco (model Client)
// ℹ️ /api/asaas/create-customer é outra rota — para cliente final que compra na loja

import { NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { createAsaasAccount } from '@/core/lib/asaas'

type CreateClientBody = {
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
}

// 📥 GET — lista todos os clientes (donos de loja) cadastrados
async function GET(request: Request) {
  void request
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        cpfCnpj: true,
        phone: true,
        asaasAccountId: true,
        asaasWalletId: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ clients })
  } catch {
    return NextResponse.json({ error: 'Erro ao listar clientes.' }, { status: 500 })
  }
}

// 📤 POST — cria dono da loja como subconta no Asaas
async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateClientBody
    const name = body.name?.trim()
    const email = body.email?.trim()
    const cpfCnpj = body.cpfCnpj?.trim() || undefined
    const phone = body.phone?.trim() || undefined

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios.' }, { status: 400 })
    }

    // Verifica duplicata antes de chamar o Asaas
    const existing = await prisma.client.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um cliente cadastrado com este email.', client: existing },
        { status: 409 }
      )
    }

    // Cria subconta no Asaas (dono da loja recebe pagamentos pela subconta)
    const asaasAccount = await createAsaasAccount({ name, email, cpfCnpj, phone })

    // Salva no banco
    const client = await prisma.client.create({
      data: {
        name,
        email,
        cpfCnpj,
        phone,
        asaasAccountId: asaasAccount.id,
        asaasWalletId: asaasAccount.walletId ?? null,
      },
    })


    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    const message = 'Não foi possível criar a subconta.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

const securedGET = withAdmin(GET)
const securedPOST = withAdmin(POST)


const moduleGET = withModuleApi('/api/clients', securedGET)
export { moduleGET as GET }

const modulePOST = withModuleApi('/api/clients', securedPOST)
export { modulePOST as POST }
