# Validação e distribuição segura — UpNode

Data: 15/10/2026. Base: 35f50c9, 171cd0a e 5799f90; branch da matriz: desenvolvimento. Caminhos abaixo relativos a D:/Dev Sistemas/upnode-clientes/, salvo indicação contrária.

## Resultado geral

Matriz aprovada para preparar distribuições individuais, condicionadas às verificações abaixo. Nenhum cliente ou backup foi modificado. Não houve leitura de .env, acesso a credenciais, migração, banco real, cobrança, push, merge ou deploy.

- TypeScript: aprovado, sem emissão e sem incremental.
- ESLint: de 31 erros/15 avisos para **0 erros/10 avisos**, sem desativar regras.
- Testes existentes: **37/37 aprovados** em tests/security.test.mjs. Cobrem JWT inválido/expirado/perfil, login simulado, autorização administrativa e uploads, e-mail + CPF, grants de pedidos, PATCH indevido, preços/quantidades/frete assinados, pagamentos e webhooks simulados, duplicidade, módulos ativos/inativos, PWA, sitemap, robots, canonical, metadados, JSON-LD, publicação/noindex/404 e conteúdo seguro.
- Build Next 16.2.4/Turbopack: aprovado em cópia temporária da matriz sem .env, com banco sintético inacessível e sem executar prisma generate. O schema e o cliente gerado existente não foram alterados. Fontes públicas foram obtidas durante o build.
- HTTP no build real isolado: **11/11 aprovados**: /carrinho 307; /loja/carrinho, /loja/checkout e /loja/meus-pedidos 200 com noindex; /api/orders 401; pedido por ID sem autorização 404; serviços/portfólio/PWA desativados 404; /admin 307; robots 200. Renderização dinâmica dependente de banco não foi exercitada com dados reais.
- Testes de módulos desligados e SEO dinâmico usam simulações da suíte; não equivalem a homologação visual completa em navegador ou a um segundo ambiente implantado.
- Consulta por **e-mail + CPF preservada**, sem OTP, Resend, SMS ou conta obrigatória. Loja e checkout ativos por padrão; blog ativo, serviços/portfólio/PWA opcionais desligados na matriz. Histórico preservado com leitura administrativa autenticada.

## Correções pontuais e revisão do lint

Todas as 46 ocorrências iniciais foram examinadas. Correções nos caminhos dentro de upnode-template/:

| Ocorrências originais | Tratamento |
|---|---|
| login/page.tsx, api/auth/logout/route.ts, api/clients/route.ts, core/components/admin/LogoutButton.tsx | Retiradas variáveis de catch não utilizadas. |
| app/(admin)/admin/pedidos/page.tsx: opções, setters, loading e totalPages sem uso | Removido somente estado/cálculo morto; requisição e tabela mantidas. Filtros/paginação visuais já não estavam implementados e continuam pendentes. |
| app/(site)/loja/pedido/[id]/page.tsx e core/components/admin/PostForm.tsx, ProductForm.tsx, payment/PaymentMethodSelector.tsx | Retirados mapeamento/imports/setter sem uso. |
| admin/pedidos/[id], loja/pedido/[id]/pagamento, personalizado, api/admin/orders, CartContext, types/order | Tipos explícitos para endereço, imagens, FAQ e filtro Prisma; catches unknown com mensagem segura. FAQ tipada conforme campos pergunta/resposta já usados. |
| core/lib/pdf/pdfProcessor.ts | Tipo PDFDocumentProxy e discriminação de itens de texto; remoção de import/cast sem necessidade. Renderização/impressão mantidas. |
| core/components/payment/PixPayment.tsx | Catch seguro, catch sem variável não usada e aspas JSX escapadas, com o mesmo texto exibido. |
| app/(admin)/admin/etiquetas/page.tsx: dois avisos de callbacks | Ordenação das funções e dependências explícitas, sem alterar processamento. |
| app/(site)/sobre/page.tsx e core/components/admin/PageForm.tsx, PostForm.tsx: três avisos alt | Textos alternativos adicionados. |

Os 10 avisos restantes são exclusivamente no-img-element: etiquetas (1), sobre (1), ProductDetailClient (2), PageForm (1), PostForm (1), ProductForm (3), PixPayment (1). Preservados para evitar conversão precipitada de imagens remotas, prévias/blob, etiquetas e QR Code; não representam novos erros. Não foi adicionada funcionalidade para eliminar avisos.

