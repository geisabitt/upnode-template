/**
 * Processador de PDFs usando pdfjs-dist
 * Responsável por: carregar PDF, extrair texto, gerar imagens e fazer crop
 */
import type { ContentBounds, CanvasImage } from './types'

interface ThermalFilterOptions {
  contrast: number
  brightness: number
  useDithering: boolean
  threshold?: number
}

export class PDFProcessor {
  // Para impressão térmica 58mm em alta resolução (300 DPI profissional)
  private static readonly TARGET_DPI = 300
  private static readonly TARGET_WIDTH_MM = 58
  private static readonly MIN_SCALE = 5
  private static readonly WHITE_THRESHOLD = 240

  // Configuração padrão para impressão térmica
  private static readonly DEFAULT_THERMAL_OPTIONS: ThermalFilterOptions = {
    contrast: 2.8,
    brightness: 0,
    useDithering: false,
    threshold: undefined
  }

  /**
   * Carrega e processa um PDF, extraindo texto e imagem
   */
  static async processPDF(file: File): Promise<{
    fullText: string
    labelImage: string
  }> {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

    const fullText = await this.extractTextFromAllPages(pdf)
    const labelImage = await this.renderPageToImage(pdf, 1)

    return { fullText, labelImage }
  }

  /**
   * Extrai texto de todas as páginas do PDF
   */
  private static async extractTextFromAllPages(pdf: any): Promise<string> {
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map((item: any) => item.str)
      fullText += strings.join(' ') + '\n'
    }

