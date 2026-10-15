import { cache } from 'react'

export const getProduct = cache(async (slug: string) => {
  const { prisma } = await import('@/core/lib/prisma')
  return prisma.product.findUnique({ where: { slug }, include: {
    categories: true, colors: true, sizes: true, images: { orderBy: { createdAt: 'desc' } },
  } })
})

export const getPublishedPost = cache(async (slug: string) => {
  const { prisma } = await import('@/core/lib/prisma')
  return prisma.post.findFirst({ where: { slug, published: true }, include: { seo: true, category: true } })
})

export const getCustomPage = cache(async (slug: string) => {
  const { prisma } = await import('@/core/lib/prisma')
  return prisma.customPage.findUnique({ where: { slug } })
})

export const getBlogCategory = cache(async (slug: string) => {
  const { prisma } = await import('@/core/lib/prisma')
  return prisma.blogCategory.findUnique({ where: { slug }, include: {
    posts: { where: { published: true }, orderBy: { createdAt: 'desc' } },
  } })
})

export const getProductCategory = cache(async (slug: string) => {
  const { prisma } = await import('@/core/lib/prisma')
  if (slug === 'todos') {
    const products = await prisma.product.findMany({ include: { colors: true, sizes: true, images: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } })
    return { name: 'Todos os Produtos', slug: 'todos', products }
  }
  return prisma.category.findUnique({ where: { slug }, include: { products: {
    include: { colors: true, sizes: true, images: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' },
  } } })
})
