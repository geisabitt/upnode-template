'use client'

import { useState } from 'react'
import { useCart } from '@/core/context/CartContext'
import { toast } from 'react-hot-toast'

export type ProductDetailClientProps = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  youtubeUrl?: string | null
  colors: { id: string; name: string; hex: string }[]
  sizes: { id: string; name: string }[]
}

export default function ProductDetailClient({ product }: { product: ProductDetailClientProps }) {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0] || '/logo-artesanaio.jpeg'
  )
  const [selectedColor, setSelectedColor] = useState<{
    id: string
    name: string
    hex: string
  } | null>(null)
  const [selectedSize, setSelectedSize] = useState<{
    id: string
    name: string
  } | null>(null)

  function getEmbedUrl(url?: string | null) {
    if (!url) return null

    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const embedUrl = getEmbedUrl(product.youtubeUrl)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      
      {/* GALERIA */}
      <div className="space-y-4">
        {/* IMAGEM PRINCIPAL */}
        <div className="w-full aspect-square bg-[var(--color-bg-tertiary)] rounded-2xl overflow-hidden">
          {selectedImage === 'video' && embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
        />
      ) : (
        <img
          src={selectedImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      )}
        </div>

        {/* THUMBNAILS */}
        <div className="flex gap-2 flex-wrap">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                selectedImage === img
                  ? 'border-[var(--color-accent)]'
                  : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt={`thumb-${index}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}

          {embedUrl && (
  <button
    onClick={() => setSelectedImage('video')}
    className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
      selectedImage === 'video'
        ? 'border-[var(--color-accent)]'
        : 'border-transparent'
    }`}
  >
    <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs">
      ▶
    </div>
  </button>
)}
        </div>
      </div>

      {/* INFO */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-secondary)]">{product.name}</h1>

        <p className="text-lg font-semibold text-green-600">
          R$ {product.price.toFixed(2)}
        </p>

        <p className="text-[var(--color-text-secondary)] whitespace-pre-line">
  {product.description}
</p>

        {/* CORES */}
        <div>
          <p className="font-medium mb-1">Cores:</p>
          {product.colors.length > 0 ? (
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor?.id === color.id
                      ? 'border-[var(--color-accent)]'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)]">Sem variações de cores.</p>
          )}
          {!selectedColor && product.colors.length > 0 && (
            <p className="mt-2 text-sm text-red-500">Selecione uma cor.</p>
          )}
        </div>

        {/* TAMANHOS */}
        <div>
          <p className="font-medium mb-1">Tamanhos:</p>
          {product.sizes.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    selectedSize?.id === size.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)]">Sem variações de tamanhos.</p>
          )}
          {!selectedSize && product.sizes.length > 0 && (
            <p className="mt-2 text-sm text-red-500">Selecione um tamanho.</p>
          )}
        </div>

        {/* BOTÃO */}
        <button
          onClick={() => {
            if (product.colors.length > 0 && !selectedColor) {
              toast.error('Selecione uma cor antes de adicionar ao carrinho.')
              return
            }
            if (product.sizes.length > 0 && !selectedSize) {
              toast.error('Selecione um tamanho antes de adicionar ao carrinho.')
              return
            }
            addItem({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              imageUrl: product.images[0] || '/logo-artesanaio.jpeg',
              price: product.price,
              color: selectedColor
                ? { name: selectedColor.name, hex: selectedColor.hex }
                : { name: 'Não selecionado', hex: '#000000' },
              size: selectedSize ? { name: selectedSize.name } : { name: 'Não selecionado' },
              quantity: 1,
              images: product.images,
            })
            toast.success('Produto adicionado ao carrinho!')
          }}
          className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  )
}