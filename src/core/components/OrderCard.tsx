/**
 * 🎨 Componente: OrderCard
 * 
 * Exibe um pedido em formato de card com layout responsivo
 * Encapsula formatação de valores e status
 */

import { OrderFromAPI } from '@/core/types/order'

interface OrderCardProps {
  pedido: OrderFromAPI
  onViewDetails: (id: string) => void
}

/**
 * Formata total com segurança (total pode ser string do Prisma)
 */
function formatTotal(total: string | number): string {
  const numericTotal = typeof total === 'string' ? parseFloat(total) : total
  if (isNaN(numericTotal)) return 'R$ 0,00'
  return `R$ ${numericTotal.toFixed(2).replace('.', ',')}`
}

/**
 * Formata data com segurança (sem hydration mismatch)
 */
function formatData(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

/**
 * Badge de status com cores
 */
function getStatusBadge(status: string | null): { text: string; color: string } {
  const statusMap: Record<string, { text: string; color: string }> = {
    'approved': { text: '✓ Aprovado', color: 'bg-green-900 text-green-300' },
    'pending': { text: '⏳ Pendente', color: 'bg-yellow-900 text-yellow-300' },
    'failed': { text: '✗ Falhou', color: 'bg-red-900 text-red-300' },
    'refunded': { text: '↩️ Reembolsado', color: 'bg-blue-900 text-blue-300' },
  }
  return statusMap[status?.toLowerCase() || 'pending'] || {
    text: 'Pendente',
    color: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
  }
}

export function OrderCard({ pedido, onViewDetails }: OrderCardProps) {
  const statusInfo = getStatusBadge(pedido.statusPagamento)

  return (
    <div className="bg-[var(--color-bg-card)] rounded-lg hover:shadow-md transition-shadow p-5 border border-[var(--color-border)]">
      {/* Cabeçalho: ID + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-tertiary)]">ID do Pedido</p>
          <p className="font-mono text-lg font-semibold text-[var(--color-text-primary)] break-all">
            {pedido.id}
          </p>
        </div>
        <div className={`mt-2 sm:mt-0 inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      </div>

      {/* Corpo: Total + Data */}
      <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-y border-[var(--color-border-light)]">
        <div>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Total</p>
          <p className="text-xl font-bold text-[var(--color-accent)]">
            {formatTotal(pedido.total)}
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Data do Pedido</p>
          <p className="text-[var(--color-text-primary)] font-medium">
            {formatData(pedido.createdAt)}
          </p>
        </div>
      </div>

      {/* Rodapé: Botão */}
      <button
        onClick={() => onViewDetails(pedido.id)}
        className="inline-block mt-2 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-bg-primary)] text-sm font-medium rounded-lg transition duration-200"
      >
        Ver detalhes completos →
      </button>
    </div>
  )
}
