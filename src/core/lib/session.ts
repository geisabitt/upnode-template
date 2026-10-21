import jwt from 'jsonwebtoken'
import type { AdminUserPayload } from '@/core/lib/auth'
import { isAdminSession } from '@/core/lib/auth-token'

const JWT_SECRET = process.env.AUTH_JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error("AUTH_JWT_SECRET não definido")
}
const JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function createAuthToken(payload: AdminUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_MAX_AGE_SECONDS
  })
}

export function verifyAuthToken(token: string): AdminUserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], maxAge: '7d' })
    return isAdminSession(decoded) ? decoded : null
  } catch {
    return null
  }
}

export function createAuthCookie(token: string) {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: JWT_MAX_AGE_SECONDS
  }
}

export function clearAuthCookie() {
  return {
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  }
}

