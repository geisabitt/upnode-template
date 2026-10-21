import { entryMetadata, isPublishedEntry } from '@/core/lib/content-seo'
import { Breadcrumbs } from '@/core/components/Breadcrumbs'
import { slugPath } from '@/core/lib/seo'
import { requireModule } from '@/core/lib/module-server'
import { InstitutionalDetail } from '@/core/components/InstitutionalModule'
import { portfolioEntries } from '@/client/config/content.config'
import { notFound } from 'next/navigation'
export default async function PortfolioDetail({ params }: { params: Promise<{ slug: string }> }) {
  requireModule('portfolio')
  const { slug } = await params
  const entry = portfolioEntries.find(entry => entry.slug === slug && isPublishedEntry(entry))
  if (!entry) notFound()
  return <><Breadcrumbs items={[{ name: 'Início', path: '/' }, { name: 'Portfólio', path: '/portfolio' }, { name: entry.title, path: slugPath('/portfolio/', entry.slug) }]} /><InstitutionalDetail entry={entry} /></>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  requireModule('portfolio')
  const { slug } = await params
  const entry = portfolioEntries.find(entry => entry.slug === slug && isPublishedEntry(entry))
  if (!entry) notFound()
  return entryMetadata(entry, '/portfolio')
}
