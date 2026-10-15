import type { MetadataRoute } from 'next'
import { siteConfig } from '@/client/config/site.config'
import { isModuleEnabled } from '@/core/lib/modules'
import { portfolioEntries, serviceEntries } from '@/client/config/content.config'
import { prisma } from '@/core/lib/prisma'
export const dynamic = 'force-dynamic'
// Generalized from E&L: disabled sources are never queried; failures are isolated.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.seo.url.replace(/\/+$/, '')
  const entries: MetadataRoute.Sitemap = [{ url: base }]
  const sources: { prefix: string; load: () => Promise<{ slug: string; updatedAt?: Date }[]> }[] = [
    { prefix: '/', load: () => prisma.customPage.findMany({ where: { slug: { in: ['sobre', 'personalizado'] } }, select: { slug: true, updatedAt: true } }) },
  ]
  if (isModuleEnabled('store')) {
    entries.push({ url: base + '/loja' })
    sources.push({ prefix: '/loja/produto/', load: () => prisma.product.findMany({ select: { slug: true, updatedAt: true } }) },
      { prefix: '/loja/categoria/', load: () => prisma.category.findMany({ where: { slug: { not: 'todos' } }, select: { slug: true } }) })
  }
  if (isModuleEnabled('blog')) {
    entries.push({ url: base + '/blog' })
    sources.push({ prefix: '/blog/', load: () => prisma.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }) },
      { prefix: '/blog/categoria/', load: () => prisma.blogCategory.findMany({ select: { slug: true, updatedAt: true } }) })
  }
  for (const [module, prefix, content] of [['portfolio', '/portfolio', portfolioEntries], ['services', '/servicos', serviceEntries]] as const) {
    if (isModuleEnabled(module)) entries.push({ url: base + prefix }, ...content.map(entry => ({ url: base + prefix + '/' + encodeURIComponent(entry.slug) })))
  }
  const results = await Promise.allSettled(sources.map(source => source.load()))
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') entries.push(...result.value.map(record => ({ url: base + sources[index].prefix + encodeURIComponent(record.slug),
      ...(record.updatedAt ? { lastModified: record.updatedAt } : {}) })))
    else console.error('Sitemap: fonte indisponível', sources[index].prefix)
  })
  return [...new Map(entries.map(entry => [entry.url, entry])).values()]
}
