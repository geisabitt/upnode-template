//src/components/admin/ProductForm.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { normalizeYouTubeUrl } from '@/core/lib/youtube'
import type { Category, ProductImage, AdminProduct, ProductFormData } from '@/core/types/admin'

type Props = {
  mode: 'create' | 'edit'
  categories: Category[]
  product?: AdminProduct
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProductForm({ mode, categories, product }: Props) {
  const router = useRouter()
  const [manualSlug, setManualSlug] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product?.images ?? [])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(product?.colors?.map(c => ({ name: c.name, hex: c.hex })) ?? [])
  const [sizes, setSizes] = useState<{ name: string }[]>(product?.sizes?.map(s => ({ name: s.name })) ?? [])

  const defaultValues: ProductFormData = {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price.toFixed(2) ?? '0.00',
    stock: String(product?.stock ?? 0),
    materials: product?.materials ?? '',
    handmade: product?.handmade ?? true,
    categories: product?.categories.map((category) => category.id) ?? [],
    youtubeUrl: product?.youtubeUrl ?? '',
    colors: product?.colors?.map(c => ({ name: c.name, hex: c.hex })) ?? [],
    sizes: product?.sizes?.map(s => ({ name: s.name })) ?? [],
  }

  const { register, handleSubmit, watch, setValue } = useForm<ProductFormData>({ defaultValues })
  const watchedName = watch('name')
  const youtubeUrlValue = watch('youtubeUrl')

  useEffect(() => {
    if (!manualSlug) {
      setValue('slug', slugify(watchedName || ''))
    }
  }, [watchedName, manualSlug, setValue])

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const embedUrl = useMemo(() => normalizeYouTubeUrl(youtubeUrlValue), [youtubeUrlValue])
  const visibleExistingImages = existingImages.filter((image) => !removedImageIds.includes(image.id))

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files) return

    const selected = Array.from(files)
    setSelectedFiles(selected)
    setPreviewUrls(selected.map((file) => URL.createObjectURL(file)))
  }

  function handleRemovePreview(index: number) {
    const newFiles = selectedFiles.filter((_, itemIndex) => itemIndex !== index)
    const newPreviews = previewUrls.filter((_, itemIndex) => itemIndex !== index)
    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
  }

  function handleRemoveExistingImage(imageId: string) {
    setRemovedImageIds((current) => [...current, imageId])
  }

  async function uploadSelectedFiles() {
    if (!selectedFiles.length) {
      toast.error('Selecione ao menos uma imagem para enviar.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao enviar imagens.')
      }

      setUploadedImageUrls((current) => [...current, ...(data.urls ?? [])])
      setSelectedFiles([])
      setPreviewUrls([])
      toast.success('Imagens enviadas com sucesso.')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar imagens. Verifique o arquivo e tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: ProductFormData) {
    const normalizedYoutubeUrl = values.youtubeUrl ? normalizeYouTubeUrl(values.youtubeUrl) : null
    const selectedCategories = Array.isArray(values.categories) ? values.categories : [values.categories]
    const finalExistingImageUrls = visibleExistingImages.map((image) => image.url)
    const hasImages = mode === 'create' ? uploadedImageUrls.length > 0 : finalExistingImageUrls.length + uploadedImageUrls.length > 0

    if (!hasImages) {
      toast.error('Adicione ao menos uma imagem ao produto.')
      return
    }

    const body = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      price: Number(values.price),
      stock: Number(values.stock),
      materials: values.materials || null,
      handmade: values.handmade,
      categories: selectedCategories,
      youtubeUrl: normalizedYoutubeUrl,
      imageUrls: uploadedImageUrls,
      removeImageIds: removedImageIds,
      colors: colors,
      sizes: sizes,
    }

    setIsSaving(true)

    try {
      const endpoint = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${product?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Erro ao salvar produto.')
      }

      toast.success(`Produto ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso.`)
      router.push('/admin/products')
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || 'Não foi possível salvar o produto.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Criar produto' : 'Editar produto'}</h1>
            <p className="text-sm text-[var(--color-admin-text)]">Preencha os dados do produto e carregue as imagens.</p>
          </div>
          <div className="rounded-full bg-[var(--color-bg-tertiary)] px-4 py-2 text-sm text-[var(--color-admin-text)]">Modo {mode === 'create' ? 'criação' : 'edição'}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Informações básicas</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
              Nome
              <input {...register('name', { required: true })} className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]" />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
              Slug
              <input
                {...register('slug', { required: true })}
                onChange={(event) => {
                  setManualSlug(true)
                  setValue('slug', event.target.value)
                }}
                className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>
          </div>

          <label className="mt-6 block space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
            Descrição
            <textarea
              {...register('description', { required: true })}
              rows={5}
              className="w-full rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            />
          </label>
        </section>

        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Mídia do produto</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
              Vídeo do YouTube (URL)
              <input
                {...register('youtubeUrl')}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
              Materiais
              <input
                {...register('materials')}
                className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>
          </div>

          {embedUrl ? (
            <div className="mt-6 rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-primary)] p-4 text-[var(--color-text-primary)]">
              <p className="text-sm font-medium">Prévia do vídeo</p>
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-[var(--color-bg-primary)]">
                <iframe
                  src={embedUrl}
                  title="Prévia do Youtube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          ) : (youtubeUrlValue && <p className="mt-4 text-sm text-rose-600">URL do YouTube inválida.</p>)}

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Imagens</p>
              <button
                type="button"
                onClick={uploadSelectedFiles}
                disabled={!selectedFiles.length || isUploading}
                className="rounded-2xl bg-[var(--color-bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)]"
              >
                {isUploading ? 'Enviando...' : 'Enviar imagens'}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="cursor-pointer rounded-3xl border border-dashed border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-6 text-center text-sm text-[var(--color-text-tertiary)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)]">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelection} />
                Selecione ou arraste imagens
              </label>
              <p className="text-sm text-[var(--color-text-tertiary)]">Selecione várias imagens JPEG/PNG para o produto.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleExistingImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)]">
                  <img src={image.url} alt="Imagem do produto" className="h-48 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(image.id)}
                    className="absolute right-3 top-3 rounded-full bg-[var(--color-bg-primary)]/70 px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]"
                  >
                    Remover
                  </button>
                </div>
              ))}
              {previewUrls.map((src, index) => (
                <div key={src} className="relative overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)]">
                  <img src={src} alt="Prévia" className="h-48 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(index)}
                    className="absolute right-3 top-3 rounded-full bg-[var(--color-error)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]"
                  >
                    Remover
                  </button>
                </div>
              ))}
              {uploadedImageUrls.map((url) => (
                <div key={url} className="overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)]">
                  <img src={url} alt="Carregado" className="h-48 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Preço, estoque e categorias</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
              Preço
              <input
                {...register('price', { required: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
              Estoque
              <input
                {...register('stock', { required: true })}
                type="number"
                min="0"
                className="w-full rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
              />
            </label>
          </div>

          <label className="mt-6 block space-y-2 text-sm font-medium text-[var(--color-admin-text)]">
            Categorias
            <select
              {...register('categories')}
              multiple
              className="h-40 w-full rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)]"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-[var(--color-admin-text)]">
            <input {...register('handmade')} type="checkbox" className="h-4 w-4 rounded border-[var(--color-admin-border)] text-[var(--color-bg-primary)] focus:ring-[var(--color-bg-primary)]" />
            Produto artesanal
          </label>
        </section>

        <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cores e Tamanhos</h2>
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-2">Cores</label>
              <div className="space-y-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nome da cor"
                      value={color.name}
                      onChange={(e) => {
                        const newColors = [...colors]
                        newColors[index].name = e.target.value
                        setColors(newColors)
                      }}
                      className="flex-1 rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-sm outline-none transition focus:border-[var(--color-accent)]"
                    />
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => {
                        const newColors = [...colors]
                        newColors[index].hex = e.target.value
                        setColors(newColors)
                      }}
                      className="w-12 h-10 rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => setColors(colors.filter((_, i) => i !== index))}
                      className="rounded-2xl bg-[var(--color-error)] px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setColors([...colors, { name: '', hex: '#000000' }])}
                  className="rounded-2xl bg-[var(--color-bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                >
                  + Adicionar Cor
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-2">Tamanhos</label>
              <div className="space-y-2">
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nome do tamanho"
                      value={size.name}
                      onChange={(e) => {
                        const newSizes = [...sizes]
                        newSizes[index].name = e.target.value
                        setSizes(newSizes)
                      }}
                      className="flex-1 rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 text-sm outline-none transition focus:border-[var(--color-accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                      className="rounded-2xl bg-[var(--color-error)] px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSizes([...sizes, { name: '' }])}
                  className="rounded-2xl bg-[var(--color-bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                >
                  + Adicionar Tamanho
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-3xl bg-[var(--color-bg-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)]"
          >
            {isSaving ? 'Salvando...' : mode === 'create' ? 'Criar produto' : 'Atualizar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
