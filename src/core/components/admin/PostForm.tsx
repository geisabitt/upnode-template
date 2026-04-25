'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import DeletePostButton from '@/core/components/admin/DeletePostButton'
import toast from 'react-hot-toast'
import type { Category, Post, PostFormData } from '@/core/types/admin'

type Props = {
  mode: 'create' | 'edit'
  categories: Category[]
  post?: Post
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function PostForm({ mode, categories, post }: Props) {
  const router = useRouter()

  const [manualSlug, setManualSlug] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(post?.coverImage || null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(post?.coverImage || null)
  const [isUploading, setIsUploading] = useState(false)

  const { register, handleSubmit, watch, setValue } = useForm<PostFormData>({
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      coverImage: post?.coverImage || '',
      categoryId: post?.categoryId || '',
      published: post?.published || false,
    },
  })

  const title = watch('title')

  useEffect(() => {
    if (!manualSlug) {
      setValue('slug', slugify(title))
    }
  }, [title, manualSlug, setValue])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function uploadImage() {
    if (!selectedFile) {
      toast.error('Selecione uma imagem')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('files', selectedFile)

      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error()

      const url = data.urls[0]

      setUploadedUrl(url)
      setValue('coverImage', url)

      toast.success('Imagem enviada')
    } catch {
      toast.error('Erro no upload')
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(data: PostFormData) {

      if (!uploadedUrl) {
    toast.error('Imagem de capa é obrigatória')
    return
  }
    const endpoint =
      mode === 'create'
        ? '/api/admin/blog/posts'
        : `/api/admin/blog/posts/${post?.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        coverImage: uploadedUrl || data.coverImage,
      }),
    })

    if (!res.ok) {
      toast.error('Erro ao salvar')
      return
    }

    toast.success('Salvo com sucesso')
    router.push('/admin/blog/posts')
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          {mode === 'create' ? 'Novo Post' : 'Editar Post'}
        </h1>
        <p className="text-sm text-[var(--color-admin-text)]">
          Preencha os dados do post e imagem de capa.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* CONTEÚDO */}
        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Conteúdo</h2>

          <div className="mt-6 space-y-4">
            <input
              {...register('title')}
              placeholder="Título"
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />

            <input
              {...register('slug')}
              onChange={(e) => {
                setManualSlug(true)
                setValue('slug', e.target.value)
              }}
              placeholder="Slug"
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />

            <textarea
              {...register('excerpt')}
              placeholder="Resumo"
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />

            <textarea
              {...register('content')}
              rows={10}
              placeholder="Conteúdo"
              className="w-full rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />
          </div>
        </section>

        {/* IMAGEM */}
        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Imagem de capa</h2>

          <div className="mt-6 space-y-4">

            <label className="cursor-pointer rounded-3xl border border-dashed border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-6 text-center text-sm">
              <input type="file" className="hidden" onChange={handleFileChange} />
              Selecione uma imagem
            </label>

            <button
              type="button"
              onClick={uploadImage}
              disabled={!selectedFile || isUploading}
              className="rounded-2xl bg-[var(--color-bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              {isUploading ? 'Enviando...' : 'Enviar imagem'}
            </button>

            {preview && (
              <div className="overflow-hidden rounded-3xl border border-[var(--color-admin-border)]">
                <img src={preview} className="h-48 w-full object-cover" />
              </div>
            )}

          </div>
        </section>

        {/* CONFIG */}
        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Configurações</h2>

          <div className="mt-6 space-y-4">
            <select
              {...register('categoryId')}
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" {...register('published')} />
              Publicado
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-3xl bg-[var(--color-bg-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {mode === 'create' ? 'Criar post' : 'Atualizar post'}
          </button>
        </div>

      </form>
    </div>
  )
}