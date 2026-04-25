'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Props = {
  productId: string
}

export default function DeleteProductButton({ productId }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.')
    if (!confirmDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.message || 'Erro ao excluir produto')
      }

      toast.success('Produto excluído com sucesso.')
      router.push('/admin/products')
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível excluir o produto.')
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md bg-[var(--color-error)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-error)]/80 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)]"
    >
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
