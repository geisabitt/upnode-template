// Compatibility facade for existing E&L imports; modules.config is the single source.
import { isModuleEnabled, isRouteEnabled, isPublicLinkEnabled } from './modules'
export { isPublicLinkEnabled }
export const isStoreEnabled = () => isModuleEnabled('store')
function matches(pathname: string, prefixes: string[]): boolean {
  const path = pathname.split(/[?#]/, 1)[0]
  return prefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'))
}
export const isStorefrontPath = (path: string) => matches(path, ['/loja', '/carrinho', '/checkout', '/pedido', '/minha-conta'])
export const isPublicStoreApiPath = (path: string) => matches(path, ['/api/products', '/api/categorias', '/api/orders', '/api/frete', '/api/asaas', '/api/mercado-pago', '/api/clients'])
export const isDisabledStoreApi = (path: string, method: string) => !isRouteEnabled(path, method)
