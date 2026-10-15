import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { createHmac } from 'node:crypto'
const require = createRequire(import.meta.url)
const ts = require('typescript')
const jwt = require('jsonwebtoken')
const { NextRequest } = require('next/server')
const { Decimal } = require('@prisma/client/runtime/client')
const root = path.resolve(import.meta.dirname, '..')
// No dotenv, database client or real provider is loaded by this harness.
process.env.AUTH_JWT_SECRET = 'synthetic-test-secret-with-at-least-32-characters'
process.env.ASAAS_WEBHOOK_TOKEN = 'synthetic-asaas-webhook-token'
process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'synthetic-mp-webhook-secret'
process.env.MERCADO_PAGO_ACCESS_TOKEN = 'synthetic-access-token'
process.env.NEXT_PUBLIC_SITE_URL = 'https://shop.example.invalid'
let cookieJar = new Map(), db = {}, provider = async () => { throw new Error('Unexpected provider call') }
globalThis.fetch = async () => { throw new Error('Real network disabled in security tests') }
let cache = new Map(), ip = 0, configOverride = null, contentOverride = null
function load(relative) {
  let file = path.resolve(root, relative)
  if (!fs.existsSync(file) && file.endsWith('.ts')) file += 'x'
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }; cache.set(file, module)
  const source = fs.readFileSync(file, 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const localRequire = name => {
    if (name === '@/client/config/modules.config' && configOverride) return { modulesConfig: configOverride }
    if (name === '@/client/config/content.config' && contentOverride) return contentOverride
    if (name === 'next/image') return { __esModule: true, default: () => null }
    if (name === 'server-only') return {}
    if (name === 'next/navigation') return { notFound: () => { throw new Error('NEXT_NOT_FOUND') } }
    if (name === '@/core/lib/prisma') return { prisma: db, default: db }
    if (name === '@/generated/client') return { Prisma: { Decimal, PrismaClientKnownRequestError: class extends Error {} } }
    if (name === 'next/headers') return { cookies: async () => ({ get: name => cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined }) }
    if (name === '@/core/lib/asaas') return { asaasFetch: (...args) => provider(...args) }
    if (name === '@/core/lib/cloudinary') return { uploadFilesToCloudinary: () => { throw new Error('Unexpected upload') } }
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts')
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(file), name)) + '.ts')
    return require(name)
  }
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(localRequire, module, module.exports)
  return module.exports
}
function reset() { cache = new Map(); cookieJar = new Map(); db = {}; configOverride = null; contentOverride = null; provider = async () => { throw new Error('Unexpected provider call') } }
function request(url, method = 'GET', body, headers = {}) {
  return new NextRequest('https://shop.example.invalid' + url, { method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-' + ++ip, ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
}
const order = () => ({ id: 'order-one', email: 'buyer@example.invalid', cpf: '00000000000',
  fullName: 'Synthetic Buyer', phone: '00000000000', customerId: 'cus_test',
  address: { street: 'Synthetic Street', number: '1', neighborhood: 'Test', city: 'Test', state: 'SP', zipCode: '00000000' },
  total: new Decimal('20.00'), frete: new Decimal('5.00'), statusPagamento: 'pending',
  items: [{ productId: 'product-one', name: 'Synthetic product', price: new Decimal('10'), quantity: 2 }] })
function grant(id = 'order-one') { cookieJar.set('order_access', jwt.sign({ orders: [id] }, process.env.AUTH_JWT_SECRET, { audience: 'order-access', expiresIn: '1h' })) }

test('admin rejects absent, forged, expired, wrong algorithm and non-admin tokens', async () => {
  reset(); const { authenticateAdmin } = load('src/core/lib/admin-access.ts')
  db.adminUser = { findUnique: async () => ({ id: 'admin-one', email: 'admin@example.invalid', role: 'admin' }) }
  assert.equal((await authenticateAdmin(undefined)).status, 401)
  assert.equal((await authenticateAdmin('forged')).status, 401)
  const claims = { id: 'admin-one', email: 'admin@example.invalid', role: 'admin' }
  assert.equal((await authenticateAdmin(jwt.sign(claims, process.env.AUTH_JWT_SECRET, { expiresIn: -1 }))).status, 401)
  assert.equal((await authenticateAdmin(jwt.sign(claims, process.env.AUTH_JWT_SECRET, { algorithm: 'HS384', expiresIn: '1h' }))).status, 401)
  assert.equal((await authenticateAdmin(jwt.sign({ ...claims, role: 'buyer' }, process.env.AUTH_JWT_SECRET, { expiresIn: '1h' }))).status, 403)
  const token = jwt.sign(claims, process.env.AUTH_JWT_SECRET, { expiresIn: '1h' })
  assert.equal((await authenticateAdmin(token)).status, 200)
  db.adminUser.findUnique = async () => null
  assert.equal((await authenticateAdmin(token)).status, 401)
})

test('all admin APIs, product creation, uploads, client accounts and diagnostic deny anonymous requests', async () => {
  reset()
  const paths = ['admin/products', 'admin/products/[id]', 'admin/orders', 'admin/pages/[id]', 'admin/blog/posts',
    'admin/blog/posts/[id]', 'admin/blog/categories', 'admin/blog/categories/[id]', 'products', 'cloudinary/upload', 'clients', 'asaas/validate-key']
  for (const route of paths) {
    const api = load('src/app/api/' + route + '/route.ts')
    for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
      if (!api[method] || (route === 'products' && method === 'GET')) continue
      const response = await api[method](request('/api/' + route, method, method === 'GET' ? undefined : {}), { params: Promise.resolve({ id: 'test' }) })
      assert.equal(response.status, 401, route + ' ' + method)
      assert.equal(response.headers.get('cache-control'), 'private, no-store')
    }
  }
})

test('withAdmin allows a real admin and rejects cross-site writes', async () => {
  reset(); db.adminUser = { findUnique: async () => ({ id: 'a', email: 'a@example.invalid', role: 'admin' }) }
  const token = jwt.sign({ id: 'a', email: 'a@example.invalid', role: 'admin' }, process.env.AUTH_JWT_SECRET, { expiresIn: '1h' })
  const { withAdmin } = load('src/core/lib/admin-access.ts')
  const secured = withAdmin(async () => new Response('ok'))
  assert.equal((await secured(request('/api/admin/products', 'POST', {}, { cookie: 'auth_token=' + token }))).status, 200)
  assert.equal((await secured(request('/api/admin/products', 'POST', {}, { cookie: 'auth_token=' + token, origin: 'https://evil.example.invalid' }))).status, 403)
})

test('email + CPF returns summaries and grants matching orders only, including over 20 results', async () => {
  reset(); const one = order(); let query
  db.order = { findMany: async input => { query = input; return Array.from({ length: 25 }, (_, i) => ({ id: 'found-' + i, total: '20', statusPagamento: 'pending', createdAt: new Date() })) },
    findUnique: async ({ where }) => where.id === 'unrelated' ? { email: 'other@example.invalid', cpf: '11111111111' } : one }
  const api = load('src/app/api/orders/find/route.ts')
  const response = await api.POST(request('/api/orders/find', 'POST', { email: 'BUYER@example.invalid', cpf: '000.000.000-00' }))
  assert.equal(response.status, 200); assert.equal((await response.json()).length, 25)
  assert.equal(query.where.email.mode, 'insensitive'); assert.equal(query.where.cpf.in[0], '00000000000')
  cookieJar.set('order_access', response.cookies.get('order_access').value)
  const access = load('src/core/lib/order-access.ts')
  assert.equal(await access.canAccessOrder('found-0'), true)
  assert.equal(await access.canAccessOrder('unrelated'), false)
  const empty = await api.POST(request('/api/orders/find', 'POST', { email: '', cpf: 'x' }))
  assert.equal(empty.status, 400)
})

test('no results replace previous grants; expired or wrong-audience cookies deny access', async () => {
  reset(); grant(); db.order = { findMany: async () => [] }
  const api = load('src/app/api/orders/find/route.ts')
  const response = await api.POST(request('/api/orders/find', 'POST', { email: 'nobody@example.invalid', cpf: '00000000000' }))
  cookieJar.set('order_access', response.cookies.get('order_access').value)
  const { canAccessOrder } = load('src/core/lib/order-access.ts')
  assert.equal(await canAccessOrder('order-one'), false)
  for (const options of [{ audience: 'order-access', expiresIn: -1 }, { audience: 'other', expiresIn: '1h' }]) {
    cookieJar.set('order_access', jwt.sign({ orders: ['order-one'] }, process.env.AUTH_JWT_SECRET, options))
    assert.equal(await canAccessOrder('order-one'), false)
  }
})

test('order list, direct ID, legacy ID lookup and PATCH deny unauthorized requests without DB reads', async () => {
  reset(); const api = load('src/app/api/orders/[id]/route.ts')
  assert.equal((await api.GET(request('/api/orders/order-one'), { params: Promise.resolve({ id: 'order-one' }) })).status, 404)
  assert.equal((await api.PATCH(request('/api/orders/order-one', 'PATCH', { statusPagamento: 'approved', total: 1 }))).status, 403)
  assert.equal((await load('src/app/api/orders/route.ts').GET(request('/api/orders'))).status, 401)
  assert.equal((await load('src/app/api/orders/find/route.ts').GET(request('/api/orders/find?orderId=order-one'))).status, 404)
  grant(); db.order = { findUnique: async () => order() }
  const response = await api.GET(request('/api/orders/order-one'), { params: Promise.resolve({ id: 'order-one' }) })
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store')
})

test('signed shipping rejects tampering, different CEP, quantities and expired quotes', () => {
  reset(); const security = load('src/core/lib/commerce-security.ts')
  const token = security.signShippingQuote('00000000', 2, '5.00', 1)
  assert.equal(security.verifyShippingQuote(token, '00000000', 2, 5), 5)
  assert.throws(() => security.verifyShippingQuote(token, '00000000', 2, 0))
  assert.throws(() => security.verifyShippingQuote(token, '11111111', 2, 5))
  assert.throws(() => security.verifyShippingQuote(token, '00000000', 3, 5))
  assert.throws(() => security.verifyShippingQuote(token + 'x', '00000000', 2, 5))
})

test('checkout rejects nonpositive/fractional quantity and ignores browser prices; reserves aggregate stock', async () => {
  reset(); const security = load('src/core/lib/commerce-security.ts'); const api = load('src/app/api/orders/route.ts')
  const item = { productId: 'product-one', quantity: 1, price: 0.01, size: { name: '' }, color: { name: '' } }
  const buyer = order(); let saved, reserve
  const product = { id: item.productId, name: 'Server product', price: new Decimal('10'), stock: 2, colors: [], sizes: [] }
  const tx = { product: { findMany: async () => [product], updateMany: async input => { reserve = input; return { count: 1 } } },
    order: { create: async ({ data }) => { saved = data; return { id: 'new-order' } } } }
  db.$transaction = async fn => fn(tx)
  const body = { ...buyer, items: [item, item], frete: 5, quoteToken: security.signShippingQuote('00000000', 2, '5.00', 1) }
  for (const quantity of [0, -1, 1.5]) assert.equal((await api.POST(request('/api/orders', 'POST', { ...body, items: [{ ...item, quantity }] }))).status, 400)
  const response = await api.POST(request('/api/orders', 'POST', body))
  assert.equal(response.status, 200); assert.equal(String(saved.total), '20'); assert.equal(saved.statusPagamento, 'pending')
  assert.equal(reserve.where.stock.gte, 2); assert.equal(reserve.data.stock.decrement, 2)
  assert.ok(response.cookies.get('order_access'))
  tx.product.updateMany = async () => ({ count: 0 })
  assert.equal((await api.POST(request('/api/orders', 'POST', body))).status, 400)
})

test('Asaas amount/customer come from order, and unrelated order cannot create a payment', async () => {
  reset(); grant(); db.order = { findUnique: async () => order() }; let sent
  provider = async (endpoint, method, payload) => { sent = payload; return { id: 'pay_test', status: 'PENDING' } }
  const api = load('src/app/api/asaas/create-payment/route.ts')
  const response = await api.POST(request('/api/asaas/create-payment', 'POST', { orderId: 'order-one', customerId: 'forged', total: 0.01, billingType: 'PIX' }))
  assert.equal(response.status, 200); assert.equal(sent.value, 25); assert.equal(sent.customer, 'cus_test')
  assert.equal((await api.POST(request('/api/asaas/create-payment', 'POST', { orderId: 'unrelated', billingType: 'PIX' }))).status, 404)
})

test('card holder details use stored buyer; different holder is blocked without a charge', async () => {
  reset(); grant(); db.order = { findUnique: async () => order() }; let calls = 0, sent
  provider = async (endpoint, method, payload) => { calls++; sent = payload; return { id: 'pay_test', status: 'CONFIRMED' } }
  const api = load('src/app/api/asaas/create-payment/route.ts')
  const body = { orderId: 'order-one', billingType: 'CREDIT_CARD', creditCardData: { creditCardNumber: '0000000000000000', creditCardExpirationMonth: '12', creditCardExpirationYear: '2030', creditCardCvv: '000', creditCardHolderName: 'Synthetic Buyer' } }
  assert.equal((await api.POST(request('/api/asaas/create-payment', 'POST', body))).status, 200)
  assert.equal(sent.creditCardHolderInfo.cpfCnpj, order().cpf)
  body.creditCardData.creditCardHolderName = 'Another Holder'
  assert.equal((await api.POST(request('/api/asaas/create-payment', 'POST', body))).status, 400); assert.equal(calls, 1)
})

test('Mercado Pago preference ignores fake items and charges server subtotal plus shipping', async () => {
  reset(); grant(); db.order = { findUnique: async () => order() }; let sent
  globalThis.fetch = async (url, options) => { sent = JSON.parse(options.body); return Response.json({ id: 'pref_test', init_point: 'https://example.invalid/pay' }) }
  const api = load('src/app/api/mercado-pago/preference/route.ts')
  assert.equal((await api.POST(request('/api/mercado-pago/preference', 'POST', { orderId: 'order-one', items: [{ price: 0.01, quantity: 1 }] }))).status, 200)
  assert.equal(sent.items[0].unit_price, 10); assert.equal(sent.items[0].quantity, 2); assert.equal(sent.shipments.cost, 5)
})

test('webhooks fail closed; verified provider values associate order and duplicate notifications are no-ops', async () => {
  reset(); const current = order(); let updates = 0
  db.order = { findUnique: async () => current, updateMany: async ({ data }) => { updates++; current.statusPagamento = data.statusPagamento; return { count: 1 } } }
  provider = async () => ({ id: 'pay_test', externalReference: current.id, customer: current.customerId, value: 25, status: 'CONFIRMED' })
  const api = load('src/app/api/asaas/webhook/route.ts')
  const body = { event: 'PAYMENT_CONFIRMED', payment: { id: 'pay_test', value: 0.01 } }
  assert.equal((await api.POST(request('/api/asaas/webhook', 'POST', body))).status, 401)
  for (let i = 0; i < 2; i++) assert.equal((await api.POST(request('/api/asaas/webhook', 'POST', body, { 'asaas-access-token': process.env.ASAAS_WEBHOOK_TOKEN }))).status, 200)
  assert.equal(updates, 1); assert.equal(current.statusPagamento, 'approved')
  const apply = load('src/core/lib/payment-security.ts').applyVerifiedPayment
  assert.equal(await apply(current.id, 0.01, 'approved', current.customerId), false)
  assert.equal(await apply(current.id, 25, 'approved', 'another-customer'), false)
  assert.equal(await apply(current.id, 25, 'pending', current.customerId), true); assert.equal(updates, 1)
  delete process.env.ASAAS_WEBHOOK_TOKEN
  assert.equal((await api.POST(request('/api/asaas/webhook', 'POST', body))).status, 503)
  process.env.ASAAS_WEBHOOK_TOKEN = 'synthetic-asaas-webhook-token'
})

test('Mercado Pago uses official manifest signature, checks currency/value and ignores redelivery', async () => {
  reset(); const current = order(); let updates = 0
  db.order = { findUnique: async () => current, updateMany: async ({ data }) => { updates++; current.statusPagamento = data.statusPagamento; return { count: 1 } } }
  globalThis.fetch = async () => Response.json({ id: 123, status: 'approved', external_reference: current.id, transaction_amount: 25, currency_id: 'BRL' })
  const api = load('src/app/api/mercado-pago/webhook/route.ts')
  const tsValue = '1742505638683', requestId = 'synthetic-request'
  const signature = createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET).update(`id:123;request-id:${requestId};ts:${tsValue};`).digest('hex')
  const headers = { 'x-signature': `ts=${tsValue},v1=${signature}`, 'x-request-id': requestId }
  const body = { type: 'payment', data: { id: '123' } }
  assert.equal((await api.POST(request('/api/mercado-pago/webhook?data.id=123', 'POST', body))).status, 401)
  for (let i = 0; i < 2; i++) assert.equal((await api.POST(request('/api/mercado-pago/webhook?data.id=123', 'POST', body, headers))).status, 200)
  assert.equal(updates, 1)
  assert.equal((await api.POST(request('/api/mercado-pago/webhook?data.id=999', 'POST', body, headers))).status, 401)
})

