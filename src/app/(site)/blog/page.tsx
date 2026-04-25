import { prisma } from '@/core/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      createdAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block bg-[var(--color-bg-tertiary)] border border-[var(--color-admin-border)] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.coverImage && (
                <div className="relative h-48">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-[var(--color-text-secondary)] mb-2">{post.excerpt}</p>
                )}
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-[var(--color-text-secondary)]">Nenhum post publicado ainda.</p>
        )}
      </div>
    </div>
  )
}