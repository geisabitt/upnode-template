import { isRouteEnabled } from '@/core/lib/modules'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, verifyAdminToken } from '@/core/lib/auth-token'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (!isRouteEnabled(pathname, req.method)) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Módulo indisponível.' }, { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
    return NextResponse.rewrite(new URL('/_not-found', req.url), { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
  }
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) return NextResponse.next()
  if (['/admin/login', '/admin/setup-admin'].includes(pathname)) return NextResponse.next()
  const session = await verifyAdminToken(req.cookies.get(AUTH_COOKIE_NAME)?.value || '')
  if (!session || session.role !== 'admin') {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: session ? 'Acesso não permitido.' : 'Autenticação necessária.' }, {
        status: session ? 403 : 401, headers: { 'Cache-Control': 'private, no-store' },
      })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/:path*', '/loja/:path*', '/carrinho/:path*', '/checkout/:path*', '/pedido/:path*', '/minha-conta/:path*', '/blog/:path*', '/portfolio/:path*', '/projetos/:path*', '/servicos/:path*', '/offline', '/manifest.webmanifest'] }
