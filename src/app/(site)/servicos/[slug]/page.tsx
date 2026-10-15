import { entryMetadata, isPublishedEntry, serviceSchema } from '@/core/lib/content-seo'
import { JsonLd } from '@/core/components/JsonLd'
import { Breadcrumbs } from '@/core/components/Breadcrumbs'
import { slugPath } from '@/core/lib/seo'
import { requireModule } from '@/core/lib/module-server'
import { InstitutionalDetail } from '@/core/components/InstitutionalModule'
import { serviceEntries } from '@/client/config/content.config'
import { notFound } from 'next/navigation'
export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  requireModule('services')
  const { slug } = await params
  const entry = serviceEntries.find(entry => entry.slug === slug && isPublishedEntry(entry))
  if (!entry) notFound()
  return <><JsonLd data={serviceSchema(entry)} /><Breadcrumbs items={[{ name: 'Início', path: '/' }, { name: 'Serviços', path: '/servicos' }, { name: entry.title, path: slugPath('/servicos/', entry.slug) }]} /><InstitutionalDetail entry={entry} /></>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  requireModule('services')
  const { slug } = await params
  const entry = serviceEntries.find(entry => entry.slug === slug && isPublishedEntry(entry))
  if (!entry) notFound()
  return entryMetadata(entry, '/servicos')
}
