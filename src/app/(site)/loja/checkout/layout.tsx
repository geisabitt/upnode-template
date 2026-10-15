import { requireModule } from '@/core/lib/module-server'
import type { ReactNode } from 'react'
export default function ModuleLayout({ children }: { children: ReactNode }) { requireModule('checkout'); return children }
