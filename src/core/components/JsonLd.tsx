import { serializeJsonLd } from '@/core/lib/seo'
// Reuses the escaping contract from Maribela/Artesanaio. Null means insufficient data.
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
