import { ContentBody } from './ContentBody'
import { RelatedContent } from './RelatedContent'
import Link from 'next/link'
import type { InstitutionalEntry } from '@/client/config/content.config'
export function InstitutionalList({ title, prefix, entries }: { title: string; prefix: string; entries: InstitutionalEntry[] }) {
  return <section className="max-w-5xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold mb-6">{title}</h1>
    <div className="grid gap-6 md:grid-cols-2">{entries.map(entry => <article key={entry.slug}>
      <h2 className="text-xl font-semibold"><Link href={`${prefix}/${encodeURIComponent(entry.slug)}`}>{entry.title}</Link></h2>
      <p>{entry.description}</p>
    </article>)}</div>
  </section>
}
export function InstitutionalDetail({ entry }: { entry: InstitutionalEntry }) {
  return <article className="max-w-4xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold mb-6">{entry.title}</h1>
    <p className="mb-6">{entry.description}</p><div className="whitespace-pre-line"><ContentBody content={entry.content} format={entry.seo?.format} /></div>
    <RelatedContent related={entry.seo?.related} />
  </article>
}
