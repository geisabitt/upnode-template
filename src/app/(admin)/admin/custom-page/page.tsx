import { prisma } from "@/core/lib/prisma"
import Link from "next/link"

export default async function PagesList() {
  const pages = await prisma.customPage.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Páginas</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Gerencie as páginas institucionais
          </p>
        </div>

        <Link
          href="/admin/custom-page/new"
          className="btn-primary"
        >
          + Nova página
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-bg-tertiary)]">
            <tr>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t">

                <td className="px-4 py-3">{page.title}</td>
                <td className="px-4 py-3">{page.slug}</td>

                <td className="px-4 py-3 space-x-2">
                  <Link
                    href={`/admin/custom-page/${page.id}`}
                    className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs font-semibold text-[var(--color-admin-text)] hover:bg-[var(--color-bg-hover)]"
                  >
                    Editar
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}