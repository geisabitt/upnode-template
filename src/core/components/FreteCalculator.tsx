// src/components/FreteCalculator.tsx
'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

type FreteOption = {
  id: number
  name: string
  price: string
  delivery_time: string
}

type Props = {
  quantidade: number // Alterado de pesoTotalKg para quantidade
}

export default function FreteCalculator({ quantidade }: Props) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [fretes, setFretes] = useState<FreteOption[] | null>(null)

  const handleCalculateFrete = async () => {
    if (cep.length !== 8) {
      toast.error('Digite um CEP válido com 8 dígitos')
      return
    }

    setLoading(true)
    setFretes(null)

    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cepDestino: cep,
          quantidade, // Passa a quantidade em vez do peso
        }),
      })

      if (!res.ok) throw new Error('Erro ao calcular frete')
      const data = await res.json()

      if (!Array.isArray(data)) {
        throw new Error('Resposta inesperada da API')
      }

      setFretes(data.map((f) => ({
        id: f.id,
        name: f.name,
        price: f.price,
        delivery_time: f.delivery_time,
      })))
    } catch (error) {
      toast.error('Erro ao calcular frete.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 rounded-md">
      <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Calcular Frete</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
          className="border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-admin-text)] rounded px-3 py-2 w-full focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
          maxLength={8}
        />
        <button
          onClick={handleCalculateFrete}
          className="bg-[var(--color-success)] text-[var(--color-text-primary)] px-4 py-2 rounded hover:bg-[var(--color-success)]/80 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      {fretes && fretes.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Opções de Frete:</h4>
          <ul className="space-y-1">
            {fretes.map((f) => (
              <li key={f.id} className="text-sm text-[var(--color-text-secondary)]">
                <strong>{f.name}</strong>: R$ {parseFloat(f.price).toFixed(2)} — entrega em {f.delivery_time} dias úteis
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}