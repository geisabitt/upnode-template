// src/components/admin/DeletePostButton.tsx

'use client'

import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter()

    async function handleDelete() {
    if (!confirm('Excluir post?')) return

    try {
        const res = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
        })

        if (!res.ok) throw new Error()

        toast.success('Post excluído')
        router.refresh()
    } catch {
        toast.error('Erro ao excluir')
    }
    }

    return (
    <button
        onClick={handleDelete}
        className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white"
    >
        Excluir
    </button>
    )
}