test('lookup abuse limiter and cross-origin writes do not require an external service', () => {
  reset(); const { allowAttempt, mutationGuard } = load('src/core/lib/request-security.ts')
  assert.equal(allowAttempt('synthetic-limit', 2), true); assert.equal(allowAttempt('synthetic-limit', 2), true)
  assert.equal(allowAttempt('synthetic-limit', 2), false)
  assert.equal(mutationGuard(request('/api/orders/find', 'POST', {}, { origin: 'https://evil.example.invalid' }), 'lookup').status, 403)
})

test('legitimate login issues admin cookie; wrong password and non-admin role are rejected', async () => {
  reset(); const bcrypt = require('bcryptjs')
  const user = { id: 'a', email: 'admin@example.invalid', role: 'admin', passwordHash: await bcrypt.hash('synthetic-password', 4) }
  db.adminUser = { findFirst: async () => user, findUnique: async () => user }
  db.accessLog = { create: async () => ({}) }
  const api = load('src/app/api/auth/login/route.ts')
  const response = await api.POST(request('/api/auth/login', 'POST', { email: user.email, password: 'synthetic-password' }))
  assert.equal(response.status, 200); assert.ok(response.cookies.get('auth_token'))
  assert.equal((await api.POST(request('/api/auth/login', 'POST', { email: user.email, password: 'wrong' }))).status, 401)
  user.role = 'buyer'
  assert.equal((await api.POST(request('/api/auth/login', 'POST', { email: user.email, password: 'synthetic-password' }))).status, 401)
})

