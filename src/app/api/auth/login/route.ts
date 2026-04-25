// api/admim/auth/login/route.ts

import { NextResponse } from 'next/server'
import { validateAdminCredentials, ensureDefaultAdmin } from '@/core/lib/auth'
import { logAccess } from '@/core/lib/logger'
import { createAuthToken, createAuthCookie } from '@/core/lib/session'

export async function POST(request: Request) {
  await ensureDefaultAdmin()

  const body = await request.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
  }

  const user = await validateAdminCredentials(body.email, body.password)
  if (!user) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = createAuthToken(user)
  const response = NextResponse.json({ success: true })

  response.cookies.set(createAuthCookie(token))

  await logAccess({
    userId: user.id,
    action: 'login',
    route: '/api/auth/login',
    ip: request.headers.get('x-forwarded-for') ?? 'unknown'
  })

  return response
}
