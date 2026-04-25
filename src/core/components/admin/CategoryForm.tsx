'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  showOnHome?: boolean
  order?: number | null
}

type Props = {
  mode: 'create' | 'edit'
  category?: Category
}

type FormData = {
  name: string
  slug: string
  description?: string
  image?: string
  showOnHome?: boolean
  order?: number
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function CategoryForm({ mode, category }: Props) {
  const router = useRouter()
  const [manualSlug, setManualSlug] = useState(false)

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      image: category?.image || '',
      showOnHome: category?.showOnHome || false,
      order: category?.order || 0,
    },
  })

  const name = watch('name')

  // auto slug
  if (!manualSlug && name) {
    setValue('slug', slugify(name))
  }

  async function onSubmit(data: FormData) {
    const endpoint =
      mode === 'create'
        ? '/api/admin/blog/categories'
        : `/api/admin/blog/categories/${category?.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      toast.error('Erro ao salvar categoria')
      return
    }

    toast.success('Categoria salva')
    router.push('/admin/blog/categories')
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          {mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
        </h1>
        <p className="text-sm text-[var(--color-admin-text)]">
          Configure como essa categoria aparece no blog e na home.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* CONTEÚDO */}
        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Informações</h2>

          <div className="mt-6 space-y-4">

            <input
              {...register('name')}
              placeholder="Nome da categoria"
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
              {...register('description')}
              placeholder="Descrição"
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />

            <input
              {...register('image')}
              placeholder="URL da imagem"
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />

          </div>
        </section>

        {/* CONFIG */}
        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Configurações</h2>

          <div className="mt-6 space-y-4">

            <input
              type="number"
              {...register('order')}
              placeholder="Ordem (ex: 1, 2, 3)"
              className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm"
            />

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" {...register('showOnHome')} />
              Mostrar na home
            </label>

          </div>
        </section>

        {/* ACTION */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-3xl bg-[var(--color-bg-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {mode === 'create' ? 'Criar categoria' : 'Atualizar categoria'}
          </button>
        </div>

      </form>
    </div>
  )
}