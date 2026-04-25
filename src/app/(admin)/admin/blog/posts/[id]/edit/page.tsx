// src/app/(admin)/admin/posts/[id]/edit/page.tsx

import { prisma } from '@/core/lib/prisma'
import { notFound } from 'next/navigation'
import PostForm from '@/core/components/admin/PostForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
  })

  if (!post) return notFound()

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <PostForm
      mode="edit"
      post={post}
      categories={categories}
    />
  )
}