'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        router.push('/admin/login')
      } else {
        alert('Erro ao fazer logout. Tente novamente.')
      }
    } catch (error) {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded bg-[var(--color-error)] px-3 py-1 text-[var(--color-text-primary)] hover:bg-[var(--color-error)]/80 disabled:opacity-50"
    >
      {loading ? 'Saindo...' : 'Logout'}
    </button>
  )
}
