import { requireModule } from '@/core/lib/module-server'
import { InstitutionalDetail } from '@/core/components/InstitutionalModule'
import { portfolioEntries } from '@/client/config/content.config'
import { notFound } from 'next/navigation'
export default async function PortfolioDetail({ params }: { params: Promise<{ slug: string }> }) {
  requireModule('portfolio')
  const { slug } = await params
  const entry = portfolioEntries.find(entry => entry.slug === slug)
  if (!entry) notFound()
  return <InstitutionalDetail entry={entry} />
}
