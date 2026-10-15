'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data?.error || 'Falha no login')
      } else {
        router.push('/admin')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <div className="w-full max-w-md bg-[var(--color-admin-bg)] p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Login Admin</h1>

        {error && (
          <div className="mb-4 px-3 py-2 text-sm text-[var(--color-error)] bg-[var(--color-error)]/20 rounded">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] rounded outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-admin-text)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)]">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] rounded outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-admin-text)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[var(--color-info)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-info)]/80 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
