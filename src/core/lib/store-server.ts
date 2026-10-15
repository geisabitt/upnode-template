// Compatibility with E&L's existing server guards, without a second configuration flag.
import 'server-only'
import { NextResponse } from 'next/server'
import { requireModule } from './module-server'
import { isStoreEnabled } from './store'
export const requireStoreEnabled = () => requireModule('store')
export const disabledStoreResponse = () => isStoreEnabled() ? null : NextResponse.json({ error: 'Módulo de loja indisponível.' }, {
  status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
})
