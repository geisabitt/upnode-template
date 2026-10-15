import { modulesConfig } from '@/client/config/modules.config'
import { workerSource } from '@/core/pwa/worker'
export const dynamic = 'force-dynamic'
// When disabled, still serve a retirement worker so existing installations can clean up.
export function GET() {
  return new Response(workerSource(modulesConfig), { headers: { 'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'no-store', 'Service-Worker-Allowed': '/', 'X-Robots-Tag': 'noindex' } })
}
