import { pageMetadata } from '@/core/lib/seo'
import { siteConfig } from '@/client/config/site.config'
export const dynamic = 'force-dynamic'
// src/app/(site)/page.tsx
import HomePage from '@/client/home/HomePage'

export default function Page() {
  return <HomePage />
}
export const metadata = pageMetadata({ title: siteConfig.seo.titulo, description: siteConfig.seo.descricao, path: '/' })
