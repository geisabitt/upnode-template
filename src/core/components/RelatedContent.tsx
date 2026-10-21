import Link from 'next/link'
import type { RecordSeo } from '@/client/config/seo.config'
import { serviceEntries } from '@/client/config/content.config'
import { isModuleEnabled } from '@/core/lib/modules'
import { getProduct, getPublishedPost } from '@/core/lib/seo-data'
import { isPublishedEntry } from '@/core/lib/content-seo'
import { isPublishedPost, isPublishedProduct, slugPath } from '@/core/lib/seo'
export async function RelatedContent({ related }: { related?: RecordSeo['related'] }) {
  if (!related) return null
  const sources: Promise<{ title: string; path: string } | null>[] = []
  if (isModuleEnabled('store')) for (const slug of related.products || []) sources.push(getProduct(slug).then(product => product && isPublishedProduct(product) ? { title: product.name, path: slugPath('/loja/produto/', product.slug) } : null))
  if (isModuleEnabled('blog')) for (const slug of related.posts || []) sources.push(getPublishedPost(slug).then(post => post && isPublishedPost(post) ? { title: post.title, path: slugPath('/blog/', post.slug) } : null))
  if (isModuleEnabled('services')) for (const slug of related.services || []) {
    const entry = serviceEntries.find(entry => entry.slug === slug && isPublishedEntry(entry))
    if (entry) sources.push(Promise.resolve({ title: entry.title, path: slugPath('/servicos/', entry.slug) }))
  }
  const results = await Promise.allSettled(sources)
  const links = results.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : [])
  const unique = [...new Map(links.map(link => [link.path, link])).values()]
  if (!unique.length) return null
  return <aside className="mt-8"><h2 className="text-xl font-semibold">Conteúdo relacionado</h2><ul>
    {unique.map(link => <li key={link.path}><Link href={link.path}>{link.title}</Link></li>)}
  </ul></aside>
}
