// Adapted from Maribela/Artesanaio; identity and policy are always client configuration.
import type { Metadata } from 'next'
import { siteConfig } from '@/client/config/site.config'
import { seoConfig } from '@/client/config/seo.config'
import { isPublicLinkEnabled, isModuleEnabled } from '@/core/lib/modules'
export const NO_INDEX: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: null } }
export function canonicalUrl(path: string): string {
  const base = new URL(siteConfig.seo.url)
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('Invalid site URL')
  const url = new URL(path, base)
  if (url.origin !== base.origin || url.username || url.password) throw new Error('Canonical must use the configured domain')
  url.search = ''; url.hash = ''
  return url.toString()
}
export function slugPath(prefix: string, slug: string) { return prefix + encodeURIComponent(slug) }
export function textDescription(text: string | null | undefined, fallback = siteConfig.seo.descricao) {
  return ((text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || fallback).slice(0, 160)
}
export function publicImageUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  try { const url = new URL(value, siteConfig.seo.url); return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : undefined } catch { return undefined }
}
export function isIndexablePath(path: string): boolean {
  const pathname = new URL(canonicalUrl(path)).pathname
  return seoConfig.indexing && isPublicLinkEnabled(pathname) &&
    !['/admin', '/api', '/pedido', '/carrinho', '/checkout', '/minha-conta', '/offline', '/preparar-offline',
      '/loja/pedido', '/loja/carrinho', '/loja/checkout', '/loja/meus-pedidos'].some(prefix => pathname === prefix || pathname.startsWith(prefix + '/')) &&
    !['/manifest.webmanifest', '/upnode-sw.js', '/robots.txt', '/sitemap.xml'].includes(pathname) &&
    seoConfig.records.pages[pathname]?.index !== false && seoConfig.records.pages[pathname]?.published !== false
}
export function pageMetadata({ title, description, path, image, index = true, article = false, keywords }:
  { title: string; description?: string | null; path: string; image?: string | null; index?: boolean; article?: boolean; keywords?: string | null }): Metadata {
  const editorial = seoConfig.records.pages[path]
  const pageTitle = editorial?.title || title
  const fullTitle = pageTitle.toLocaleLowerCase().includes(siteConfig.nome.toLocaleLowerCase()) ? pageTitle : `${pageTitle} | ${siteConfig.nome}`
  const summary = textDescription(editorial?.description || description)
  const url = canonicalUrl(path)
  const imageUrl = publicImageUrl(editorial?.image || image || siteConfig.seo.ogImage)
  return { title: { absolute: fullTitle }, description: summary,
    alternates: { canonical: url }, robots: { index: index && isIndexablePath(path), follow: true },
    ...(keywords ? { keywords: keywords.split(',').map(word => word.trim()).filter(Boolean) } : {}),
    openGraph: { title: fullTitle, description: summary, url, siteName: siteConfig.nome, locale: 'pt_BR', type: article ? 'article' : 'website',
      images: imageUrl ? [{ url: imageUrl, alt: pageTitle }] : [] },
    twitter: { card: 'summary_large_image', title: fullTitle, description: summary, images: imageUrl ? [imageUrl] : [] } }
}
export type SeoProduct = { slug: string; name: string; description: string; price: { toString(): string } | number | string; stock: number; images: { url: string }[] }
export function isPublishedProduct(product: Pick<SeoProduct, 'slug'>) { return seoConfig.records.products[product.slug]?.published !== false }
export function isIndexableProduct(product: SeoProduct): boolean {
  const policy = seoConfig.products
  return isModuleEnabled('store') && isIndexablePath(slugPath('/loja/produto/', product.slug)) && isPublishedProduct(product) &&
    seoConfig.records.products[product.slug]?.index !== false && !!product.name?.trim() && !!product.description?.trim() &&
    product.price != null && String(product.price).trim() !== '' && Number.isFinite(Number(product.price)) && Number(product.price) >= 0 &&
    (policy.mode === 'all' || policy.reviewedSlugs.includes(product.slug)) &&
    (!policy.requireInStock || product.stock > 0) && (!policy.requireImage || product.images.some(image => publicImageUrl(image.url)))
}
export function isPublishedPost(post: { slug: string; published: boolean }): boolean {
  return post.published && seoConfig.records.posts[post.slug]?.published !== false
}
export function isIndexablePost(post: { slug: string; title: string; content: string; published: boolean }): boolean {
  return isModuleEnabled('blog') && isIndexablePath(slugPath('/blog/', post.slug)) && isPublishedPost(post) &&
    seoConfig.records.posts[post.slug]?.index !== false && !!post.title?.trim() && !!post.content?.trim()
}
export function realDate(value: unknown): string | undefined {
  if (!(value instanceof Date) && typeof value !== 'string') return undefined
  if (typeof value === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return undefined
    const day = new Date(value.slice(0, 10) + 'T00:00:00Z')
    if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10)) return undefined
  }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined
}
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: canonicalUrl(item.path) })) }
}
export function hasVerifiedIdentity() { return seoConfig.identity.verified && !!siteConfig.nome.trim() }
export function organizationSchema() {
  if (!hasVerifiedIdentity()) return null
  return { '@context': 'https://schema.org', '@type': 'Organization', '@id': canonicalUrl('/') + '#organization',
    name: siteConfig.nome, url: canonicalUrl('/'), ...(publicImageUrl(siteConfig.logoHorizontal) ? { logo: publicImageUrl(siteConfig.logoHorizontal) } : {}),
    ...(seoConfig.identity.sameAs.length ? { sameAs: seoConfig.identity.sameAs.filter(link => /^https:\/\//.test(link)) } : {}) }
}
export function websiteSchema() {
  if (!hasVerifiedIdentity()) return null
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': canonicalUrl('/') + '#website', name: siteConfig.nome, url: canonicalUrl('/'),
    inLanguage: 'pt-BR', publisher: { '@id': canonicalUrl('/') + '#organization' } }
}
export function localBusinessSchema() {
  const address = seoConfig.identity.address
  if (!hasVerifiedIdentity() || !address?.streetAddress.trim() || !address.addressLocality.trim() || !address.addressCountry.trim()) return null
  return { ...organizationSchema(), '@type': 'LocalBusiness', address: { '@type': 'PostalAddress', ...address } }
}
export function productSchema(product: SeoProduct) {
  if (!isIndexableProduct(product)) return null
  const images = product.images.map(image => publicImageUrl(image.url)).filter(Boolean)
  if (!images.length) return null
  const url = canonicalUrl(slugPath('/loja/produto/', product.slug))
  return { '@context': 'https://schema.org', '@type': 'Product', '@id': url + '#product', name: product.name, description: product.description, image: images, url,
    offers: { '@type': 'Offer', url, priceCurrency: 'BRL', price: Number(product.price).toFixed(2),
      ...(Number.isInteger(product.stock) && product.stock >= 0 ? { availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } : {}) } }
}
export function blogPostingSchema(post: { slug: string; title: string; content: string; published: boolean; excerpt?: string | null; coverImage?: string | null; updatedAt?: Date }) {
  if (!isIndexablePost(post)) return null
  const url = canonicalUrl(slugPath('/blog/', post.slug))
  return { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', headline: post.title, description: textDescription(post.excerpt || post.content),
    mainEntityOfPage: url, url, inLanguage: 'pt-BR', ...(realDate(post.updatedAt) ? { dateModified: realDate(post.updatedAt) } : {}),
    ...(publicImageUrl(post.coverImage) ? { image: publicImageUrl(post.coverImage) } : {}),
    ...(hasVerifiedIdentity() ? { publisher: { '@id': canonicalUrl('/') + '#organization' } } : {}) }
}
