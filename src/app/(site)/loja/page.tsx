import Link from 'next/link'
import { prisma } from '@/core/lib/prisma'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

async function getProducts() {
  return prisma.product.findMany({
    include: {
      colors: true,
      sizes: true,
      images: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function LojaPage() {
  const products = await getProducts()

  return (
    <main>
      <section className="p-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {products.map((product) => {
          const image = product.images?.[0]?.url || '/logo-artesanaio.jpeg'

          return (
            <Link
  key={product.id}
  href={`/loja/produto/${product.slug}`}
  className="bg-white shadow-md rounded-xl overflow-hidden hover:scale-105 transition flex flex-col"
>
  <div className="w-full aspect-square relative">
    <Image
      src={image}
      alt={product.name}
      fill
      className="object-cover"
    />
  </div>

  <div className="p-2 flex flex-col flex-1">
    <h2 className="text-sm font-semibold line-clamp-2 text-[var(--color-accent)]">
      {product.name}
    </h2>

    <p className="text-green-700 font-bold text-sm mt-1">
      R$ {Number(product.price).toFixed(2)}
    </p>

    <button className="bg-green-600 w-full mt-auto py-1 rounded-lg text-xs font-bold text-white">
      VER DETALHES
    </button>
  </div>
</Link>
          )
        })}
      </section>
    </main>
  )
}