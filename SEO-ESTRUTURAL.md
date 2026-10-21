# Consolidação do SEO estrutural

Somente matriz, branch `desenvolvimento`. Clientes/backups, schema, migrations, bancos,
pagamentos e fluxos de autorização não foram alterados. Nenhum arquivo de ambiente foi
lido ou copiado. Não houve push, merge, deploy nem geração de artigos de produção.

## Comparação e reaproveitamento

| Origem | Constatação | Aproveitamento |
|---|---|---|
| Matriz | Sitemap já isolava falhas, respeitava módulos e deduplicava; robots já permitia ler noindex | Estrutura preservada e ampliada, sem reimplementar os bloqueios comerciais |
| Artesanaio | Canonical/metadados por registro, serialização segura e sitemap editorial; filtro de estoque era específico | Normalização e segurança reaproveitadas; estoque positivo virou opção, não imposição |
| Maribela | Product/BlogPosting/BreadcrumbList, PostSEO, consultas com React cache; marca/domínio e allowlist eram específicos | `seo-data.ts` copiado e ampliado; helpers/schema adaptados para identidade e política configuradas |
| E&L | Sitemap institucional tolerante a falhas, consciência da loja desativada, helpers genéricos de metadados | Contratos existentes preservados; sem copiar serviços, endereço, domínio ou conteúdo do cliente |

Não foram copiados dados empresariais, listas de produtos revisados, avaliações ou regras
comerciais de clientes. LocalBusiness não infere endereço/país a partir do campo `cidade`.

## Configuração e comportamento

- `src/client/config/seo.config.ts`: política editorial, overrides por slug/rota e identidade.
  Padrão: indexação habilitada, produtos elegíveis sem lista obrigatória e sem exigir estoque
  positivo. `products.mode = 'reviewed'` habilita uma allowlist própria do cliente.
- `requireInStock` e `requireImage` são opcionais. Campos insuficientes ou preço inválido
  impedem indexação/markup; Product JSON-LD só é emitido quando há imagem válida também.
- **O model Product não tem published.** `records.products[slug].published = false` retira
  elegibilidade de SEO; não altera estoque, catálogo, compra ou acesso ao produto. Não é ACL
  de publicação comercial. O fluxo continua funcionando com produto acessível e noindex.
- Artigos usam o `published` real do banco e os campos existentes de `PostSEO`. Override
  editorial pode retirar sua publicação pública ou apenas aplicar noindex. Projetos/serviços
  usam o campo opcional `published`; ausência preserva a publicação dos registros já existentes.
- Metadados próprios de produtos/categorias/artigos ficam nos mapas por slug; serviços/projetos
  também aceitam `entry.seo`. Páginas institucionais usam os registros CustomPage existentes.
- Canonical absoluto permanece na origem de `siteConfig.seo.url`, rejeita outra origem e
  credenciais na URL, remove query/hash e codifica slugs. OG/Twitter recebem título, descrição,
  imagem e URL próprios. A rota virtual `categoria/todos` permanece e aponta canonical à loja,
  com noindex; não cria uma categoria no banco.
- Categorias sem conteúdo elegível são noindex e não entram no sitemap. Registros inexistentes
  de produto/categoria/artigo/serviço/projeto usam `notFound`, inclusive na geração de metadados.
- Metadados são resolvidos antes do streaming (`htmlLimitedBots`) para evitar soft 404 de
  registros inexistentes. Isso pode aumentar o tempo até o primeiro byte em consultas lentas.
- Sitemap mantém fontes independentes e URLs estáticas mesmo quando uma consulta falha;
  publica somente páginas/serviços/projetos/artigos/produtos elegíveis dos módulos ativos.
  Datas são provenientes de `updatedAt`, nunca do relógio do build. Serviços/projetos só
  recebem lastModified se houver data ISO explícita válida. Carrinho, checkout, pedidos,
  administração, páginas noindex e fontes desativadas ficam fora.
- Robots preserva acesso às páginas operacionais para leitura de noindex. `/api/` continua
  disallow. Noindex em metadados complementa os cabeçalhos existentes; não substitui autenticação.

## Dados estruturados e conteúdo

- Organization/WebSite exigem `identity.verified = true` após conferir os dados reais do cliente.
  A matriz não emite identidade empresarial a partir de placeholders por padrão.
