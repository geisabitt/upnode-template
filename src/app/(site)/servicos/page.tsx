import { pageMetadata } from '@/core/lib/seo'
import { isIndexableEntry, isPublishedEntry } from '@/core/lib/content-seo'
import { requireModule } from '@/core/lib/module-server'
import { InstitutionalList } from '@/core/components/InstitutionalModule'
import { serviceEntries } from '@/client/config/content.config'
export default function ServicesPage() {
  requireModule('services')
  return <InstitutionalList title="Serviços" prefix="/servicos" entries={serviceEntries.filter(isPublishedEntry)} />
}

export const metadata = pageMetadata({ title: 'Serviços', path: '/servicos', index: serviceEntries.some(entry => isIndexableEntry(entry, '/servicos')) })
