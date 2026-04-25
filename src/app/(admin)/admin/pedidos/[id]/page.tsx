// src/app/(admin)/admin/pedidos/[id]/page.tsx
import { prisma } from '@/core/lib/prisma'
import { notFound } from 'next/navigation'

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) return notFound()

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  })

  if (!order) return notFound()

  const address = order.address as any

  return (
    <div className="space-y-6  bg-[var(--color-bg-card)] p-6 rounded-2xl">
      <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>

      <div className="rounded-2xl border p-4 space-y-1">
        <p><strong>Cliente:</strong> {order.fullName}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Telefone:</strong> {order.phone}</p>

        <div>
          <strong>Endereço:</strong>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {address?.street}, {address?.number} <br />
            {address?.city} - {address?.state} <br />
            CEP: {address?.zipCode}
          </p>
        </div>

        <p><strong>Status:</strong> {order.statusPagamento}</p>
      </div>

      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Itens</h2>

        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-2 text-sm">
            <span>
              {item.name} ({item.color} / {item.size}) x{item.quantity}
            </span>
            <span>R${Number(item.price).toFixed(2)}</span>
          </div>
        ))}

        <div className="text-right font-bold mt-4">
          Total: R${Number(order.total).toFixed(2)}
        </div>
      </div>
    </div>
  )
}