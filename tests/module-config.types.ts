import type { ModuleConfig } from '../src/core/lib/module-config'
const validCatalog: ModuleConfig = { store: { enabled: true, checkout: false }, blog: true, portfolio: false, services: false, pwa: false }
const validInstitutional: ModuleConfig = { store: { enabled: false }, blog: true, portfolio: true, services: true, pwa: true }
// @ts-expect-error Checkout cannot be enabled when the store is disabled.
const invalidCheckout: ModuleConfig = { store: { enabled: false, checkout: true }, blog: true, portfolio: false, services: false, pwa: false }
void validCatalog
void validInstitutional
void invalidCheckout
