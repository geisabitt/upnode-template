//src/app/carrinho/page.tsx
'use client';

import { useCart } from '@/core/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CarrinhoPage() {
  const { items, removeItem, totalItems, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="p-6 text-center bg-[var(--color-bg-primary)] min-h-screen">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Seu carrinho está vazio</h2>
        <Link href="/loja" className="text-[var(--color-accent)] hover:underline">
          Voltar à loja
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-primary)]">
      <h1 className="text-3xl font-bold mb-6">Meu Carrinho ({totalItems} itens)</h1>
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={`${item.productId}-${item.color.hex}-${item.size.name}`}
            className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4"
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={600}
              height={600}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <Link href={`/loja/produto/${item.slug}`}>
                <h2 className="text-lg font-semibold hover:underline text-[var(--color-accent)]">{item.name}</h2>
              </Link>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Cor: <span className="font-medium">{item.color.name}</span>{' '}
                <span
                  className="inline-block w-4 h-4 rounded-full border ml-1"
                  style={{ backgroundColor: item.color.hex }}
                />
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">Tamanho: {item.size.name}</p>
              <p className="mt-1 text-[var(--color-accent)] font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm">Qtd: {item.quantity}</p>
              <button
                onClick={() =>
                  removeItem(item.productId, item.color.hex, item.size.name)
                }
                className="text-[var(--color-error)] hover:underline text-sm"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right">
        <p className="mb-8 text-xl font-semibold">Total: R$ {totalPrice.toFixed(2)}</p>
        <Link
          href="/loja/checkout"
          className="mt-8 bg-[var(--color-accent)] text-[var(--color-text-primary)] px-6 py-3 rounded-md hover:bg-[var(--color-accent-hover)] transition"
        >
          Finalizar Compra
        </Link>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => clearCart()}
          className="text-[var(--color-text-secondary)] hover:underline text-sm"
        >
          Limpar Carrinho
        </button>
      </div>
    </main>
  );
}
