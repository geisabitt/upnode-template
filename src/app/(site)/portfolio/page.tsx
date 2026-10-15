import { requireModule } from '@/core/lib/module-server'
import { InstitutionalList } from '@/core/components/InstitutionalModule'
import { portfolioEntries } from '@/client/config/content.config'
export default function PortfolioPage() {
  requireModule('portfolio')
  return <InstitutionalList title="Portfólio" prefix="/portfolio" entries={portfolioEntries} />
}
