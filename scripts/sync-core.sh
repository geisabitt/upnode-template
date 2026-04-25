#!/bin/bash
# ==============================================
# sync-core.sh
# Sincroniza src/core/ do template para os clientes
# USO: ./scripts/sync-core.sh
# ==============================================

TEMPLATE_REPO="https://github.com/geisabitt/upnode-template.git"
BRANCH="main"

# ⚠️ ADICIONE AQUI OS CAMINHOS LOCAIS DOS SEUS CLIENTES
CLIENTES=(
  # "/Users/voce/projetos/cliente-vidracaria"
  # "/Users/voce/projetos/cliente-petshop"
)

# Verifica se tem clientes cadastrados
if [ ${#CLIENTES[@]} -eq 0 ]; then
  echo "⚠️  Nenhum cliente cadastrado no script."
  echo "    Abra scripts/sync-core.sh e adicione os caminhos na lista CLIENTES."
  exit 1
fi

echo "🚀 Iniciando sync do core..."
echo ""

for CLIENTE_PATH in "${CLIENTES[@]}"; do
  NOME=$(basename "$CLIENTE_PATH")
  echo "📦 Cliente: $NOME"

  # Verifica se a pasta existe
  if [ ! -d "$CLIENTE_PATH" ]; then
    echo "  ❌ Pasta não encontrada: $CLIENTE_PATH"
    echo ""
    continue
  fi

  cd "$CLIENTE_PATH" || continue

  # Adiciona o remote do template se não existir
  if ! git remote get-url template &>/dev/null; then
    git remote add template "$TEMPLATE_REPO"
    echo "  ✅ Remote 'template' adicionado"
  fi

  # Busca atualizações
  git fetch template --quiet
  echo "  ✅ Fetch concluído"

  # Copia APENAS src/core/ — não toca em src/client/
  git checkout template/"$BRANCH" -- src/core/
  echo "  ✅ src/core atualizado"

  # Verifica se houve mudanças
  if git diff --cached --quiet; then
    echo "  ℹ️  Nenhuma mudança detectada"
    echo ""
    continue
  fi

  # Commita e faz push
  git commit -m "chore: sync core do template $(date +%Y-%m-%d)"
  git push origin "$BRANCH"
  echo "  🚀 Push feito!"
  echo ""
done

echo "✅ Sync finalizado!"