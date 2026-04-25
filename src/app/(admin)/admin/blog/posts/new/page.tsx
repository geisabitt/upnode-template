// src/app/(admin)/admin/posts/new/page.tsx

import { prisma } from '@/core/lib/prisma'
import PostForm from '@/core/components/admin/PostForm'

export default async function NewPostPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <PostForm
      mode="create"
      categories={categories}
    />
  )
}