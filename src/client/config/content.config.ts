import type { RecordSeo } from './seo.config'
export type InstitutionalEntry = { slug: string; title: string; description: string; content: string;
  published?: boolean; updatedAt?: string; seo?: RecordSeo }
// Client-owned content. No brand/project data from reference clients is imported.
export const portfolioEntries: InstitutionalEntry[] = []
export const serviceEntries: InstitutionalEntry[] = []
