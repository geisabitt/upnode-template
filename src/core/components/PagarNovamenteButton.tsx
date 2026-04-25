'use client'
import { useRouter } from 'next/navigation'

interface PagarNovamenteButtonProps {
  orderId: string
}

export function PagarNovamenteButton({ orderId }: PagarNovamenteButtonProps) {
  const router = useRouter()

  const handlePagarNovamente = () => {
    router.push(`/loja/pedido/${orderId}/pagamento`)
  }

  return (
    <button
      className="mt-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-bg-primary)] px-4 py-2 rounded-lg font-medium transition duration-200"
      onClick={handlePagarNovamente}
    >
      Pagar novamente
    </button>
  )
}