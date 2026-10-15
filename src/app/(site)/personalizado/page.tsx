import { pageMetadata } from '@/core/lib/seo'
import { getCustomPage } from '@/core/lib/seo-data'
import { seoConfig } from '@/client/config/seo.config'
export const dynamic = 'force-dynamic'
import { notFound } from "next/navigation"

type FAQItem = {
  pergunta: string
  resposta: string
}

async function getPage() { return getCustomPage('personalizado') }

export default async function PersonalizadosPage() {
  const page = await getPage()
  if (!page || seoConfig.records.pages['/personalizado']?.published === false) return notFound()

  const faqs = (page.faq as FAQItem[]) || []

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen">

      <h1 className="text-3xl font-bold">{page.title}</h1>

      {/* Intro */}
      <p className="text-[var(--color-text-secondary)]">{page.introText}</p>

      {/* FAQ */}
      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div key={i} className="border border-[var(--color-border)] rounded-2xl p-4 bg-[var(--color-bg-card)]">
            <h2 className="font-semibold">{item.pergunta}</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">{item.resposta}</p>
          </div>
        ))}
      </div>


    </div>
  )
}
export async function generateMetadata() {
  const page = await getPage()
  if (!page || seoConfig.records.pages['/personalizado']?.published === false) notFound()
  return pageMetadata({ title: page.title, description: page.introText, image: page.coverImage, path: '/personalizado', index: !!page.title.trim() })
}
