/**
 * Tipos para processamento de documentos PDF (Shopee Express)
 */

export interface Destinatario {
  nome: string
  endereco: string
  pedido: string
  cep: string
  bairro: string
  rastreio: string
}

export interface Remetente {
  nome: string
  endereco: string
  cep: string
}

export interface Produto {
  nome: string
  variacao: string
  qtd: string
  valor: string
}

export interface ParsedLabel {
  emissao: string
  pedido: string
  data_envio: string
  rastreamento: string
  remetente: Remetente
  destinatario: Destinatario
  produtos: Produto[]
}

export interface ContentBounds {
  top: number
  bottom: number
  left: number
  right: number
}

export interface CanvasImage {
  dataUrl: string
  width: number
  height: number
}