test('customer creation persists server-derived payer without fictitious birthday or browser PATCH', async () => {
  reset(); grant(); const current = order(); current.customerId = null; let stored, payload
  const tx = { $queryRaw: async () => [], order: { findUnique: async () => current,
    update: async ({ data }) => { stored = data.customerId; current.customerId = stored } } }
  db.$transaction = async fn => fn(tx)
  provider = async (endpoint, method, data) => { payload = data; return { id: 'cus_created' } }
  const api = load('src/app/api/asaas/create-customer/route.ts')
  const response = await api.POST(request('/api/asaas/create-customer', 'POST', { orderId: current.id, name: 'forged', cpf: '11111111111' }))
  assert.equal(response.status, 200); assert.equal(stored, 'cus_created'); assert.equal(payload.name, current.fullName)
  assert.equal(payload.cpfCnpj, current.cpf); assert.equal(payload.address, current.address.street); assert.ok(!('birthDate' in payload))
  provider = async () => { throw new Error('Must reuse existing customer') }
  assert.equal((await api.POST(request('/api/asaas/create-customer', 'POST', { orderId: current.id }))).status, 200)
})

test('PIX rejects forged access before provider request and validates payment association', async () => {
  reset(); cookieJar.set('order_access', 'forged')
  const api = load('src/app/api/asaas/pix-qrcode/route.ts')
  assert.equal((await api.GET(request('/api/asaas/pix-qrcode?paymentId=pay_test'))).status, 404)
  grant(); db.order = { findUnique: async () => order() }
  provider = async endpoint => endpoint.endsWith('/pixQrCode') ? { encodedImage: 'synthetic', payload: 'synthetic', expirationDate: '2030-01-01' } :
    { externalReference: 'order-one', customer: 'cus_test', billingType: 'PIX', value: 25 }
  assert.equal((await api.GET(request('/api/asaas/pix-qrcode?paymentId=pay_test'))).status, 200)
  provider = async () => ({ externalReference: 'order-one', customer: 'other', billingType: 'PIX', value: 25 })
  assert.equal((await api.GET(request('/api/asaas/pix-qrcode?paymentId=pay_test'))).status, 404)
})