- LocalBusiness exige endereço explícito, que é exibido no contato do rodapé e usa a mesma
  identidade da organização. Não são inventados horários, coordenadas, telefone, avaliações,
  garantias ou faixa de preço. O rodapé recebe somente o endereço público, sem enviar os
  mapas editoriais completos ao componente do navegador.
- Product usa preço/estoque persistidos e disponibilidade correspondente, também exibida no
  detalhe. BlogPosting usa conteúdo publicado e data real de alteração; não transforma
  `createdAt` em data de publicação. Service usa título/descrição visíveis, sem preços presumidos.
- JSON-LD escapa fechamento de script e separadores Unicode. Breadcrumbs são visíveis e
  estruturados. Nenhum esquema de avaliações ou rating foi criado.
- Corpo de artigos/serviços preserva texto e suporta headings/links de HTML permitido e
  Markdown básico. Links perigosos, scripts e atributos de execução não são renderizados.
  `format: 'plain'` mantém conteúdo literalmente; HTML complexo exige revisão editorial.
- Relações com artigos/serviços/produtos são explícitas (`related`) e só geram links quando
  o registro existe, está publicado e seu módulo está ativo. Nenhuma relação foi inventada.
- O link padrão de contato, antes apontando a `/contato` inexistente, aponta à âncora real
  `/#contato`. Não foi criada uma página fictícia nem alterado URL válido de cliente.

## Validação

- **37 testes aprovados**, incluindo regressões de segurança/módulos, consulta e-mail + CPF,
  sitemap, robots, canonical, JSON-LD, publicação, política editorial, links seguros e 404.
- **TypeScript aprovado** com o Prisma real da matriz.
- **Build de produção Turbopack aprovado** com configuração padrão e Prisma original, em
  cópia isolada sem arquivos de ambiente e com URL de banco inacessível. Acesso adicional
  foi necessário apenas para baixar as fontes públicas já utilizadas pelo projeto.
- Segundo build com fixtures sintéticas validou HTML servido: **22 verificações HTTP
  aprovadas**, incluindo 404 reais, noindex em produtos/artigos/categorias/operações, canonical
  correto, Product/BlogPosting/Service/BreadcrumbList e filtros do sitemap. Não consultou banco.
- **Lint: 31 erros e 15 avisos preexistentes** (antes desta etapa: 32/15); comparação dos
  arquivos alterados sem novo apontamento. Diff sem erros de whitespace.
- Servidores e cópia temporária de validação são encerrados/removidos ao final. Nenhuma
  configuração sintética, identidade fictícia ou mock Prisma integra o código de produção.

## Antes da distribuição

1. Conferir domínio, identidade, imagens reais (inclusive o asset OG configurado), textos e
   política editorial de cada cliente. Não copiar a allowlist ou a identidade de outro projeto.
2. Validar amostras reais em desenvolvimento e nas ferramentas de resultados avançados e
   inspeção de URLs do Google. Testes locais não garantem indexação, rich results ou ranking.
3. Revisar conteúdo HTML/Markdown existente e vínculos relacionados. O renderer é limitado
   e seguro, sem suporte arbitrário a scripts, iframes, estilos ou widgets embutidos.
4. Medir custo das consultas de sitemap/metadados em catálogos grandes e o TTFB ao bloquear
   streaming de metadados. React cache evita repetir leituras na mesma renderização, sem
   criar cache público de pedidos nem cache permanente entre usuários.
5. Resolver lint remanescente e migração de middleware para proxy em etapa própria. Pendências
   financeiras/PWA anteriores continuam válidas. Não há alteração automática nos clientes.

## Arquivos

Núcleo: `src/core/lib/seo.ts`, `seo-data.ts`, `content-seo.ts`; configuração:
`src/client/config/seo.config.ts`, `content.config.ts` e link de contato em `site.config.ts`.
Componentes: `JsonLd`, `Breadcrumbs`, `ContentBody`, `RelatedContent`, `InstitutionalModule` e
endereço opcional no `Footer`. Rotas: sitemap/robots; metadados de home, sobre, personalizado,
loja, categorias, blog, artigos, serviços e portfólio; noindex nos layouts operacionais.
`next.config.ts` e `tests/security.test.mjs` completam a entrega. O diff do commit registra
os caminhos individuais; nenhum arquivo de comércio/autorização foi reescrito nesta etapa.
