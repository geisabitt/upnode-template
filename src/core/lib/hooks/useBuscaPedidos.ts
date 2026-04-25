/**
 * 🪝 Hook: useBuscaPedidos
 * 
 * Gerencia a busca de pedidos com tratamento de erros e loading
 * Mantém a página limpa e a lógica reutilizável
 */

import { useState } from 'react'
import { OrderFromAPI, OrderTypeUtils } from '@/core/types/order'

export function useBuscaPedidos() {
  const [pedidos, setPedidos] = useState<OrderFromAPI[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [semResultados, setSemResultados] = useState(false)

  async function buscar(email: string, cpf: string) {
    setLoading(true)
    setErro('')
    setSemResultados(false)

    try {
      const res = await fetch('/api/orders/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cpf }),
      })

      if (!res.ok) {
        if (res.status === 404) {
          setSemResultados(true)
          setPedidos([])
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      // 🔍 Validação rigorosa
      if (!OrderTypeUtils.isValidOrderList(data)) {
        throw new Error('Resposta inválida da API: formato incorreto')
      }

      setPedidos(data)
      if (data.length === 0) {
        setSemResultados(true)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      setErro(`Não foi possível buscar os pedidos: ${errorMsg}`)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  return {
    pedidos,
    loading,
    erro,
    semResultados,
    buscar,
    // Útil para reset manual
    reset: () => {
      setPedidos([])
      setErro('')
      setSemResultados(false)
    }
  }
}
