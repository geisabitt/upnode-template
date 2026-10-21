# Build e módulos configuráveis

Alterações exclusivas na matriz, branch `desenvolvimento`. Nenhum cliente, backup,
schema, migration, banco ou ambiente de produção foi alterado. Nenhuma cobrança,
push, merge ou deploy foi executado. Arquivos de ambiente não foram lidos nem copiados.

## Configuração central

`src/client/config/modules.config.ts` é a única fonte de ativação. Contrato tipado em
`src/core/lib/module-config.ts`:

```ts
// Padrão da matriz (preservado):
{ store: { enabled: true, checkout: true }, blog: true,
  portfolio: false, services: false, pwa: false }

// Equivalente institucional da E&L:
{ store: { enabled: false }, blog: true,
  portfolio: true, services: true, pwa: true }

// Catálogo sem novas compras:
{ store: { enabled: true, checkout: false }, blog: true,
  portfolio: false, services: false, pwa: false }
```

Não habilitar checkout com loja desligada: TypeScript rejeita a combinação, e a função
de resolução também impede sua ativação se a configuração vier de JavaScript inválido.
Checkout e pagamentos compartilham a mesma opção. Mudanças são de código/configuração
e exigem novo build; não existe painel ou alternância em banco nesta etapa.

## Contratos

- **Loja desligada:** páginas públicas e APIs comerciais retornam 404 antes de parsing,
  acesso a banco ou provedor. Produtos/pedidos existentes não são excluídos. Leituras
  administrativas históricas continuam exigindo autorização; gravações comerciais são
  bloqueadas. Menus públicos e sitemap omitem a loja.
- **Checkout desligado com loja ativa:** catálogo continua público. Carrinho, frete,
  novas compras e pagamentos são bloqueados. Consulta e acompanhamento de pedidos antigos
  permanecem disponíveis por e-mail + CPF, com as mesmas proteções da primeira etapa.
- **Blog desligado:** páginas públicas, consultas na home, entradas do sitemap e mutações
  administrativas do blog são bloqueadas. Leituras administrativas históricas permanecem.
- **Portfólio/serviços:** rotas opcionais de listagem e detalhe, com conteúdo próprio em
  `src/client/config/content.config.ts`. Listas vazias por padrão; nenhum projeto, texto,
  tema ou marca dos clientes foi importado. Detalhe inexistente retorna 404.
- **PWA:** desligado por padrão. Manifesto, página offline e registro do worker dependem
  da configuração. Implementação nativa sem nova dependência: armazena somente o fallback
  neutro `/offline`, sem cache de catálogo, pedidos, APIs, RSC ou páginas transacionais.
  Ao desligar, o provider remove registros conhecidos e caches próprios; o endpoint do
  worker continua respondendo com um script de retirada para instalações anteriores.
  É PWA básico, sem o modo de apresentação offline completo dos clientes.
- **Sitemap:** dinâmico, fontes isoladas por `Promise.allSettled`, sem consultar modelos de
  módulos desligados. Apenas posts publicados e páginas públicas são incluídos; operações
  e pedidos nunca entram. Páginas administráveis dependem de registros existentes.
- **Histórico:** desligar o módulo não elimina código, tabelas nem registros. Menus de
  leitura administrativa histórica não são removidos como se os registros deixassem de existir.

## Reaproveitamento

- E&L: contratos de prefixos, bloqueios antes de processamento, `notFound` no servidor,
  resposta 404/no-store/noindex e sitemap tolerante a falhas, generalizados para os módulos.
- `store.ts` e `store-server.ts` são fachadas compatíveis com os imports existentes de E&L.
  Ambos resolvem a configuração central; não mantêm um segundo `siteConfig.store.enabled`.
- Bittup/E&L: padrão de manifesto baseado na identidade local e provider configurável.
  Serwist não foi importado: seu cache genérico e dependências não são necessários para
  o fallback mínimo adotado. O modo de apresentação continua fora desta entrega.
- Maribela: autorização administrativa da primeira etapa foi preservada, com o bloqueio
  de módulo aplicado antes dela para APIs indisponíveis.

## Correções de build

1. `/carrinho` e `/pedido/[orderId]` movidos para o grupo `(site)`, mantendo URLs. Passam
   a utilizar layout público, navegação e contexto do carrinho já existentes. Não foi criado
   um layout global duplicando `<html>`/`<body>` dos grupos público e administrativo.
2. Rota antiga de pedido usa `useParams`; parâmetros das APIs de posts/categorias usam
   `Promise`, conforme contrato de Next.js 16.
3. Conteúdo público dependente do CMS é renderizado em tempo de requisição, evitando
   necessidade de banco/credenciais durante build. Revisar estratégia de cache de conteúdo
   em uma etapa de performance, sem cache de informações privadas.

## Validação

- **27 testes simulados aprovados**: segurança da primeira etapa e combinações dos módulos,
  menus, consultas, sitemap, guardas e política do worker. Prisma/provedores são substituídos
  por simulações; nenhum dado pessoal real é usado.
- **TypeScript aprovado**, incluindo teste de tipos que rejeita checkout sem loja.
- **Build Webpack com perfil padrão aprovado**; **build padrão Turbopack com perfil
  institucional simulado aprovado**, ambos completos com validação TypeScript.
- Builds em cópia temporária dentro da matriz, sem arquivos de ambiente, com segredo
  sintético e URL de banco inacessível. Prisma generate não foi necessário (schema intacto).
  O acesso adicional foi utilizado apenas para fontes públicas Geist. Cópia removida.
- **34 verificações HTTP aprovadas** em servidores locais dos builds: 11 no perfil padrão
  e 23 no institucional. Incluem carrinho/checkout/consulta 200, redirects de pedidos sem
  autorização, APIs 401/404, home institucional 200 sem links comerciais, opcionais 200/404
  e webhooks bloqueados antes de JSON inválido. Servidores encerrados após os testes.
- **Lint geral: 32 erros e 15 avisos preexistentes** (antes desta etapa: 33/15). Comparação
  dos arquivos alterados não encontrou novos apontamentos. `git diff --check` aprovado.
- Avisos não bloqueantes: convenção middleware depreciada; Webpack aponta importação de
  CompressionStream/DecompressionStream do `jose` para Edge. Autorização simulada e acessos
  HTTP sem sessão foram verificados; login/JWT em ambiente implantado ainda requer validação.
- O aviso de múltiplos lockfiles veio da cópia temporária de validação, removida ao final.

## Antes da distribuição

1. Fazer adaptação pontual da configuração de cada cliente: não sobrescrever seu conteúdo,
   tema, SEO nem home. E&L deve receber `store.enabled: false`; outros clientes devem manter
   o comércio conforme sua configuração existente. Não copiar o perfil simulado de teste.
2. Não desligar vendas/pagamentos com cobranças pendentes sem plano de conciliação: os
   webhooks comerciais também são bloqueados pelo módulo. Histórico continua no banco.
3. Validar catálogo/conteúdo real em banco de desenvolvimento e cobranças em sandbox.
   Builds e simulações não validam integrações financeiras ou dados de produção.
4. PWA usa o logo local como ícone genérico: conferir assets 192/512, instalação, atualização
   e retirada em navegadores reais antes de ativar por cliente. Instalações offline só recebem
   mudanças de configuração quando voltam a se conectar.
5. Revisar os erros de lint remanescentes e planejar a migração de middleware para proxy
   separadamente. As pendências financeiras documentadas na primeira etapa continuam válidas.
