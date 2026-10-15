import { pageMetadata } from '@/core/lib/seo'
import { isIndexableEntry, isPublishedEntry } from '@/core/lib/content-seo'
import { requireModule } from '@/core/lib/module-server'
import { InstitutionalList } from '@/core/components/InstitutionalModule'
import { portfolioEntries } from '@/client/config/content.config'
export default function PortfolioPage() {
  requireModule('portfolio')
  return <InstitutionalList title="Portfólio" prefix="/portfolio" entries={portfolioEntries.filter(isPublishedEntry)} />
}

export const metadata = pageMetadata({ title: 'Portfólio', path: '/portfolio', index: portfolioEntries.some(entry => isIndexableEntry(entry, '/portfolio')) })
