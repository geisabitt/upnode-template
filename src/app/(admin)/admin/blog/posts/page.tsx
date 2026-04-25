import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/core/lib/prisma'
import DeletePostButton from '@/core/components/admin/DeletePostButton'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Gerencie os artigos do blog
          </p>
        </div>

        <Link
          href="/admin/blog/posts/new"
          className="btn-primary"
        >
          + Novo post
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-bg-tertiary)]">
            <tr>
              <th className="px-4 py-3">Imagem</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>

        <tbody>
        {posts.map((post) => (
            <tr key={post.id} className="border-t">

            <td className="px-4 py-3">
                {post.coverImage && (
                <Image
                    src={post.coverImage}
                    width={80}
                    height={60}
                    alt={post.title}
                    className="rounded-xl object-cover"
                />
                )}
            </td>

            <td className="px-4 py-3">{post.title}</td>

            <td className="px-4 py-3">
                {post.category?.name || '-'}
            </td>

            <td className="px-4 py-3">
                {post.published ? 'Publicado' : 'Rascunho'}
            </td>

            <td className="px-4 py-3 space-x-2">

                <Link
                href={`/admin/blog/posts/${post.id}/edit`}
                className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs font-semibold text-[var(--color-admin-text)] hover:bg-[var(--color-bg-hover)]"
                >
                Editar
                </Link>

            <DeletePostButton postId={post.id} />

            </td>

            </tr>
        ))}
        </tbody>
        </table>
      </div>

    </div>
  )
}