test('module defaults preserve commerce and blog; disabled store cannot enable checkout', () => {
  reset(); const { defaultModules, moduleEnabled, routeEnabled } = load('src/core/lib/module-config.ts')
  assert.equal(moduleEnabled(defaultModules, 'store'), true); assert.equal(moduleEnabled(defaultModules, 'checkout'), true)
  for (const route of ['/loja', '/loja/produto/item', '/loja/carrinho', '/loja/checkout', '/loja/pedido/id', '/blog']) assert.equal(routeEnabled(defaultModules, route), true)
  const off = { ...defaultModules, store: { enabled: false, checkout: true } }
  assert.equal(moduleEnabled(off, 'checkout'), false)
  for (const route of ['/loja', '/loja/produto/item', '/loja/carrinho', '/loja/checkout', '/loja/pedido/id', '/pedido/id', '/carrinho', '/api/products', '/api/orders', '/api/asaas/webhook', '/api/mercado-pago/webhook']) assert.equal(routeEnabled(off, route), false, route)
  for (const route of ['/', '/sobre', '/personalizado', '/loja-inexistente', '/api/admin/orders', '/api/admin/products', '/admin/pedidos']) assert.equal(routeEnabled(off, route), true, route)
  assert.equal(routeEnabled(off, '/api/admin/products', 'POST'), false)
})

