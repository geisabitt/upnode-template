import Link from 'next/link'
import ProductDetailClient, { ProductDetailClientProps } from '@/core/components/ProductDetailClient'
import prisma from '@/core/lib/prisma'

type ProdutoPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      colors: true,
      sizes: true,
      images: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!product) {
    return <div className="p-4 text-red-600">Produto não encontrado.</div>
  }

  // ✅ pega imagem principal
  const image = product.images?.[0]?.url || '/logo-artesanaio.jpeg'

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
      <Link href="/loja" className="text-purple-700 hover:underline">
        ← Voltar
      </Link>

      <div className="gap-6 mt-4">
        <ProductDetailClient product={productForClient} />
      </div>
    </main>
  )
}