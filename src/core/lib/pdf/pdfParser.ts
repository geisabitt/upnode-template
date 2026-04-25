/**
 * Parser de dados Shopee Express
 * Extrai informações de rastreamento, endereços e produtos do texto do PDF
 */
import type { ParsedLabel, Produto, Destinatario, Remetente } from './types'

export class ShopeeParser {
  /**
   * Parse completo do conteúdo de texto do PDF
   */
  static parse(text: string): ParsedLabel {
    return {
      emissao: this.extractEmissao(text),
      pedido: this.extractPedido(text),
      data_envio: this.extractDataEnvio(text),
      rastreamento: this.extractRastreamento(text),
      remetente: this.extractRemetente(text),
      destinatario: this.extractDestinatario(text),
      produtos: this.extractProdutos(text)
    }
  }

  private static extractEmissao(text: string): string {
    return text.match(/Emissão:\s*(.*?)\s+Pedido:/)?.[1] ?? ''
  }

  private static extractPedido(text: string): string {
    return text.match(/Pedido:\s*(.*?)\s+CEP:/)?.[1] ?? ''
  }

  private static extractDataEnvio(text: string): string {
    return text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? ''
  }

  private static extractRastreamento(text: string): string {
    return text.match(/BR\d{12,}/)?.[0] ?? ''
  }

  private static extractRemetente(text: string): Remetente {
    const remetenteMatch = text.match(
      /(BR\d{12,}B?)\s+([A-Za-zÀ-ÿ]+)\s+(Rua .*?Nilópolis.*?\d{8})/
    )

    const enderecoCompleto = remetenteMatch?.[3] ?? ''
    const cepMatch = enderecoCompleto.match(/(\d{8})$/)

    return {
      nome: remetenteMatch?.[2] ?? 'ArtesaNaio',
      endereco: enderecoCompleto.replace(/\d{8}$/, '').trim(),
      cep: cepMatch?.[1] ?? ''
    }
  }

  private static extractDestinatario(text: string): Destinatario {
    const destinatarioMatch = text.match(
      /(Rua .*?,.*?Rio de Janeiro.*?)\s+([A-Z0-9]{10,})\s+(\d{5}-\d{3})\s+([A-Za-zÀ-ÿ\s]+?)\s+(BR\d{12,}B?)/
    )

    return {
      nome: this.extractNomeDestinatario(text),
      endereco: destinatarioMatch?.[1] ?? '',
      pedido: destinatarioMatch?.[2] ?? '',
      cep: destinatarioMatch?.[3] ?? '',
      bairro: destinatarioMatch?.[4]?.trim() ?? '',
      rastreio: destinatarioMatch?.[5] ?? ''
    }
  }

  private static extractNomeDestinatario(text: string): string {
    const match = text.match(
      /\d{2}\/\d{2}\/\d{4}\s+([A-Z][A-Za-z\s]+?)\s+Encontre/
    )
    return match?.[1]?.trim() ?? 'NOME NÃO IDENTIFICADO'
  }

  private static extractProdutos(text: string): Produto[] {
    const produtos: Produto[] = []
    const regex =
      /(\d+)\s+(Pulseira.*?)\s+([A-Za-zçÇ\s,0-9]+?)\s+(\d+)\s+([\d.]+)/g

    let match
    while ((match = regex.exec(text)) !== null) {
      produtos.push({
        nome: match[2],
        variacao: match[3],
        qtd: match[4],
        valor: match[5]
      })
    }

    return produtos
  }
}
