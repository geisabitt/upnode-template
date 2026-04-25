// lib/auth.ts

import bcrypt from 'bcryptjs'
import { prisma } from '@/core/lib/prisma'

export interface AdminUserPayload {
  id: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export async function getAdminUserByEmail(email: string) {
  return prisma.adminUser.findUnique({ where: { email } })
}

export async function createAdminUser(email: string, password: string) {
  const passwordHash = await hashPassword(password)
  return prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      role: 'admin'
    }
  })
}

export async function ensureDefaultAdmin() {
  const admin = await prisma.adminUser.findFirst({
    where: { role: 'admin' },
  })

  if (!admin) {
    throw new Error(
      'Nenhum admin encontrado. Execute o setup inicial com SETUP_ADMIN_KEY.'
    )
  }

  return admin
}

export async function validateAdminCredentials(email: string, password: string) {
  const user = await getAdminUserByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    role: user.role
  }
}
