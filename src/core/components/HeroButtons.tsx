'use client'

import { siteConfig } from '@/client/config/site.config'

export function HeroButtons() {
  return (
    <div className="flex flex-wrap gap-4">
      <a
        href="/loja"
        className="inline-block px-6 py-3 font-semibold transition rounded-lg"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-light)' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
      >
        Ver planos
      </a>
      <a
        href="/personalizado"
        className="inline-block px-6 py-3 transition rounded-lg"
        style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent-light)' }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent)'
          e.currentTarget.style.color = 'var(--color-text-light)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--color-accent-light)'
        }}
      >
        Como funciona
      </a>
    </div>
  )
}

export function SobreButton() {
  return (
    <a
      href="/sobre"
      className="inline-block px-8 py-4 transition rounded-lg"
      style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent-light)' }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'var(--color-accent)'
        e.currentTarget.style.color = 'var(--color-text-light)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = 'var(--color-accent-light)'
      }}
    >
      Conheça a UpNode
    </a>
  )
}

export function CtaWhatsappButton() {
  return (
    <a
      href={`https://wa.me/${siteConfig.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-8 py-4 font-semibold transition rounded-lg text-lg"
      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-light)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
    >
      Falar no WhatsApp →
    </a>
  )
}

export function BlogCategoryCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a
      href={href}
      className="group block rounded-xl p-6 text-left transition"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-bg-hover)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-bg-hover)')}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}
      >
        <span className="text-xl" style={{ color: 'var(--color-accent)' }}>📝</span>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
      <p className="text-sm font-semibold mt-4" style={{ color: 'var(--color-accent)' }}>
        Ler artigos →
      </p>
    </a>
  )
}