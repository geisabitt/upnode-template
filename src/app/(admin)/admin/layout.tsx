'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'
import { Toaster } from 'react-hot-toast'
import { LogoutButton } from '@/core/components/admin/LogoutButton'
import { siteConfig } from '@/client/config/site.config'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function buildCssVariables(t: typeof siteConfig.theme): string {
  return `
    :root {
      --color-bg-primary:      ${t.bgPrimary};
      --color-bg-secondary:    ${t.bgSecondary};
      --color-bg-tertiary:     ${t.bgTertiary};
      --color-bg-card:         ${t.bgCard};
      --color-bg-hover:        ${t.bgHover};
      --color-overlay:         ${t.overlay};

      --color-text-primary:    ${t.textPrimary};
      --color-text-secondary:  ${t.textSecondary};
      --color-text-tertiary:   ${t.textTertiary};
      --color-text-muted:      ${t.textMuted};
      --color-text-light:      ${t.textLight};
      --color-text-hero-muted: ${t.textHeroMuted};

      --color-accent:          ${t.accent};
      --color-accent-hover:    ${t.accentHover};
      --color-accent-light:    ${t.accentLight};

      --color-error:           ${t.error};
      --color-success:         ${t.success};
      --color-info:            ${t.info};

      --color-border:          ${t.border};
      --color-border-light:    ${t.borderLight};

      --color-admin-bg:        ${t.adminBg};
      --color-admin-text:      ${t.adminText};
      --color-admin-border:    ${t.adminBorder};
    }
  `
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <html lang="pt-br">
       <head>
              <style dangerouslySetInnerHTML={{ __html: buildCssVariables(siteConfig.theme) }} />
            </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full bg-[var(--color-admin-bg)] text-[var(--color-admin-text)]`}
      >
        <Toaster position="top-right" reverseOrder={false} />

        <div className="flex min-h-screen w-full flex-col">
          <header className="border-b border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              
              <h1 className="text-xl font-bold">Administração</h1>

              {/* Desktop */}
              <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
                <Link href="/">Site</Link>
                <Link href="/loja">Loja</Link>
                <Link href="/admin">Dashboard</Link>
                <Link href="/admin/products">Produtos</Link>
                <Link href="/admin/pedidos">Pedidos</Link>
                <Link href="/admin/blog/categories">Categorias Blog</Link>  
                <Link href="/admin/blog/posts">Posts Blog</Link>
                <Link href="/admin/custom-page">Páginas Personalizadas</Link>
                <Link href="/admin/etiquetas">Etiquetas</Link>
                <Link href="/admin/clients">Asaas</Link>
                <LogoutButton />
              </nav>

              {/* Mobile Button */}
              <button onClick={() => setOpen(!open)} className="md:hidden">
                {open ? <X /> : <Menu />}
              </button>

            </div>

            {/* Mobile Menu */}
            {open && (
              <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
                <Link href="/" onClick={() => setOpen(false)}>Site</Link>
                <Link href="/loja" onClick={() => setOpen(false)}>Loja</Link>
                <Link href="/admin" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link href="/admin/products" onClick={() => setOpen(false)}>Produtos</Link>
                <Link href="/admin/pedidos" onClick={() => setOpen(false)}>Pedidos</Link>
                <Link href="/admin/blog/categories" onClick={() => setOpen(false)}>Categorias Blog</Link>  
                <Link href="/admin/blog/posts" onClick={() => setOpen(false)}>Posts Blog</Link>
                <Link href="/admin/custom-page" onClick={() => setOpen(false)}>Páginas Personalizadas</Link>
                <Link href="/admin/etiquetas" onClick={() => setOpen(false)}>Etiquetas</Link>
                <LogoutButton />
              </div>
            )}
          </header>

          <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}