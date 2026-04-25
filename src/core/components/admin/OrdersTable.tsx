// src/components/admin/OrdersTable.tsx
import Link from 'next/link'
import { format } from 'date-fns'

type OrderItem = {
  id: string
  fullName: string
  total: number
  statusPagamento: string | null
  createdAt: Date
}

type Props = {
  orders: OrderItem[]
}

export function OrdersTable({ orders }: Props) {
  return (
   <div className="overflow-x-auto rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]">
      <div className="px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">Últimos pedidos</h2>
      </div>

      <table className="min-w-[700px] w-full text-sm">
        <thead className="bg-[var(--color-bg-tertiary)]">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2 text-left">Cliente</th>
            <th className="px-4 py-2 text-left">Valor</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Data</th>
            <th className="px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="px-4 py-3 text-xs">{order.id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-xs">{order.fullName}</td>
              <td className="px-4 py-3 text-xs font-semibold">R${order.total.toFixed(2)}</td>
              <td className="px-4 py-3 text-xs">{order.statusPagamento || 'PENDENTE'}</td>
              <td className="px-4 py-3 text-xs">{format(order.createdAt, 'dd/MM/yyyy')}</td>

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
  )
}