import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/core/lib/prisma";
import { siteConfig } from "@/client/config/site.config"; // ← import que faltava

export default async function HomePage() {
  const categories = await prisma.blogCategory.findMany({
    where: { showOnHome: true },
    orderBy: { order: "asc" },
    take: 3,
  });

  return (
    <main className="w-full" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>

      {/* HERO */}
      <section className="relative w-full min-h-[90vh] flex items-center py-8">
        <Image
          src="/bg-upnode-hero.png"
          alt="UpNode — Sites profissionais para pequenos negócios"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-overlay) 60%, transparent)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--color-text-light)' }}>
              Sites que geram{" "}
              <span style={{ color: 'var(--color-accent-light)' }}>clientes de verdade.</span>
            </h1>
            <p className="text-base md:text-lg max-w-md mb-8" style={{ color: 'var(--color-text-hero-muted)' }}>
              Cada site é único, personalizado para o seu negócio e otimizado
              para aparecer no Google e converter visitantes em clientes.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/loja"
                className="inline-block px-6 py-3 font-semibold transition rounded-lg hover:opacity-80"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-light)' }}
              >
                Ver planos
              </a>
              <a
                href="/personalizado"
                className="inline-block px-6 py-3 transition rounded-lg hover:opacity-80"
                style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent-light)' }}
              >
                Como funciona
              </a>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4">
            {[
              { icon: "🔍", title: "SEO otimizado", desc: "Seu site aparece no Google" },
              { icon: "🛍️", title: "Loja integrada", desc: "Venda produtos online" },
              { icon: "⚡", title: "Deploy imediato", desc: "Site no ar em dias" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 backdrop-blur rounded-xl px-5 py-4"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-text-light) 5%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-text-light) 10%, transparent)',
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text-light)' }}>{item.title}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Como a UpNode funciona?</h2>
          <p className="mb-12 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Do primeiro contato ao site no ar — um processo simples e rápido.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Você escolhe o plano", desc: "Selecione o pacote ideal para o seu negócio." },
              { step: "02", title: "Personalizamos tudo", desc: "Cores, layout, conteúdo e identidade visual únicos para você." },
              { step: "03", title: "Site no ar", desc: "Publicamos, configuramos o domínio e entregamos pronto para gerar clientes." },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl p-8 text-left"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-bg-hover)' }}
              >
                <span className="text-4xl font-bold" style={{ color: 'color-mix(in srgb, var(--color-accent) 30%, transparent)' }}>
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold mt-3 mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIAS DO BLOG */}
      {categories.length > 0 && (
        <section className="py-16 px-6" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Conteúdo para o seu negócio crescer</h2>
            <p className="mb-10 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Artigos práticos sobre SEO, vendas online e presença digital.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog/categoria/${cat.slug}`}
                  className="group block rounded-xl p-6 text-left transition hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-bg-hover)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}
                  >
                    <span className="text-xl" style={{ color: 'var(--color-accent)' }}>📝</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {cat.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {cat.description ?? "Explore conteúdos exclusivos."}
                  </p>
                  <p className="text-sm font-semibold mt-4" style={{ color: 'var(--color-accent)' }}>
                    Ler artigos →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SOBRE */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Feito para pequenos negócios que querem crescer
          </h2>
          <p className="leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
            A UpNode by BittUp desenvolve sites profissionais com foco em
            geração de clientes — com SEO, loja virtual, blog e painel admin
            para você gerenciar tudo sozinho.
          </p>
          <a
            href="/sobre"
            className="inline-block px-8 py-4 transition rounded-lg hover:opacity-80"
            style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent-light)' }}
          >
            Conheça a UpNode
          </a>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-20 px-6 text-center"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
          borderTop: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para ter um site que trabalha por você?
          </h2>
          <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Fale agora pelo WhatsApp e receba uma proposta personalizada.
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 font-semibold transition rounded-lg text-lg hover:opacity-80"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-light)' }}
          >
            Falar no WhatsApp →
          </a>
        </div>
      </section>

    </main>
  );
}