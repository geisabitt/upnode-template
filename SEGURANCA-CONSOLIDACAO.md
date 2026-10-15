# Consolidação de segurança — primeira etapa

Atualização da etapa seguinte: o bloqueio de layout/build foi resolvido. Configurações
de módulos e validações posteriores estão em [MODULOS-E-BUILD.md](MODULOS-E-BUILD.md).
Os resultados abaixo registram o estado da primeira etapa.

Implementação exclusiva na matriz, branch `desenvolvimento`, criada de `main` com árvore limpa.
Clientes, backups, schema e migrations não foram alterados. Não houve banco real, cobrança,
push, merge ou deploy. Nenhum arquivo de ambiente foi lido/copied para validação.

## Reaproveitamento

- Maribela: `admin-access.ts`, `auth-token.ts`, `session.ts` e middleware copiados;
  APIs administrativas, produtos e upload reaproveitadas. `request-security.ts` recebeu
  limitação local de tentativas; upload recebeu limites de tipo, quantidade e tamanho.
- E&L: consulta de pedidos copiada e adaptada sem controle de módulos; grants temporários,
  verificações de pedido e proteção das páginas reaproveitados conceitualmente. O cookie
  ganhou uma impressão HMAC da identidade consultada para não limitar acesso quando há
  mais resultados que IDs comportados no cookie. Nenhum e-mail/CPF é gravado nesse cookie.
- Demais clientes: comparação anterior não identificou proteção complementar superior
  para estes fluxos. Não foram importados marca, domínio, tema nem configurações comerciais.

## Contratos preservados e reforçados

- Consulta continua sendo POST `/api/orders/find` com **e-mail + CPF**, sem conta, OTP,
  Resend, SMS ou serviço externo. Retorno mantém a lista de resumos. Uma consulta sem
  resultados substitui as autorizações anteriores. Cookie HttpOnly dura até 24 horas.
- Criação de pedido concede acesso ao pedido criado; listagem completa exige administrador.
  A leitura por ID exige grant correspondente ou administrador existente no banco.
- PATCH genérico de pedido é recusado para todos os perfis. Não havia edição administrativa
  de pedido consumindo esse endpoint no código inspecionado. Cadastro Asaas persiste o
  `customerId` no servidor, eliminando o PATCH do navegador.
- Parâmetros de retorno do provedor não alteram nem aprovam status no banco.
- `Order.total` continua sendo subtotal dos produtos; frete permanece separado.
  Cobranças somam os dois valores no servidor, ignorando preço/total/pagador do navegador.
- Quantidades devem ser inteiras positivas. Itens repetidos são agregados para baixa
  condicional de estoque dentro da transação, usando preço e disponibilidade persistidos.
- Cotação do Melhor Envio inclui token assinado válido por 20 minutos, vinculado a CEP,
  quantidade e preço. O checkout envia esse token sem mudança visual. Frete gratuito válido
  também pode ser utilizado. CEP/CPF/telefone formatados são normalizados.
- Administração valida JWT HS256, expiração, papel e existência do administrador no banco.
  Páginas com dados verificam autorização no servidor; APIs usam `withAdmin`.
- Upload administrativo aceita até 20 imagens JPEG/PNG/WebP/GIF/AVIF, cada uma até 10 MB.
  Logs que podiam revelar a assinatura/segredo Cloudinary foram removidos.

## Webhooks e pagamentos

- Asaas exige `ASAAS_WEBHOOK_TOKEN` no ambiente e compara `asaas-access-token` antes de
  processar. O token deve ser o configurado no webhook, não a chave da API.
- Mercado Pago exige `MERCADO_PAGO_WEBHOOK_SECRET` e valida HMAC do manifesto oficial
  com `data.id`, `x-request-id` e `ts`. IPN legado sem assinatura não é aceito.
- Ambos consultam o pagamento no provedor antes de atualizar o pedido e verificam referência
  e valor. Asaas verifica também o pagador; Mercado Pago exige moeda BRL.
- Status é atualizado por compare-and-set. Redelivery do mesmo estado não escreve novamente;
  eventos pendentes não rebaixam liquidação/refundo. Nenhum efeito adicional de estoque,
  e-mail ou cobrança é disparado por webhook nesta implementação.
- Cartão do próprio comprador utiliza seus dados persistidos, sem dados fictícios. Cartão de
  outro titular é bloqueado: o formulário não coleta documento/endereço desse titular.
  A coleta desses dados fica pendente de decisão, sem inventar identidade.
- Criação de pagador serializa chamadas do mesmo pedido com bloqueio de linha. Respostas
  ambíguas do provedor podem exigir conciliação antes de repetir operações.

## Validação

- `node --test tests/security.test.mjs`: **17 testes aprovados**. Prisma e provedores são
  simulados; o harness não carrega dotenv nem um cliente de banco real. Dados são sintéticos.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: aprovado antes e depois.
- ESLint: antes **53 erros / 15 avisos**; depois **33 erros / 15 avisos**. Comparação por
  arquivo/regra/mensagem não identificou novo problema de lint nos arquivos desta entrega.
- Build de produção tentado com Next 16.2.4/webpack em cópia temporária sem arquivos de
  ambiente, com credenciais sintéticas e endereço de banco inacessível. Falhou antes da
  compilação: `carrinho/page.tsx doesn't have a root layout`. O HEAD original já possuía
  essa página fora dos grupos de layout e não possuía `src/app/layout.tsx`.
  A cópia temporária foi removida. Prisma generate não foi executado.
