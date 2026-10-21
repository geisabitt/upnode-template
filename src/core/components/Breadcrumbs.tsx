import Link from 'next/link'
import { JsonLd } from './JsonLd'
import { breadcrumbSchema } from '@/core/lib/seo'
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return <><JsonLd data={breadcrumbSchema(items)} /><nav aria-label="Navegação estrutural" className="text-sm mb-4">
    {items.map((item, index) => <span key={item.path}>{index > 0 ? ' / ' : ''}{index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</span>)}
  </nav></>
}
