/**
 * 📋 Tipos para Pedidos (Orders)
 * 
 * Este arquivo centraliza a tipagem de pedidos no projeto,
 * evitando duplicação e inconsistências.
 */

/**
 * Representação de um pedido na resposta da API
 * OBS: O Prisma retorna Decimal como string, então `total` pode ser string
 */
export type OrderFromAPI = {
  id: string
  statusPagamento: string | null
  total: string | number // ⚠️ Pode vir como string do Prisma
  createdAt: string
}

/**
 * Pedido completo com itens (para página de detalhes)
 */
export type OrderWithItems = OrderFromAPI & {
  fullName: string
  email: string
  cpf: string
  phone: string
  address: Record<string, any>
  frete: string | number | null
  items: OrderItem[]
}

/**
 * Item de um pedido
 */
export type OrderItem = {
  id: string
  orderId: string
  productId: string
  name: string
  quantity: number
  price: string | number // Também pode vir como string do Prisma
  size: string
  color: string
}

/**
 * Utilitários para conversão de tipos
 */
export const OrderTypeUtils = {
  /**
   * Converte um OrderFromAPI para um tipo seguro com números
   */
  toSafeOrder(order: OrderFromAPI): {
    id: string
    statusPagamento: string | null
    total: number
    createdAt: string
  } {
    return {
      ...order,
      total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
    }
  },

  /**
   * Converte múltiplos pedidos
   */
  toSafeOrders(orders: OrderFromAPI[]) {
    return orders.map(this.toSafeOrder)
  },

  /**
   * Valida se a resposta é um array de pedidos
   */
  isValidOrderList(data: unknown): data is OrderFromAPI[] {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          'id' in item &&
          'statusPagamento' in item &&
          'total' in item &&
          'createdAt' in item
      )
    )
  },
}
