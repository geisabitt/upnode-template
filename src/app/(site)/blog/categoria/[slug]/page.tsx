import { prisma } from '@/core/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params

  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!category) {
    return <div className="p-10 text-center">Categoria não encontrada</div>
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">

      {/* HEADER */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold">
          {category.name}
        </h1>

        {category.description && (
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {/* POSTS */}
      {category.posts.length === 0 ? (
        <div className="text-center text-[var(--color-text-tertiary)]">
          Nenhum conteúdo ainda.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {category.posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)] hover:shadow-md transition"
            >

              {post.coverImage && (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>
              )}

              <div className="p-4 space-y-2">
                <h2 className="text-lg font-semibold group-hover:text-[var(--color-accent)] transition">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>

            </Link>
          ))}

        </div>
      )}

    </main>
  )
}