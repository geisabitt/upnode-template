// src/app/api/setup-admin/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { hashPassword } from '@/core/lib/auth'

const SETUP_ADMIN_KEY = process.env.SETUP_ADMIN_KEY

export async function POST(request: Request) {
  try {
    // 1. Validar chave de setup
    if (!SETUP_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Setup não configurado. Contate o administrador.' },
        { status: 500 }
      )
    }

    // 2. Ler body da requisição
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Body inválido.' },
        { status: 400 }
      )
    }

    const { email, password, key } = body

    // 3. Validar chave de segurança
    if (key !== SETUP_ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Chave de setup inválida.' },
        { status: 403 }
      )
    }

    // 4. Validar email e senha
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido.' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      )
    }

    // 5. Verificar se já existe algum admin
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Um administrador já foi criado. Setup não permitido.' },
        { status: 403 }
      )
    }

    // 6. Verificar se o email já existe
    const existingEmail = await prisma.adminUser.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email já está registrado.' },
        { status: 409 }
      )
    }

    // 7. Criptografar senha e criar usuário
    const passwordHash = await hashPassword(password)
    const newAdmin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        role: 'admin'
      }
    })

    // 8. Retornar sucesso (sem expor dados sensíveis)
    return NextResponse.json(
      {
        success: true,
        message: 'Administrador criado com sucesso!',
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}

// GET para validar se setup ainda é permitido
export async function GET() {
  try {
    const admin = await prisma.adminUser.findFirst({
      where: { role: 'admin' }
    })

    if (admin) {
      return NextResponse.json(
        { setupAllowed: false, message: 'Setup já foi realizado.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { setupAllowed: true, message: 'Setup ainda é permitido.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do setup.' },
      { status: 500 }
    )
  }
}
