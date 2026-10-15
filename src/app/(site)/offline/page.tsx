import { requireModule } from '@/core/lib/module-server'
export default function OfflinePage() {
  requireModule('pwa')
  return <section className="max-w-4xl mx-auto px-4 py-10"><h1 className="text-3xl font-bold">Sem conexão</h1>
    <p>Conecte-se à internet para consultar o conteúdo atualizado.</p></section>
}
