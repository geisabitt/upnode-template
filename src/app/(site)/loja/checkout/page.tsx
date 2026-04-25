//src/app/checkout/page.tsx
'use client'

import CheckoutForm from '@/core/components/CheckoutForm'
import Link from 'next/link'
import { useCart } from '@/core/context/CartContext'

export default function CheckoutPage() {
  const { items } = useCart()

  return (
    <main className="max-w-5xl mx-auto p-6 bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-primary)]">
      <Link href="/loja" className="text-[var(--color-accent)] hover:underline">
        ← Voltar à loja
      </Link>

      <h1 className="text-2xl font-bold my-4">Finalizar Pedido</h1>

      {items.length === 0 ? (
        <p className="text-[var(--color-text-tertiary)]">Seu carrinho está vazio.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <CheckoutForm />
          </div>

          <div className="order-1 lg:order-2 bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border)] p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color.hex}-${item.size.name}`}
                className="flex justify-between text-sm mb-2"
              >
                <span>
                  {item.name} ({item.size.name}, {item.color.name}) × {item.quantity}
                </span>
                <span>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
