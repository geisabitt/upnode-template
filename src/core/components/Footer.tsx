'use client'

import Link from "next/link"
import Image from "next/image"
import { Settings } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full">

      {/* BENEFÍCIOS */}
      <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 py-16 bg-[var(--color-bg-tertiary)] text-center px-4 border-t border-[var(--color-bg-card)]">

        <div>
          <h4 className="font-semibold text-lg text-[var(--color-text-primary)]">Feito à Mão</h4>
          <p className="text-sm text-[var(--color-text-tertiary)]">Cada peça com cuidado artesanal</p>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-[var(--color-text-primary)]">Peças Exclusivas</h4>
          <p className="text-sm text-[var(--color-text-tertiary)]">Produção sob encomenda</p>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-[var(--color-text-primary)]">Entrega no Brasil</h4>
          <p className="text-sm text-[var(--color-text-tertiary)]">Envios para todo o país</p>
        </div>

      </div>

      {/* FOOTER PRINCIPAL */}
      <div className="w-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] py-16">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

          {/* LOGO */}
          <div>
            <Image
              src="/logo-geicy-croche.png"
              alt="Geicy Crochê peças artesanais em crochê"
              width={160}
              height={80}
              className="mb-4"
            />

            <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
              Crochê artesanal com estilo e elegância. Peças feitas à mão sob encomenda,
              incluindo roupas, acessórios e itens para casa.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Navegação</h4>

            <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">

              <li>
                <Link href="/" className="hover:text-[var(--color-accent)] transition">
                  Início
                </Link>
              </li>

              <li>
                <Link href="/pecas" className="hover:text-[var(--color-accent)] transition">
                  Peças em Crochê
                </Link>
              </li>

              <li>
                <Link href="/sobre" className="hover:text-[var(--color-accent)] transition">
                  Sobre
                </Link>
              </li>

              <li>
                <Link href="/contato" className="hover:text-[var(--color-accent)] transition">
                  Contato
                </Link>
              </li>

            </ul>
          </div>

          {/* CONTATO */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contato</h4>

            <p className="text-sm text-[var(--color-text-tertiary)] mb-2">WhatsApp</p>

            <Link
              href="https://wa.me/5521986483118"
              className="text-[var(--color-accent)] font-semibold hover:opacity-80 transition"
            >
              (21) 98648-3118
            </Link>

            <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">
              Atendimento para todo o Brasil
            </p>

          </div>

        </div>

      </div>

{/* COPYRIGHT */}
      <div className="flex items-center justify-center gap-2 py-6 text-xs bg-black text-[#B8A98A] border-t border-[#1a1a1a]">
        <Link href="/admin/login" className="opacity-60 hover:opacity-100 transition">
          <Settings className="w-3 h-3" />
        </Link>
        <span>
          © {new Date().getFullYear()} Geicy Crochê — Crochê com Estilo e Elegância
        </span>

      </div>

    </footer>
  )
}