test('catalog-only mode keeps historical email + CPF lookup but blocks new orders, cart and payments', async () => {
  reset(); const defaults = load('src/core/lib/module-config.ts').defaultModules
  configOverride = { ...defaults, store: { enabled: true, checkout: false } }
  const routes = load('src/core/lib/module-config.ts').routeEnabled
  for (const path of ['/loja', '/loja/produto/test', '/loja/meus-pedidos', '/loja/pedido/test', '/api/orders/find']) assert.equal(routes(configOverride, path), true)
  for (const path of ['/loja/carrinho', '/loja/checkout', '/loja/pedido/test/pagamento', '/api/asaas/create-payment']) assert.equal(routes(configOverride, path), false)
  assert.equal((await load('src/app/api/orders/route.ts').POST(request('/api/orders', 'POST', {}))).status, 404)
  db.order = { findMany: async () => [] }
  assert.equal((await load('src/app/api/orders/find/route.ts').POST(request('/api/orders/find', 'POST', { email: 'buyer@example.invalid', cpf: '00000000000' }))).status, 200)
})

test('disabled commerce APIs return 404 before parsing input, database/authentication or providers', async () => {
  reset(); configOverride = { store: { enabled: false }, blog: true, portfolio: false, services: false, pwa: false }
  const paths = ['products', 'categorias', 'orders', 'orders/[id]', 'orders/find', 'frete', 'clients',
    'asaas/create-customer', 'asaas/create-payment', 'asaas/pix-qrcode', 'asaas/validate-key', 'asaas/webhook',
    'mercado-pago/preference', 'mercado-pago/webhook']
  for (const path of paths) {
    const api = load('src/app/api/' + path + '/route.ts')
    for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) if (api[method]) {
      const req = new NextRequest('https://shop.example.invalid/api/' + path, { method,
        ...(method === 'GET' ? {} : { body: '{invalid-json' }) })
      const response = await api[method](req, { params: Promise.resolve({ id: 'test' }) })
      assert.equal(response.status, 404, path + ' ' + method); assert.equal(response.headers.get('cache-control'), 'no-store')
    }
  }
  assert.equal((await load('src/app/api/admin/products/route.ts').POST(request('/api/admin/products', 'POST', {}))).status, 404)
  assert.equal((await load('src/app/api/admin/orders/route.ts').GET(request('/api/admin/orders'))).status, 401)
})