## Pendências e riscos antes da distribuição

1. **Cobrança/reconciliação:** core/lib/payment-security.ts e APIs Asaas/Mercado Pago verificam assinatura, referência, valor e titularidade, com compare-and-set e reentrega sem novo efeito. Falta homologação dos provedores; não existe ledger persistente de tentativas/eventos. Timeout ambíguo ou cobrança simultânea ainda exige conciliação e testes de sandbox antes de ativação comercial. Testes simulados não validam isso em produção.
2. **Configuração externa obrigatória:** responsáveis devem confirmar configuração de autenticação e webhooks de cada provedor (nomes ASAAS_WEBHOOK_TOKEN e MERCADO_PAGO_WEBHOOK_SECRET), sem copiar segredos. Configuração ausente bloqueia webhook com 503. Alterações de módulos que interrompam vendas também bloqueiam webhooks; decidir encerramento/recebimento de cobranças pendentes antes de desligar checkout/loja.
3. **Estoque/frete:** reserva condicional transacional já testada por simulação, mas concorrência PostgreSQL real não verificada. Frete usa origem e embalagem fixas herdadas em app/api/frete/route.ts; confirmar contrato logístico de cada cliente. Não copiar pressupostos da matriz sem validação.
4. **Cartão:** titular diferente do comprador é bloqueado porque faltam dados próprios do titular no formulário. Decisão comercial e homologação necessárias; não foram inventados dados.
5. **Abuso e pedidos:** cookie temporário assinado restringe resultados, mas e-mail + CPF continua sendo o fator de consulta escolhido. Limitador em memória é por processo, não distribuído. Risco residual e revisão de implantação precisam ser aceitos sem mudar o fluxo nesta etapa.
6. **SEO:** conferir domínio, imagem Open Graph real e identidade verificada de cada cliente; não ativar LocalBusiness sem endereço confirmado. Publicação de produto é política editorial de SEO, não campo novo no banco nem bloqueio comercial. Serviços/projetos próprios não podem ser substituídos por listas vazias da matriz. HTML complexo exige revisão de conteúdo.
7. **PWA/performance:** preservar Serwist/páginas offline existentes; não instalar dois workers concorrentes no mesmo escopo. PWA simples da matriz não substitui automaticamente experiências melhores. Avaliar manifesto/ícones reais e limpeza de caches antigos. Layout público dinâmico e espera de metadados para 404 correto têm custo de cache/TTFB. Aviso de middleware depreciado é preexistente; troca para proxy foi adiada. Aviso de lockfile duplo decorreu da cópia isolada.
8. **Administração:** lista de pedidos ainda exibe só a primeira página sem controles visuais de filtro/paginação, problema preexistente; tratamento visual de falha/carregamento e teste de impressão física ficam pendentes. Não houve homologação visual completa nem verificação em produção.

## Comparação dos seis clientes

Comparação de 58 arquivos TS/TSX/MJS existentes em src/core da matriz, normalizando CRLF: contagens são indicador de divergência, não autorização de cópia nem auditoria de arquivos exclusivos do cliente. Todos declaram Next ^16.2.0 e Prisma ^7.8.0; lockfiles e resolução efetiva devem ser validados em cada atualização. Nenhum fetch foi feito; referências remotas podem estar desatualizadas.

