/**
 * Gerador de conteúdo de impressão
 * Formata dados para impressão térmica 58mm
 */
import type { ParsedLabel, Produto } from '../pdf/types'

export class PrintGenerator {
  private static readonly DECLARATION = `
DECLARAÇÃO DE CONTEÚDO

Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/1996, uma vez que não realizo, com habitualidade ou em volume que caracterize intuito comercial, operações de circulação de mercadoria, ainda que se iniciem no exterior, ou estou dispensado da emissão da nota fiscal por força da legislação tributária vigente, responsabilizando-me, nos termos da lei e a quem de direito, por informações inverídicas.

Declaro que não envio objeto que ponha em risco o transporte aéreo, nem objeto proibido no fluxo postal, assumindo responsabilidade pela informação prestada, e ciente de que o descumprimento pode configurar crime, conforme artigo 261 do Código Penal Brasileiro. Declaro, ainda, estar ciente da lista de proibições e restrições, disponível no site dos Correios:
https://www.correios.com.br
/enviar/proibicoes-erestricoes
/proibicoes-e-restricoes.

_____________________________


_____de__________de__________


_____________________________
Assinatura do Remetente

`

  /**
   * Gera texto formatado para impressão em 58mm
   */
  static generate(data: ParsedLabel): string {
    return `
================================

ITENS:
${data.produtos
  .map((p: Produto) => `${p.qtd}x ${this.wrapText(p.variacao, 20)} R$${p.valor}`)
  .join('\n')}

================================
`
  }

  /**
   * Gera HTML para impressão com imagens das etiquetas e itens
   */
  static generatePrintHTML(labelParts: string[], itemsContent: string = ''): string {
    const imagesHtml = labelParts
      .map(
        (img) => `
      <div class="etiqueta">
        <img src="${img}" alt="Etiqueta" />
      </div>
    `
      )
      .join('')

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Etiquetas - ArtesaNaio</title>
<style>
@media print {
  @page {
    size: 57mm auto;
    margin: 0;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }

  body {
    margin-right: 3mm;
    margin-left: 0;
    padding: 0;
    font-family: monospace;
    font-size: 12px;
    background: white;
  }

  .etiqueta {
    width: 54mm;
    min-width: 100%;
    min-height: 120mm;
    max-height: 120mm;
    page-break-after: always;
    break-after: page;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background: white;
  }

  .etiqueta img {
    transform: rotate(90deg);
    transform-origin: center;
    width: 11cm;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .declaracao {
    margin-top: 10mm;
    margin-left: 4mm;
    margin-right: 4mm;
    white-space: pre-wrap;
    page-break-before: always;
    break-before: page;
    font-size: 12px;
    line-height: 1.4;
  }
}

@media screen {
  body {
    font-family: monospace;
    padding: 20px;
  }

  .etiqueta {
    margin: 20px 0;
    border: 1px solid var(--color-border);
    padding: 10px;
  }

  .etiqueta img {
    max-width: 100%;
  }
}
</style>
</head>
<body>

${imagesHtml}

<div class="declaracao">
<pre style="margin:4mm; font-family:monospace; font-size:12px; white-space:pre-wrap;">${itemsContent}${this.DECLARATION}</pre>
</div>

</body>
</html>
`
  }

  /**
   * Quebra texto respeitando largura máxima (em caracteres)
   */
  private static wrapText(text: string, maxWidth = 32): string {
    if (!text) return ''

    const words = text.split(' ')
    let line = ''
    let result = ''

    for (const word of words) {
      if ((line + word).length > maxWidth) {
        if (line) result += line + '\n'
        line = word + ' '
      } else {
        line += word + ' '
      }
    }

    return result + line
  }

  /**
   * Retorna string segura ou placeholder
   */
  private static safe(value: string): string {
    return value || '---'
  }
}
