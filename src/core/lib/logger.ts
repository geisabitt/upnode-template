import { prisma } from '@/core/lib/prisma'

export async function logAccess({
  userId,
  action,
  route,
  ip
}: {
  userId?: string
  action: string
  route?: string
  ip?: string
}) {
  return prisma.accessLog.create({
    data: {
      userId,
      action,
      route,
      ip
    }
  })
}
