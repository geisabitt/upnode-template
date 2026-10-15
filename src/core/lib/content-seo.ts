import type { InstitutionalEntry } from '@/client/config/content.config'
import { pageMetadata, isIndexablePath, canonicalUrl, textDescription, hasVerifiedIdentity } from './seo'
export const isPublishedEntry = (entry: InstitutionalEntry) => entry.published !== false && entry.seo?.published !== false
export const isIndexableEntry = (entry: InstitutionalEntry, prefix: string) => isPublishedEntry(entry) &&
  entry.seo?.index !== false && !!entry.title.trim() && !!entry.content.trim() && isIndexablePath(prefix + '/' + encodeURIComponent(entry.slug))
export function entryMetadata(entry: InstitutionalEntry, prefix: string) {
  return pageMetadata({ title: entry.seo?.title || entry.title, description: entry.seo?.description || entry.description,
    image: entry.seo?.image, path: prefix + '/' + encodeURIComponent(entry.slug), index: isIndexableEntry(entry, prefix) })
}
export function serviceSchema(entry: InstitutionalEntry) {
  if (!isIndexableEntry(entry, '/servicos') || !entry.description.trim()) return null
  const url = canonicalUrl('/servicos/' + encodeURIComponent(entry.slug))
  return { '@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service', name: entry.title,
    description: textDescription(entry.description), url,
    ...(hasVerifiedIdentity() ? { provider: { '@id': canonicalUrl('/') + '#organization' } } : {}) }
}
