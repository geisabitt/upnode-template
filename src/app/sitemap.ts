import type { MetadataRoute } from 'next'
import { isModuleEnabled } from '@/core/lib/modules'
import { portfolioEntries, serviceEntries } from '@/client/config/content.config'
import { seoConfig } from '@/client/config/seo.config'
import { canonicalUrl, slugPath, isIndexablePath, isIndexableProduct, isIndexablePost, realDate } from '@/core/lib/seo'
import { isIndexableEntry } from '@/core/lib/content-seo'
import { prisma } from '@/core/lib/prisma'
export const dynamic = 'force-dynamic'
// Preserve E&L's isolated-source design, adding Maribela's generic editorial eligibility.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const add = (path: string, updatedAt?: unknown) => {
    if (!isIndexablePath(path)) return
    const date = realDate(updatedAt)
    entries.push({ url: canonicalUrl(path), ...(date ? { lastModified: date } : {}) })
  }
  add('/')
  if (isModuleEnabled('store')) add('/loja')
  if (isModuleEnabled('blog')) add('/blog')
  for (const [key, prefix, content] of [['portfolio', '/portfolio', portfolioEntries], ['services', '/servicos', serviceEntries]] as const) {
    if (!isModuleEnabled(key)) continue
    const eligible = content.filter(entry => isIndexableEntry(entry, prefix))
    if (eligible.length) add(prefix)
    for (const entry of eligible) add(slugPath(prefix + '/', entry.slug), entry.updatedAt)
  }
  const sources: (() => Promise<void>)[] = [async () => {
    const pages = await prisma.customPage.findMany({ where: { slug: { in: ['sobre', 'personalizado'] } } })
    for (const page of pages) if (page.title?.trim() && seoConfig.records.pages['/' + page.slug]?.published !== false) add('/' + page.slug, page.updatedAt)
  }]
  if (isModuleEnabled('store')) sources.push(async () => {
    const products = await prisma.product.findMany({ include: { images: true } })
    for (const product of products) if (isIndexableProduct(product)) add(slugPath('/loja/produto/', product.slug), product.updatedAt)
  }, async () => {
    const categories = await prisma.category.findMany({ where: { slug: { not: 'todos' } }, include: { products: { include: { images: true } } } })
    for (const category of categories) if (category.name.trim() && category.products.some(isIndexableProduct) && seoConfig.records.categories[category.slug]?.index !== false && seoConfig.records.categories[category.slug]?.published !== false)
      add(slugPath('/loja/categoria/', category.slug))
  })
  if (isModuleEnabled('blog')) sources.push(async () => {
    const posts = await prisma.post.findMany({ where: { published: true } })
    for (const post of posts) if (isIndexablePost(post)) add(slugPath('/blog/', post.slug), post.updatedAt)
  }, async () => {
    const categories = await prisma.blogCategory.findMany({ include: { posts: { where: { published: true } } } })
    for (const category of categories) if (category.name.trim() && category.posts.some(isIndexablePost) && seoConfig.records.blogCategories[category.slug]?.index !== false && seoConfig.records.blogCategories[category.slug]?.published !== false)
      add(slugPath('/blog/categoria/', category.slug), category.updatedAt)
  })
  const results = await Promise.allSettled(sources.map(source => source()))
  results.forEach((result, index) => { if (result.status === 'rejected') console.error('Sitemap: fonte indisponível', index) })
  return [...new Map(entries.map(entry => [entry.url, entry])).values()]
}
