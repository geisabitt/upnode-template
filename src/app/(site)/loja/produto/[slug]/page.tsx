import { requireModule } from '@/core/lib/module-server'
import Link from 'next/link'
import ProductDetailClient, { ProductDetailClientProps } from '@/core/components/ProductDetailClient'
import { getProduct } from '@/core/lib/seo-data'
import { pageMetadata, isIndexableProduct, productSchema, slugPath } from '@/core/lib/seo'
import { seoConfig } from '@/client/config/seo.config'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/core/components/JsonLd'
import { Breadcrumbs } from '@/core/components/Breadcrumbs'

type ProdutoPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  requireModule('store')

  const { slug } = await params

  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const productForClient: ProductDetailClientProps = {
  id: product.id,
  name: product.name,
  slug: product.slug,
  images: product.images.map((img) => img.url),
  description: product.description,
  price: Number(product.price),

  youtubeUrl: product.youtubeUrl, // ✅ AQUI

  colors: product.colors.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
  })),
  sizes: product.sizes.map((s) => ({
    id: s.id,
    name: s.name,
  })),
}

  return (
    <main className="w-full mx-auto p-6">
      <JsonLd data={productSchema(product)} />
      <Breadcrumbs items={[{ name: 'Início', path: '/' }, { name: 'Loja', path: '/loja' }, { name: product.name, path: slugPath('/loja/produto/', product.slug) }]} />
      <Link href="/loja" className="text-purple-700 hover:underline">
        ← Voltar
      </Link>

      <div className="gap-6 mt-4">
        {Number.isInteger(product.stock) && product.stock >= 0 && <p className="text-sm">{product.stock > 0 ? 'Em estoque' : 'Esgotado'}</p>}
        <ProductDetailClient product={productForClient} />
      </div>
    </main>
  )
}
export async function generateMetadata({ params }: ProdutoPageProps) {
  requireModule('store')
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const editorial = seoConfig.records.products[slug]
  return pageMetadata({ title: editorial?.title || product.name, description: editorial?.description || product.description,
    path: slugPath('/loja/produto/', slug), image: editorial?.image || product.images[0]?.url, index: isIndexableProduct(product) })
}
