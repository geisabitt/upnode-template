import { requireModule } from '@/core/lib/module-server'
import { getPublishedPost } from '@/core/lib/seo-data'
import { pageMetadata, isIndexablePost, isPublishedPost, blogPostingSchema, slugPath } from '@/core/lib/seo'
import { seoConfig } from '@/client/config/seo.config'
import { JsonLd } from '@/core/components/JsonLd'
import { Breadcrumbs } from '@/core/components/Breadcrumbs'
import { ContentBody } from '@/core/components/ContentBody'
import { RelatedContent } from '@/core/components/RelatedContent'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  requireModule('blog')

  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post || !isPublishedPost(post)) notFound()
  const editorial = seoConfig.records.posts[slug]
  return pageMetadata({ title: editorial?.title || post.seo?.metaTitle || post.title,
    description: editorial?.description || post.seo?.metaDesc || post.excerpt || post.content,
    path: slugPath('/blog/', slug), image: editorial?.image || post.coverImage,
    index: isIndexablePost(post), article: true, keywords: post.seo?.keywords })
}

export default async function BlogPostPage({ params }: PageProps) {
  requireModule('blog')

  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post || !isPublishedPost(post)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <article className="max-w-4xl mx-auto px-4 py-8">
        <JsonLd data={blogPostingSchema(post)} />
        <Breadcrumbs items={[{ name: 'Início', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: slugPath('/blog/', post.slug) }]} />
        {post.coverImage && (
          <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <p className="text-[var(--color-text-secondary)]">
            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </header>

<div className="prose prose-lg prose-invert max-w-none whitespace-pre-line">
  <ContentBody content={post.content} format={seoConfig.records.posts[post.slug]?.format} />
</div>
        {post.category && <p className="mt-4"><a href={slugPath('/blog/categoria/', post.category.slug)}>{post.category.name}</a></p>}
        <RelatedContent related={seoConfig.records.posts[post.slug]?.related} />
      </article>
    </div>
  )
}