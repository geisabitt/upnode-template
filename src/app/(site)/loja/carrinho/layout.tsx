import { NO_INDEX } from '@/core/lib/seo'
import { requireModule } from '@/core/lib/module-server'
import type { ReactNode } from 'react'
export default function ModuleLayout({ children }: { children: ReactNode }) { requireModule('checkout'); return children }

export const metadata = NO_INDEX
