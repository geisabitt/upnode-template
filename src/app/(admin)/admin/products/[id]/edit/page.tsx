import { prisma } from '@/core/lib/prisma'
import ProductForm from '@/core/components/admin/ProductForm'

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      images: { orderBy: { createdAt: 'desc' } },
      colors: true,
      sizes: true, 
    },
  })

  if (!product) {
    return (
      <div className="rounded-3xl border border-[var(--color-error)] bg-[var(--color-error)]/20 p-8 text-[var(--color-error)] shadow-sm">
        Produto não encontrado.
      </div>
    )
  }

  // ✅ CONVERSÃO + NORMALIZAÇÃO
  const formattedProduct = {
    ...product,
    price: Number(product.price),

    // 👇 transforma em array simples (provável que seu form espera isso)
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
    <div>
      <ProductForm
        mode="edit"
        categories={categories}
        product={formattedProduct}
      />
    </div>
  )
}