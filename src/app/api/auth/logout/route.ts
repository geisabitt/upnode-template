import { NextResponse } from 'next/server'
import { clearAuthCookie, verifyAuthToken } from '@/core/lib/session'
import { logAccess } from '@/core/lib/logger'

export async function POST(request: Request) {
  // Tentar extrair userId do token para log
  let userId: string | undefined
  try {
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0]
    if (token) {
      const session = verifyAuthToken(token)
      userId = session?.id
    }
  } catch (error) {
    // Ignora erro, faz logout mesmo sem userId
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set(clearAuthCookie())

  await logAccess({
    userId,
    action: 'logout',
    route: '/api/auth/logout',
    ip: request.headers.get('x-forwarded-for') ?? 'unknown'
  })

  return response
}
