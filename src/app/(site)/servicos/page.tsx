import { requireModule } from '@/core/lib/module-server'
import { InstitutionalList } from '@/core/components/InstitutionalModule'
import { serviceEntries } from '@/client/config/content.config'
export default function ServicesPage() {
  requireModule('services')
  return <InstitutionalList title="Serviços" prefix="/servicos" entries={serviceEntries} />
}
