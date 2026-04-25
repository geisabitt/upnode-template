import { prisma } from '@/core/lib/prisma'
import { notFound } from 'next/navigation'
import { PagarNovamenteButton } from '@/core/components/PagarNovamenteButton'

interface PedidoPageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ status?: string; payment_id?: string }>
}

export default async function PedidoPage({ params, searchParams }: PedidoPageProps) {
  const { id } = await params
  const query = await searchParams

  const statusQuery = query?.status
  const paymentId = query?.payment_id

  // 🥇 BUSCA PEDIDO PRIMEIRO
  let order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order) return notFound()

  if (
    statusQuery === 'approved' &&
    paymentId &&
    order.statusPagamento !== 'approved'
  ) {
    await prisma.order.update({
      where: { id },
      data: { statusPagamento: 'approved' },
    })

    order = { ...order, statusPagamento: 'approved' }
  }

  // 🧠 STATUS
  const statusText = {
    approved: 'Pagamento aprovado!',
    pending: 'Pagamento pendente. Aguarde confirmação.',
    rejected: 'Pagamento recusado. Tente novamente.',
    failure: 'Erro no pagamento. Tente novamente.',
    success: 'Pedido criado. Aguarde confirmação do pagamento.',
  }

  const displayStatus = order.statusPagamento || statusQuery || 'success'

  // 💰 VALORES
  const totalProdutos =
    order.items?.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    ) ?? 0

  const frete = order.frete ?? 0
  const totalGeral = Number(totalProdutos) + Number(frete)

  const itemsForButton = order.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: Number(item.price),
  }))

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">

      <a
        href="/loja/meus-pedidos"
        className="text-[var(--color-accent)] hover:underline mb-4 inline-block"
      >
        ← Voltar aos meus pedidos
      </a>

      <h1 className="text-2xl font-bold mb-4">
        Pedido #{order.id.slice(0, 8)}
      </h1>

      <div className="mb-6 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)]">
        <p className="text-lg font-semibold">
          {statusText[displayStatus as keyof typeof statusText] ||
            'Aguardando pagamento...'}
        </p>

        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
          Status atual: {order.statusPagamento || 'aguardando'}
        </p>

        {displayStatus !== 'approved' && (
          <PagarNovamenteButton
            orderId={order.id}
          />
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">
        Itens do pedido:
      </h2>

      <ul className="space-y-2 mb-6">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="border border-[var(--color-border-light)] p-3 rounded-lg bg-[var(--color-bg-tertiary)]"
          >
            <p className="font-medium">{item.name}</p>

            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Quantidade: {item.quantity} — Tamanho: {item.size} — Cor: {item.color}
            </p>

            <p className="text-sm font-semibold text-[var(--color-accent)] mt-1">
              R$ {(Number(item.price) * item.quantity).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-[var(--color-border)] pt-4 mt-8 text-right">
        <div className="mb-2 text-[var(--color-text-secondary)]">
          Subtotal: R$ {totalProdutos.toFixed(2)}
        </div>

        <div className="mb-3 text-[var(--color-text-secondary)]">
          Frete: R$ {frete.toFixed(2)}
        </div>

        <div className="font-bold text-lg text-[var(--color-accent)]">
          Total: R$ {totalGeral.toFixed(2)}
        </div>
      </div>
    </main>
  )
}