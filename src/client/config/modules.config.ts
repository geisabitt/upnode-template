import { defaultModules, type ModuleConfig } from '@/core/lib/module-config'

// Change only this file per client. E&L equivalent: store: { enabled: false }.
// checkout:false supports catalog-only sites while keeping buyer order history.
export const modulesConfig: ModuleConfig = { ...defaultModules }
