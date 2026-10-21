import { modulesConfig } from '@/client/config/modules.config'
import { moduleEnabled, routeEnabled, type ModuleName } from './module-config'
export const isModuleEnabled = (module: ModuleName) => moduleEnabled(modulesConfig, module)
export const isPublicLinkEnabled = (href: string) => routeEnabled(modulesConfig, href)
export const isRouteEnabled = (path: string, method = 'GET') => routeEnabled(modulesConfig, path, method)