| Cliente | Branch / upstream atual | Git local | Core iguais / diferentes / ausentes | Estratégia e configuração |
|---|---|---|---|---|
| Artesanaio | desenvolvimento / develop/develop | 17 modificados + SEO-IMPLEMENTACAO.md e src/client/seo/ novos | 18 / 20 / 20 | Preservar SEO local em andamento e PWA; adaptar guards/checkout e incorporar política editorial própria. Loja ativa. |
| Bittup | develop / develop/develop | Limpo | 17 / 21 / 20 | Piloto proposto. Loja ativa; serviços e portfólio ativos com dados existentes; preservar PWA e /processo. |
| E&L Vidraçaria | desenvolvimento / origin/desenvolvimento | Limpo | 17 / 24 / 17 | Loja e checkout desligados; adaptar store.enabled existente. Manter /projetos, serviços, SEO local, páginas institucionais e PWA. |
| Geicy Crochê | develop / sem upstream | package.json modificado; prisma/seed-admin-only.ts novo | 18 / 19 / 21 | Próxima após preservar trabalho local e definir upstream. Loja ativa; não executar/copiar seed. |
| Loja Teixeiras | develop / develop/develop | HomePage.tsx modificado + 6 componentes novos | 18 / 19 / 21 | Próxima após preservar home em andamento. Loja ativa; não sobrescrever componentes de atacado/identidade. |
| Maribela | desenvolvimento / sem upstream | Limpo | 20 / 24 / 14 | Preservar autorização existente e editorial catalog-seo.config.ts; adaptar somente diferenças verificadas. Loja ativa. |

Remotos verificados (HTTPS, sem credenciais):

| Cliente | origin | develop |
|---|---|---|
| Artesanaio | github.com/artesanaiosite/artesanaio.git | github.com/artesanaiosite/artesanaio-develop.git |
| Bittup | github.com/upnodebittup/bittup-upnode.git | github.com/upnodebittup/bittup-dev.git |
| E&L | github.com/lojageisabitt/elvidracaria.git | Não configurado |
| Geicy | github.com/geicycrochesite/geicycroche.git | github.com/geicycrochesite/geicycroche-develop.git |
| Loja Teixeiras | github.com/lojateixeirassite/lojaxeixeiras.git | github.com/lojateixeirassite/lojaxeixeiras-dev.git |
| Maribela | github.com/maribelasite/soumaribela.git | github.com/maribelasite/soumaribela-dev.git |

Branch e remoto são conceitos distintos: não criar desenvolvimento nem apontar upstream automaticamente nos clientes. Confirmar destino de Geicy/Maribela. Backups ficam fora do processo.

## Manifesto de distribuição: copiar, adaptar, preservar

**A — Cópia direta candidata, em todos os clientes:** novos helpers genéricos ausentes, como upnode-template/src/core/lib/auth-token.ts, request-security.ts, commerce-security.ts, payment-security.ts, module-config.ts, além de testes compatíveis. Comparar cada destino no momento da atualização: arquivo já existente com diferenças passa para B ou D. Copiar o conjunto de dependências necessário; nenhum helper isolado constitui atualização funcional. Não copiar toda src/core.

