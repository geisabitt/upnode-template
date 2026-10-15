// src/app/(admin)/admin/pedidos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Order = {
  id: string
  fullName: string
  total: number
  statusPagamento: string | null
  createdAt: string
}


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status] = useState('ALL')
  const [search] = useState('')
  const [page] = useState(1)
  const [perPage] = useState(10)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      const params = new URLSearchParams({
        status,
        search,
        page: String(page),
        perPage: String(perPage),
      })

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        signal: controller.signal,
      })
      const json = await res.json()
      setOrders(json.orders)
    }

    load().catch(() => {})

    return () => controller.abort()
  }, [status, search, page, perPage])


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <p className="text-[var(--color-text-secondary)]">Listagem completa com filtro, busca e paginação.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] shadow-sm">
       <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-[var(--color-bg-tertiary)]">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-3 text-xs">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-xs">{order.fullName}</td>
                <td className="px-4 py-3 text-xs">R${Number(order.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs">{order.statusPagamento || 'PENDENTE'}</td>
                <td className="px-4 py-3 text-xs">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>

                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs font-semibold hover:bg-[var(--color-bg-hover)]"
                  >
                    Ver pedido
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}