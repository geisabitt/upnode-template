'use client'

import { useState, useCallback } from 'react'
import { PDFProcessor } from '@/core/lib/pdf/pdfProcessor'
import { ShopeeParser } from '@/core/lib/pdf/pdfParser'
import { PrintGenerator } from '@/core/lib/print/printGenerator'

export default function AdminLabelsPage() {
  const [labelParts, setLabelParts] = useState<string[]>([])
  const [printText, setPrintText] = useState('')
  const [loading, setLoading] = useState(false)


  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      await processLabelFile(file)
    },
    []
  )

  const processLabelFile = useCallback(async (file: File) => {
    setLoading(true)

    const { fullText, labelImage } = await PDFProcessor.processPDF(file)
    const parsed = ShopeeParser.parse(fullText)

    await generateLabelImages(labelImage)
    setPrintText(PrintGenerator.generate(parsed))

    setLoading(false)
  }, [])

  const generateLabelImages = useCallback(async (imageDataUrl: string) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const bounds = PDFProcessor.findContentBounds(
        ctx,
        canvas.width,
        canvas.height
      )
      const croppedCanvas = PDFProcessor.cropCanvas(canvas, bounds)

      const LABEL_SLICES: Array<[number, number]> = [
        [0, 0.22],
        [0.22, 0.5],
        [0.55, 0.86],
        [0.48, 0.57],
        [0.85, 1]
      ]

      const parts = PDFProcessor.sliceCanvasVertically(
        croppedCanvas,
        LABEL_SLICES
      )
      setLabelParts(parts)
    }

    img.src = imageDataUrl
  }, [])


  const handlePrint = useCallback(() => {
    if (labelParts.length === 0) return

    const htmlContent = PrintGenerator.generatePrintHTML(labelParts, printText)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }, [labelParts, printText])

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center">
        📦 Shopee Express Label Printer
      </h1>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-admin-border)] rounded-xl p-8 cursor-pointer hover:bg-[var(--color-bg-hover)]">
        <span className="text-[var(--color-admin-text)]">Clique ou arraste o PDF aqui</span>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {loading && <p className="text-center text-[var(--color-text-secondary)]">Processando...</p>}

      {labelParts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Etiquetas Processadas</h2>
          <div className="space-y-2">
            {labelParts.map((imageSrc, index) => (
              <img
                key={index}
                src={imageSrc}
                alt={`Etiqueta ${index + 1}`}
                className="w-[200px] border border-[var(--color-admin-border)] rounded"
              />
            ))}
          </div>
        </div>
      )}

      {printText && (
        <div>
          <h2 className="text-lg font-semibold">Preview de Impressão</h2>
          <pre className="bg-black text-green-400 p-4 text-xs rounded max-h-[300px] overflow-auto font-mono">
            {printText}
          </pre>

          <button
            onClick={handlePrint}
            className="mt-4 px-6 py-2 bg-[var(--color-info)] hover:bg-[var(--color-info)]/80 text-[var(--color-text-primary)] font-medium rounded w-full transition"
          >
            🖨️ Imprimir Etiquetas
          </button>
        </div>
      )}
    </div>
  )
}