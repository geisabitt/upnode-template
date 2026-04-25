import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/core/lib/prisma";

export default async function HomePage() {
  const categories = await prisma.blogCategory.findMany({
    where: {
      showOnHome: true,
    },
    orderBy: {
      order: "asc",
    },
    take: 3,
  });

  return (
    <main className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">

      {/* HERO */}
      <section className="relative w-full min-h-[86vh] flex items-center py-8">
        <Image
          src="/bg-gc-croche-com-elegancia-e-estilo.png"
          alt="Crochê elegante feito à mão Geicy Crochê"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-[var(--color-bg-primary)]/30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

          <div>
            <Image
              src="/logo-geicy-croche-vertical.png"
              alt="Geicy Crochê logo"
              width={220}
              height={120}
              className="mb-6"
            />

            <Image
              src="/txt-gc-croche-com-estilo-e-elegancia.png"
              alt="Crochê com estilo e elegância"
              width={500}
              height={200}
              className="mb-6"
            />

            <p className="text-sm md:text-base max-w-md mb-8 text-[var(--color-text-secondary)]">
              Peças exclusivas feitas à mão com amor e dedicação.
            </p>

            <a
              href="/loja"
              className="inline-block px-6 py-3 border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg-primary)] transition rounded"
            >
              Conheça nossas peças
            </a>
          </div>

          <div />
        </div>
      </section>

      {/* CATEGORIAS DINÂMICAS */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl md:text-4xl font-semibold mb-10">
            Conteúdos do Blog
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/categoria/${cat.slug}`}
                className="group bg-[var(--color-bg-tertiary)] p-6 rounded-xl border border-[var(--color-bg-hover)] hover:border-[var(--color-accent)] transition block"
              >
                <h3 className="text-xl mb-2 group-hover:text-[var(--color-accent)] transition">
                  {cat.name}
                </h3>

                <p className="text-sm text-[var(--color-text-tertiary)]">
                  {cat.description || "Explore conteúdos exclusivos sobre crochê."}
                </p>
                <p className="text-[var(--color-accent)] font-semibold mt-4 group-hover:underline">
                  Clique para saber mais
                </p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* SOBRE */}
      <section className="py-20 px-6 bg-[var(--color-bg-tertiary)] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-6">
            Crochê com Qualidade e Sofisticação
          </h2>

          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Cada peça é feita manualmente com atenção aos detalhes.
          </p>
                    <a
            href="/loja"
            className="inline-block px-8 py-4 text-[var(--color-bg-primary)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition rounded"
          >
            Veja nossas coleções exclusivas
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-6">
            Faça sua encomenda personalizada
          </h2>

          <p className="mb-8 text-[var(--color-text-muted)]">
            Fale direto no WhatsApp.
          </p>

          <a
            href="https://wa.me/5521986483118"
            className="inline-block px-8 py-4 text-[var(--color-bg-primary)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition rounded"
          >
            Pedir no WhatsApp
          </a>
        </div>
      </section>

    </main>
  );
}