**B — Adaptação obrigatória, em todos:** middleware.ts; app/api/admin/**, api/orders/**, api/cloudinary/upload/route.ts, APIs de pagamentos/frete; core/lib/admin-access.ts e order-access.ts quando já presentes; páginas de checkout/pagamento e acesso aos pedidos; layouts de aliases /carrinho e /pedido; app/sitemap.ts, robots.ts e metadados. Novos tokens de frete, orderId na criação do pagador e autorização de pedidos exigem backend e consumidores atualizados juntos. PATCH antigo de customerId/status não pode continuar. SEO usa config/domínio do cliente. Não trocar package.json inteiro nem schema/migrations.

| Cliente | B: adaptações específicas | C/D: preservar arquivos e melhorias | E/F: configurações e conflitos |
|---|---|---|---|
| Artesanaio | Integrar helpers da matriz com src/core/lib/seo/generate-metadata.ts e metadados das páginas atuais | src/client/seo/metadata.ts, JsonLd.tsx; src/core/components/seo/schema.ts; alterações locais em sitemap/robots/next.config e home | Revisar SEO não commitado antes de distribuição; integrar flags à navegação e ao Serwist, sem apagar JSON-LD/editorial próprios. |
| Bittup | Ligar módulos às rotas próprias /servicos e /portfolio e ampliar sitemap com seus dados reais | src/client/services/ServicePage.tsx, services.config.ts; src/client/projects/*; páginas /processo e offline | Não substituir páginas por InstitutionalModule genérico; manter serviços/portfólio/PWA ativos e revisar cache financeiro no worker existente. |
| E&L | Migrar compatibilidade de siteConfig.store.enabled para modules.config.ts; mapear /projetos, guards e order-access existentes | src/client/projects/projects.data.ts; src/client/services/ServiceLandingPage.tsx; páginas /onde-atendemos, /duvidas-frequentes, /avaliacoes e SEO institucional | Loja false, checkout false; preservar módulos institucionais e rotas próprias no sitemap; confirmar situação de cobranças históricas antes de bloquear webhooks. |
| Geicy | Introduzir configs e SEO genéricos nas páginas atuais, mantendo marca/domínio | src/client/**, app/(site) personalizado; package.json local e prisma/seed-admin-only.ts | Mudança local de package adiciona seeda; não executar seed. Definir upstream e preservar alterações antes de qualquer troca de branch. Não ativar PWA sem opção explícita. |
| Loja Teixeiras | Mesma base genérica, adaptando navegação e metadados à home própria | src/client/home/HomePage.tsx e components/{Categories,FeaturedProducts,FinalCta,Hero,Wholesale,WhyChooseUs}.tsx | Conflitos locais bloqueiam substituição da home; manter atacado e módulos comerciais atuais. PWA não ativado automaticamente. |
| Maribela | Comparar admin-access e integrar request-security/JWT mais recentes; traduzir catálogo editorial para contratos genéricos | src/client/config/catalog-seo.config.ts; src/core/lib/seo.ts e páginas com política própria; proteção administrativa existente | Não ampliar allowlist nem remover exigência de estoque própria; confirmar branch/remoto. Preservar comportamento editorial mais restritivo e identidade. |

C comum: preservar src/client/**, public/**, estilos, conteúdo e páginas personalizadas; configs de marca/domínio; bancos e credenciais. D comum: reaproveitar o que estiver melhor no destino após revisão de comportamento, não apenas hashes. E comum: loja e checkout ativos nos cinco clientes comerciais, blog/serviços/portfólio/PWA conforme existência e configuração local confirmada — ausência de flag não autoriza desligamento. F comum: autenticação, checkout, webhooks e worker precisam ser distribuídos como conjuntos coerentes.

## Processo e sequência recomendados

1. Obter autorização por cliente. Revalidar Git, registrar estado/base local e preservar trabalho pendente com o responsável; não misturar alterações anteriores no commit da atualização. Confirmar branch de desenvolvimento real e remoto destinado a desenvolvimento.
2. Produzir manifesto de arquivos A/B/C/D com diff antes da escrita. Aplicar helpers e seus consumidores coerentes; adaptar flags e editorial local. Sem cópia cega, seeds, migrations, .env ou substituição de diretórios.
3. Validar por cliente TypeScript/lint/build isolado, testes de autorização/SEO/módulos e checkout simulado; verificar manualmente navegação, identidade, pedidos históricos e PWA. Homologar provedores em sandbox antes de uso comercial. Guardar commit separado por cliente; nenhum merge, push ou deploy automático. Reversão futura deve ser planejada por commit e configuração, sem apagar dados.
4. Sequência sugerida: **Bittup → Geicy → Loja Teixeiras → Maribela → Artesanaio → E&L**. Geicy/Teixeiras só entram após resolução do trabalho local; a ordem pode mudar conforme isso. Maribela requer conciliação editorial; Artesanaio tem SEO em edição; E&L testa o perfil institucional mais divergente.

**Piloto: Bittup.** Git limpo e upstream de desenvolvimento já definido permitem atribuir regressões à atualização e testar loja ativa. Tem 21 arquivos core diferentes contra 19 dos clientes mais próximos, mas estes têm mudanças pendentes. A personalização concentrada em src/client/services e projects deve ser preservada; PWA e sitemap são pontos de adaptação explícita, não motivos para substituição completa.

## Decisões humanas que bloqueiam a distribuição

- Autorizar início no piloto e confirmar seu perfil de módulos e provedor de teste.
- Confirmar preservação/commit das alterações locais de Artesanaio, Geicy e Loja Teixeiras e upstream pretendido de Geicy/Maribela.
- Responsáveis configurarem autenticação/webhooks e confirmarem logística/titularidade de cartão e pendências de cobrança, sem compartilhar segredos neste relatório.
- Decidir estratégia de PWA existente e aceitar ou corrigir riscos residuais de idempotência, limite por processo e testes de concorrência antes da liberação comercial.

Matriz preparada; **nenhuma atualização de cliente está autorizada por este relatório**. Aguardar autorização expressa para a próxima etapa.
