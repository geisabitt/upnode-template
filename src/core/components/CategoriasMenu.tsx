'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Categoria = {
  id: string
  name: string
  slug: string
}

export default function CategoriasMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/categorias')
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error('Erro ao carregar categorias:', err))
  }, [])

  return (
    <nav className="w-full bg-[var(--color-bg-primary)] relative z-[999]">
      
      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 py-2">
        <Link href="/loja" className="text-sm font-semibold text-[var(--color-accent)]">
          Início
        </Link>

        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="flex items-center gap-1 text-sm font-semibold text-[var(--color-text-primary)]"
        >
          Categorias
          <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2 bg-[var(--color-bg-primary)]">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/loja/categoria/${cat.slug}`}
              className="text-sm text-[var(--color-text-secondary)]"
              onClick={() => setOpen(false)}
            >
              {cat.name}
            </Link>
          ))}

          <Link
            href="/personalizado"
            className="text-sm font-semibold text-[var(--color-accent)]"
            onClick={() => setOpen(false)}
          >
            Personalizado
          </Link>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2 justify-between font-bold gap-4 overflow-x-auto">
        <Link href="/loja" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Início
        </Link>

        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={`/loja/categoria/${cat.slug}`}
            className="text-sm text-[var(--color-text-secondary)] hover:underline whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}

        <Link href="/personalizado" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Personalizado
        </Link>
      </div>
    </nav>
  )
}