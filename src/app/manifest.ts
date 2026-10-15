import type { MetadataRoute } from 'next'
import { requireModule } from '@/core/lib/module-server'
import { siteConfig } from '@/client/config/site.config'
export const dynamic = 'force-dynamic'
// Adapted from Bittup/E&L; icons and identity remain client-owned.
export default function manifest(): MetadataRoute.Manifest {
  requireModule('pwa')
  return { name: siteConfig.nome, short_name: siteConfig.nome, description: siteConfig.seo.descricao,
    start_url: '/', scope: '/', display: 'standalone', background_color: siteConfig.theme.bgPrimary,
    theme_color: siteConfig.theme.accent, lang: 'pt-BR',
    icons: [{ src: siteConfig.logoVertical, type: 'image/png', sizes: 'any' }] }
}
