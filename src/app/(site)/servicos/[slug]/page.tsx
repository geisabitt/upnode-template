import { requireModule } from '@/core/lib/module-server'
import { InstitutionalDetail } from '@/core/components/InstitutionalModule'
import { serviceEntries } from '@/client/config/content.config'
import { notFound } from 'next/navigation'
export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  requireModule('services')
  const { slug } = await params
  const entry = serviceEntries.find(entry => entry.slug === slug)
  if (!entry) notFound()
  return <InstitutionalDetail entry={entry} />
}
