import { requireModule } from '@/core/lib/module-server'
// app/loja/categoria/[slug]/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductCategory } from '@/core/lib/seo-data'
import { pageMetadata, isIndexableProduct, slugPath } from '@/core/lib/seo'
import { seoConfig } from '@/client/config/seo.config'
import { Breadcrumbs } from '@/core/components/Breadcrumbs'

interface CategoriaPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  requireModule('store')

  const { slug } = await params

  const category = await getProductCategory(slug)
  if (!category) notFound()
  const produtos = category.products
  const categoriaNome = category.name

  if (!categoriaNome) return notFound()

  return (
    <main>
      <Breadcrumbs items={[{ name: 'Início', path: '/' }, { name: 'Loja', path: '/loja' }, { name: categoriaNome, path: slugPath('/loja/categoria/', slug) }]} />
      <section className="px-4 py-6 md:px-20 md:py-20">
        <header className="max-w-6xl mx-auto mb-8 md:mb-10">
          <h1
            className="text-2xl md:text-4xl leading-tight mb-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-logo)',
            }}
          >
            {categoriaNome}
          </h1>
        </header>

        {produtos.length === 0 ? (
          <div className="max-w-6xl mx-auto">
            <p
              className="text-sm md:text-base"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Nenhum produto encontrado nesta categoria.
            </p>

            <Link
              href="/loja"
              className="inline-flex mt-4 px-5 py-3 rounded-full text-xs md:text-sm uppercase tracking-[0.18em] transition"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {produtos.map((product) => {
              const image = product.images?.[0]?.url || '/placeholder.png'

              return (
                <Link
                  key={product.id}
                  href={`/loja/produto/${product.slug}`}
                  className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition flex flex-col"
                >
                  <div className="w-full aspect-square md:aspect-auto md:h-72 relative">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-2 md:p-4 flex flex-col flex-1">
                    <h2
                      className="text-sm md:text-xl font-semibold line-clamp-2"
                      style={{ color: 'var(--color-textPrimary)' }}
                    >
                      {product.name}
                    </h2>

                    <p className="text-green-700 font-bold text-sm md:text-lg mt-1">
                      R$ {Number(product.price).toFixed(2)}
                    </p>

                    <button className="bg-green-600 w-full mt-auto py-1 md:py-2 rounded-lg text-xs md:text-sm font-bold text-white md:mt-3">
                      VER DETALHES
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
export async function generateMetadata({ params }: CategoriaPageProps) {
  requireModule('store')
  const { slug } = await params
  const category = await getProductCategory(slug)
  if (!category) notFound()
  const editorial = seoConfig.records.categories[slug]
  return pageMetadata({ title: editorial?.title || category.name, description: editorial?.description || category.name,
    image: editorial?.image, path: slug === 'todos' ? '/loja' : slugPath('/loja/categoria/', slug),
    index: slug !== 'todos' && editorial?.published !== false && editorial?.index !== false && !!category.name.trim() && category.products.some(isIndexableProduct) })
}
