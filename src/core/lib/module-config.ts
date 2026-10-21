/** A disabled store cannot enable checkout. Historical orders remain readable to admins. */
export type ModuleConfig = {
  store: { enabled: false; checkout?: false } | { enabled: true; checkout: boolean }
  blog: boolean
  portfolio: boolean
  services: boolean
  pwa: boolean
}
export const defaultModules: ModuleConfig = {
  store: { enabled: true, checkout: true }, blog: true, portfolio: false, services: false, pwa: false,
}
export type ModuleName = 'store' | 'checkout' | 'blog' | 'portfolio' | 'services' | 'pwa'
export function moduleEnabled(config: ModuleConfig, module: ModuleName): boolean {
  if (module === 'store') return config.store.enabled
  if (module === 'checkout') return config.store.enabled && config.store.checkout === true
  return config[module]
}
function matches(path: string, prefix: string) { return path === prefix || path.startsWith(prefix + '/') }

// Adapted from E&L's prefix contracts. Read-only admin history is independent of sales.
export function requiredModule(pathname: string, method = 'GET'): ModuleName | null {
  const path = pathname.split(/[?#]/, 1)[0]
  const read = ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
  if (matches(path, '/loja/pedido') && path.endsWith('/pagamento')) return 'checkout'
  if (['/loja/checkout', '/loja/carrinho', '/carrinho', '/checkout', '/api/frete', '/api/asaas', '/api/mercado-pago', '/api/clients'].some(prefix => matches(path, prefix))) return 'checkout'
  if (path === '/api/orders' && !read) return 'checkout'
  if (['/loja', '/pedido', '/minha-conta', '/api/orders', '/api/products', '/api/categorias'].some(prefix => matches(path, prefix))) return 'store'
  if (['/api/admin/products', '/api/admin/orders'].some(prefix => matches(path, prefix))) return read ? null : 'store'
  if (matches(path, '/admin/products')) return /\/(new|edit)$/.test(path) ? 'store' : null
  if (matches(path, '/admin/clients')) return 'checkout'
  if (matches(path, '/api/admin/blog')) return read ? null : 'blog'
  if (matches(path, '/admin/blog')) return /\/(new|edit)$/.test(path) ? 'blog' : null
  if (matches(path, '/blog')) return 'blog'
  if (matches(path, '/portfolio') || matches(path, '/projetos')) return 'portfolio'
  if (matches(path, '/servicos')) return 'services'
  if (['/offline', '/preparar-offline', '/manifest.webmanifest'].some(prefix => matches(path, prefix))) return 'pwa'
  return null
}
export function routeEnabled(config: ModuleConfig, path: string, method = 'GET'): boolean {
  const required = requiredModule(path, method)
  return !required || moduleEnabled(config, required)
}

export function canCachePublicDocument(config: ModuleConfig, pathname: string): boolean {
  if (!config.pwa || !routeEnabled(config, pathname) || pathname.includes('?')) return false
  // Financial/private data never enter the document cache, even with an active store.
  return pathname === '/offline'
}