- Build completo, navegador, banco real, concorrência em PostgreSQL e sandbox dos provedores
  **não estão validados**. A suíte simula a reserva condicional, não um teste concorrente real.

## Pendências antes da distribuição

1. Resolver o layout raiz preexistente e os erros restantes de lint, em alteração separada.
2. Configurar segredos dos webhooks e validar entregas/retries em sandbox. Sem configuração,
   os endpoints recusam processamento com 503; não há fallback permissivo.
3. Validar os limites de upload com o acervo esperado; validar emissões de cotação e todos
   os chamadores de criação de pedidos, que agora devem enviar `quoteToken`.
4. Confirmar CEP de origem, dimensões, peso e valor segurado do Melhor Envio: os valores
   fixos existentes foram preservados, pois não há especificação logística para substituí-los.
5. Limitação de tentativas é por processo e depende dos cabeçalhos confiáveis do proxy.
   Para implantação distribuída, acrescentar controle compartilhado/na borda. E-mail + CPF
   permanece uma prova de conhecimento limitada; autenticação mais forte continua adiada.
6. O schema não tem registro de tentativa/pagamento/evento com chave única. Não foi criado
   ledger. A atribuição de status é idempotente, mas criação de cobranças exatamente uma vez,
   retries após timeout, conciliação e histórico de múltiplas cobranças requerem desenho próprio.
7. Confirmar política de reserva/expiração/reposição de estoque para pedidos não pagos.
   A baixa na criação foi preservada; não foi inventada regra de reposição.
8. O cadastro de pagador segura uma transação durante a chamada externa: verificar timeout e
   pool em sandbox. Desenho com fila/idempotência persistida fica para uma etapa autorizada.
9. Antes de módulos, definir contratos `store.enabled`, checkout, blog e PWA com loja ativa
   por padrão; preservar a loja desativada de E&L na futura distribuição. Nada foi distribuído.

## Documentação oficial consultada

- [Asaas: webhooks e token](https://docs.asaas.com/docs/about-webhooks)
- [Asaas: cadastro de cliente](https://docs.asaas.com/reference/create-new-customer)
- [Asaas: pagamento com cartão](https://docs.asaas.com/reference/create-new-payment-with-credit-card)
- [Mercado Pago: assinatura de notificações](https://www.mercadopago.com.br/developers/en/docs/checkout-pro-preferences/payment-notifications)
- [Mercado Pago: frete na preferência](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/additional-settings/shipping-cost)

## Arquivos da entrega

<!-- A lista abaixo é preenchida a partir dos caminhos locais alterados. -->

- `package.json`
- `src/app/(admin)/admin/blog/categories/[id]/edit/page.tsx`
- `src/app/(admin)/admin/blog/categories/new/page.tsx`
- `src/app/(admin)/admin/blog/categories/page.tsx`
- `src/app/(admin)/admin/blog/posts/[id]/edit/page.tsx`
- `src/app/(admin)/admin/blog/posts/new/page.tsx`
- `src/app/(admin)/admin/blog/posts/page.tsx`
- `src/app/(admin)/admin/clients/layout.tsx`
- `src/app/(admin)/admin/custom-page/[id]/page.tsx`
- `src/app/(admin)/admin/custom-page/page.tsx`
- `src/app/(admin)/admin/etiquetas/layout.tsx`
- `src/app/(admin)/admin/page.tsx`
- `src/app/(admin)/admin/pedidos/[id]/page.tsx`
- `src/app/(admin)/admin/pedidos/layout.tsx`
- `src/app/(admin)/admin/products/[id]/edit/page.tsx`
- `src/app/(admin)/admin/products/new/page.tsx`
- `src/app/(admin)/admin/products/page.tsx`
- `src/app/(site)/loja/pedido/[id]/pagamento/layout.tsx`
- `src/app/(site)/loja/pedido/[id]/pagamento/page.tsx`
- `src/app/(site)/loja/pedido/[id]/page.tsx`
- `src/app/api/admin/blog/categories/[id]/route.ts`
- `src/app/api/admin/blog/categories/route.ts`
- `src/app/api/admin/blog/posts/[id]/route.ts`
- `src/app/api/admin/blog/posts/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/pages/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/asaas/create-customer/route.ts`
- `src/app/api/asaas/create-payment/route.ts`
- `src/app/api/asaas/pix-qrcode/route.ts`
- `src/app/api/asaas/validate-key/route.ts`
- `src/app/api/asaas/webhook/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/clients/route.ts`
- `src/app/api/cloudinary/upload/route.ts`
- `src/app/api/frete/route.ts`
- `src/app/api/mercado-pago/preference/route.ts`
- `src/app/api/mercado-pago/webhook/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/find/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/products/route.ts`
- `src/app/api/setup-admin/route.ts`
- `src/app/pedido/[orderId]/layout.tsx`
- `src/core/components/CheckoutForm.tsx`
- `src/core/lib/admin-access.ts`
- `src/core/lib/asaas.ts`
- `src/core/lib/auth-token.ts`
- `src/core/lib/cloudinary.ts`
- `src/core/lib/commerce-security.ts`
- `src/core/lib/mercado-pago-security.ts`
- `src/core/lib/order-access.ts`
- `src/core/lib/payment-security.ts`
- `src/core/lib/request-security.ts`
- `src/core/lib/session.ts`
- `src/core/lib/validators/checkoutSchema.ts`
- `src/middleware.ts`
- `tests/security.test.mjs`
