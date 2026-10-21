export type RecordSeo = {
  title?: string; description?: string; image?: string; index?: boolean
  published?: boolean; format?: 'plain' | 'html' | 'markdown'
  related?: { products?: string[]; services?: string[]; posts?: string[] }
}
export type SeoConfig = {
  indexing: boolean
  products: { mode: 'all' | 'reviewed'; reviewedSlugs: string[]; requireInStock: boolean; requireImage: boolean }
  records: { pages: Record<string, RecordSeo>; products: Record<string, RecordSeo>; posts: Record<string, RecordSeo>; categories: Record<string, RecordSeo>; blogCategories: Record<string, RecordSeo> }
  identity: { verified: boolean; sameAs: string[]; address: null | { streetAddress: string; addressLocality: string; addressRegion?: string; postalCode?: string; addressCountry: string } }
}
// No client-specific allowlist or business facts. Enable verified only with real identity.
export const seoConfig: SeoConfig = {
  indexing: true,
  products: { mode: 'all', reviewedSlugs: [], requireInStock: false, requireImage: false },
  records: { pages: {}, products: {}, posts: {}, categories: {}, blogCategories: {} },
  identity: { verified: false, sameAs: [], address: null },
}