test('blog switch blocks public pages and CMS mutations, retaining authenticated history reads', async () => {
  reset(); configOverride = { store: { enabled: true, checkout: true }, blog: false, portfolio: false, services: false, pwa: false }
  const api = load('src/app/api/admin/blog/posts/route.ts')
  assert.equal((await api.POST(request('/api/admin/blog/posts', 'POST', {}))).status, 404)
  assert.equal((await api.GET(request('/api/admin/blog/posts'))).status, 401)
  const page = load('src/app/(site)/blog/page.tsx').default
  await assert.rejects(page(), /NEXT_NOT_FOUND/)
})

test('disabled modules disappear from public navigation and home avoids blog queries', async () => {
  reset(); configOverride = { store: { enabled: false }, blog: false, portfolio: false, services: false, pwa: false }
  const React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
  const { CartProvider } = load('src/core/context/CartContext.tsx')
  const Header = load('src/client/components/Header.tsx').default
  const html = renderToStaticMarkup(React.createElement(CartProvider, null, React.createElement(Header)))
  assert.ok(!/href="\/(loja|blog|portfolio|servicos)/.test(html)); assert.ok(html.includes('wa.me'))
  const home = await load('src/client/home/HomePage.tsx').default()
  const homeHtml = renderToStaticMarkup(home)
  assert.ok(!/href="\/(loja|blog)/.test(homeHtml)); assert.ok(homeHtml.includes('wa.me'))
})

test('sitemap omits disabled sources without touching commercial/blog models', async () => {
  reset(); configOverride = { store: { enabled: false }, blog: false, portfolio: true, services: true, pwa: true }
  contentOverride = { portfolioEntries: [{ slug: 'synthetic-project', title: 'Test' }], serviceEntries: [{ slug: 'synthetic-service', title: 'Test' }] }
  db.customPage = { findMany: async () => [{ slug: 'sobre' }] }
  const sitemap = await load('src/app/sitemap.ts').default()
  const urls = sitemap.map(entry => entry.url)
  assert.ok(urls.some(url => url.endsWith('/portfolio/synthetic-project')))
  assert.ok(urls.some(url => url.endsWith('/servicos/synthetic-service')))
  assert.ok(!urls.some(url => /\/(loja|blog|pedido|carrinho|checkout|offline)/.test(url)))
})

test('active sitemap includes dynamic published posts/catalog but excludes operational URLs', async () => {
  reset(); db = { customPage: { findMany: async () => [] }, product: { findMany: async () => [{ slug: 'synthetic-product' }] },
    category: { findMany: async () => [] }, post: { findMany: async ({ where }) => { assert.equal(where.published, true); return [{ slug: 'synthetic-post' }] } }, blogCategory: { findMany: async () => [] } }
  const urls = (await load('src/app/sitemap.ts').default()).map(entry => entry.url)
  assert.ok(urls.some(url => url.endsWith('/loja/produto/synthetic-product')))
  assert.ok(urls.some(url => url.endsWith('/blog/synthetic-post')))
  assert.ok(!urls.some(url => /\/(pedido|checkout|carrinho|meus-pedidos)/.test(url)))
})

test('portfolio/services are real optional routes with client-owned content', async () => {
  reset(); configOverride = { store: { enabled: false }, blog: false, portfolio: false, services: false, pwa: false }
  assert.throws(() => load('src/app/(site)/portfolio/page.tsx').default(), /NEXT_NOT_FOUND/)
  assert.throws(() => load('src/app/(site)/servicos/page.tsx').default(), /NEXT_NOT_FOUND/)
  reset(); configOverride = { store: { enabled: false }, blog: false, portfolio: true, services: true, pwa: false }
  contentOverride = { portfolioEntries: [{ slug: 'example', title: 'Synthetic', description: 'Test', content: 'Test' }], serviceEntries: [] }
  assert.ok(load('src/app/(site)/portfolio/page.tsx').default())
  assert.ok(await load('src/app/(site)/portfolio/[slug]/page.tsx').default({ params: Promise.resolve({ slug: 'example' }) }))
  await assert.rejects(load('src/app/(site)/servicos/[slug]/page.tsx').default({ params: Promise.resolve({ slug: 'missing' }) }), /NEXT_NOT_FOUND/)
})

test('PWA manifest respects enabled state; cache accepts only neutral offline fallback', () => {
  reset(); configOverride = { store: { enabled: false }, blog: false, portfolio: false, services: false, pwa: false }
  assert.throws(() => load('src/app/manifest.ts').default(), /NEXT_NOT_FOUND/)
  reset(); configOverride = { store: { enabled: false }, blog: false, portfolio: false, services: false, pwa: true }
  const manifest = load('src/app/manifest.ts').default()
  assert.equal(manifest.start_url, '/'); assert.ok(!JSON.stringify(manifest).includes('/loja'))
  const { canCachePublicDocument } = load('src/core/lib/module-config.ts')
  assert.equal(canCachePublicDocument(configOverride, '/offline'), true)
  for (const route of ['/loja', '/api/orders', '/admin', '/loja/checkout', '/pedido/test', '/blog', '/offline?secret=test']) assert.equal(canCachePublicDocument(configOverride, route), false)
})

test('service worker bypasses commerce, APIs and external origins; disabled mode retires registration', async () => {
  reset(); const source = load('src/core/pwa/worker.ts').workerSource
  const config = { store: { enabled: true, checkout: true }, blog: true, portfolio: false, services: false, pwa: true }
  const handlers = {}, self = { location: { origin: 'https://shop.example.invalid' }, addEventListener: (name, fn) => { handlers[name] = fn }, registration: { unregister: async () => true } }
  vm.runInNewContext(source(config), { self, URL, Response })
  for (const url of ['/loja', '/loja/pedido/test', '/api/orders', '/admin', '/pedido/test']) handlers.fetch({ request: { url: self.location.origin + url, method: 'GET', mode: 'navigate' }, respondWith: () => assert.fail('Private route intercepted') })
  const offHandlers = {}; let retired = false, deleted = []
  vm.runInNewContext(source({ ...config, pwa: false }), { self: { ...self, addEventListener: (name, fn) => { offHandlers[name] = fn }, registration: { unregister: async () => { retired = true } } },
    caches: { keys: async () => ['upnode-pwa-old', 'other-app'], delete: async key => { deleted.push(key) } }, URL, Response })
  assert.equal(offHandlers.fetch, undefined)
  let activated; offHandlers.activate({ waitUntil: promise => { activated = promise } }); await activated
  assert.equal(retired, true); assert.deepEqual(deleted, ['upnode-pwa-old'])
})
