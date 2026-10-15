import { pageMetadata } from '@/core/lib/seo'
import { getCustomPage } from '@/core/lib/seo-data'
import { seoConfig } from '@/client/config/seo.config'
export const dynamic = 'force-dynamic'
import { notFound } from "next/navigation"

async function getPage() { return getCustomPage('sobre') }

export default async function SobrePage() {
  const page = await getPage()
  if (!page || seoConfig.records.pages['/sobre']?.published === false) return notFound()

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen">

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">{page.title}</h1>
        <p className="whitespace-pre-line text-[var(--color-text-secondary)] mt-2">{page.introText}</p>
      </div>

      {/* Imagens */}
      <div className="grid md:grid-cols-2 gap-6">
        {page.coverImage && (
          <img src={page.coverImage} className="rounded-2xl" />
        )}
      </div>

      {/* Seção */}
      <div>
        <h2 className="text-xl font-semibold">
          💛 {page.section1Title}
        </h2>
        <p className="whitespace-pre-line text-[var(--color-text-secondary)] mt-2">
          {page.section1Text}
        </p>
      </div>


    </div>
  ) 
}
export async function generateMetadata() {
  const page = await getPage()
  if (!page || seoConfig.records.pages['/sobre']?.published === false) notFound()
  return pageMetadata({ title: page.title, description: page.introText, image: page.coverImage, path: '/sobre', index: !!page.title.trim() })
}