    return fullText
  }

  /**
   * Renderiza uma página específica em imagem
   */
  private static async renderPageToImage(
    pdf: any,
    pageNumber: number
  ): Promise<string> {
    const page = await pdf.getPage(pageNumber)

    const firstViewport = page.getViewport({ scale: 1 })
    const targetWidthPx = Math.round(
      (this.TARGET_WIDTH_MM / 25.4) * this.TARGET_DPI
    )
    const scale = Math.max(targetWidthPx / firstViewport.width, this.MIN_SCALE)

    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)

    await page.render({
      canvasContext: context,
      viewport,
      canvas
    } as any).promise

    this.applyThermalFilter(canvas, this.DEFAULT_THERMAL_OPTIONS)

    return canvas.toDataURL('image/png')
  }

  /**
   * Remove espaços em branco da borda da imagem (crop automático)
   */
  static findContentBounds(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): ContentBounds {
    const imageData = ctx.getImageData(0, 0, width, height).data

    return {
      top: this.findTopBound(imageData, width, height),
      bottom: this.findBottomBound(imageData, width, height),
      left: this.findLeftBound(imageData, width, height),
      right: this.findRightBound(imageData, width, height)
    }
  }

  /**
   * Faz crop na imagem usando os bounds encontrados
   */
  static cropCanvas(
    sourceCanvas: HTMLCanvasElement,
    bounds: ContentBounds
  ): HTMLCanvasElement {
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')!

    croppedCtx.imageSmoothingEnabled = true
    croppedCtx.imageSmoothingQuality = 'high'

    const cropWidth = bounds.right - bounds.left
    const cropHeight = bounds.bottom - bounds.top

    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight

    croppedCtx.drawImage(
      sourceCanvas,
      bounds.left,
      bounds.top,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    )

    return croppedCanvas
  }

  /**
   * Divide a imagem em slices verticais conforme as proporções especificadas
   */
  static sliceCanvasVertically(
    canvas: HTMLCanvasElement,
    proportions: Array<[number, number]>
  ): string[] {
    const parts: string[] = []
    const width = canvas.width
    const height = canvas.height

    for (const [start, end] of proportions) {
      const y = height * start
      const sliceHeight = height * (end - start)

      const partCanvas = document.createElement('canvas')
      const partCtx = partCanvas.getContext('2d')!

      partCanvas.width = width
      partCanvas.height = sliceHeight

      partCtx.drawImage(
        canvas,
        0,
        y,
        width,
        sliceHeight,
        0,
        0,
        width,
        sliceHeight
      )

      parts.push(partCanvas.toDataURL('image/png'))
    }

    return parts
  }

  // Privadas para encontrar limites de conteúdo
  private static findTopBound(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        if (!this.isWhite(data[i], data[i + 1], data[i + 2])) {
          return y
        }
      }
    }
    return 0
  }

  private static findBottomBound(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        if (!this.isWhite(data[i], data[i + 1], data[i + 2])) {
          return y
        }
      }
    }
    return height
  }

  private static findLeftBound(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4
        if (!this.isWhite(data[i], data[i + 1], data[i + 2])) {
          return x
        }
      }
    }
    return 0
  }

  private static findRightBound(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    for (let x = width - 1; x >= 0; x--) {
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4
        if (!this.isWhite(data[i], data[i + 1], data[i + 2])) {
          return x
        }
      }
    }
    return width
  }

  private static isWhite(r: number, g: number, b: number): boolean {
    return (
      r > this.WHITE_THRESHOLD &&
      g > this.WHITE_THRESHOLD &&
      b > this.WHITE_THRESHOLD
    )
  }

  /**
   * Aplica filtro térmico (contraste + binarização) à imagem do canvas
   * Otimizado para impressoras térmicas 58mm
   */
  static applyThermalFilter(
    canvas: HTMLCanvasElement,
    options: Partial<ThermalFilterOptions> = {}
  ): void {
    const opts = { ...this.DEFAULT_THERMAL_OPTIONS, ...options }

    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    this.applyContrastAndBrightness(imageData, opts.contrast, opts.brightness)

    if (opts.useDithering) {
      this.applyFloydSteinbergDithering(
        imageData,
        canvas.width,
        canvas.height
      )
    } else {
      const threshold =
        opts.threshold ?? this.calculateOtsuThreshold(imageData)
      this.applyBinarization(imageData, threshold)
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Aplica ajuste de contraste e brilho aos píxels
   */
  private static applyContrastAndBrightness(
    imageData: ImageData,
    contrast: number,
    brightness: number
  ): void {
    const data = imageData.data
    const intercept = 128 * (1 - contrast) + brightness

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, contrast * data[i] + intercept))
      data[i + 1] = Math.max(
        0,
        Math.min(255, contrast * data[i + 1] + intercept)
      )
      data[i + 2] = Math.max(
        0,
        Math.min(255, contrast * data[i + 2] + intercept)
      )
    }
  }

  /**
   * Converte para escala de cinza e aplica threshold de binarização
   */
  private static applyBinarization(
    imageData: ImageData,
    threshold: number
  ): void {
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const gray = this.getRgbToGrayscale(data[i], data[i + 1], data[i + 2])
      const binary = gray > threshold ? 255 : 0

      data[i] = binary
      data[i + 1] = binary
      data[i + 2] = binary
    }
  }

  /**
   * Calcula threshold ótimo usando algoritmo de Otsu
   * Maximiza variância entre preto e branco
   */
  private static calculateOtsuThreshold(imageData: ImageData): number {
    const data = imageData.data
    const histogram = new Array(256).fill(0)

    // Construir histograma
    for (let i = 0; i < data.length; i += 4) {
      const gray = this.getRgbToGrayscale(data[i], data[i + 1], data[i + 2])
      histogram[gray]++
    }

    const total = (data.length / 4) | 0
    let sum = 0

    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i]
    }

    let sumB = 0
    let countB = 0
    let maxVariance = 0
    let optimalThreshold = 127

    // Encontrar threshold com máxima variância
    for (let t = 0; t < 256; t++) {
      countB += histogram[t]
      if (countB === 0) continue

      const countF = total - countB
      if (countF === 0) break

      sumB += t * histogram[t]
      const meanB = sumB / countB
      const meanF = (sum - sumB) / countF
      const variance = countB * countF * Math.pow(meanB - meanF, 2)

      if (variance > maxVariance) {
        maxVariance = variance
        optimalThreshold = t
      }
    }

    return optimalThreshold
  }

  /**
   * Aplica dithering Floyd-Steinberg para melhor qualidade em imagens complexas
   * Distribui erro de quantização em padrão diagonal
   */
  private static applyFloydSteinbergDithering(
    imageData: ImageData,
    width: number,
    height: number
  ): void {
    const data = imageData.data
    const errorBuffer = new Float32Array(width * height)

    // Primeira passagem: converter para cinza
    const grayscale = new Uint8ClampedArray(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const idx = (i / 4) | 0
      grayscale[idx] = this.getRgbToGrayscale(
        data[i],
        data[i + 1],
        data[i + 2]
      )
    }

    // Aplicar dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const gray = grayscale[idx] + errorBuffer[idx]

        const newVal = gray > 128 ? 255 : 0
        const error = gray - newVal

        // Distribuir erro em padrão Floyd-Steinberg
        if (x + 1 < width) {
          errorBuffer[idx + 1] += (error * 7) / 16
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            errorBuffer[idx + width - 1] += (error * 3) / 16
          }
          errorBuffer[idx + width] += (error * 5) / 16
          if (x + 1 < width) {
            errorBuffer[idx + width + 1] += (error * 1) / 16
          }
        }

        // Atualizar pixel
        const dataIdx = idx * 4
        data[dataIdx] = newVal
        data[dataIdx + 1] = newVal
        data[dataIdx + 2] = newVal
      }
    }
  }

  /**
   * Converte RGB para escala de cinza usando luminância ITU-R BT.601
   */
  private static getRgbToGrayscale(
    r: number,
    g: number,
    b: number
  ): number {
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  }
}
